import { ServiceUnavailableException } from '@nestjs/common';
import { TwilioVerify, ProviderFetch } from '../src/modules/auth/providers/twilio-verify';
import { capabilityHash, issueCapability } from '../src/modules/auth/registration/capabilities';
import { ResendRegistrationEmail } from '../src/modules/auth/providers/resend-registration';

const serviceSid = 'VA' + 'a'.repeat(32); const sid = 'VE' + 'b'.repeat(32); const phone = '+919876543210';
const settings = { accountSid: 'AC' + 'c'.repeat(32), authToken: 'd'.repeat(32), serviceSid };
const result = { sid, service_sid: serviceSid, to: phone, channel: 'sms', status: 'pending' };
describe('Twilio adapter - DEV-013 / VAL-018 substitute evidence', () => {
  it('uses fixed TLS endpoints and returns only validated bound evidence', async () => {
    const fetcher = jest.fn<ReturnType<ProviderFetch>, Parameters<ProviderFetch>>().mockResolvedValue(new Response(JSON.stringify({ ...result, extraSecret: 'provider-canary' })));
    const provider = new TwilioVerify(settings, fetcher);
    expect(await provider.send(phone)).toEqual({ sid, serviceSid, phone, status: 'pending' });
    expect(fetcher).toHaveBeenCalledWith('https://verify.twilio.com/v2/Services/' + serviceSid + '/Verifications', expect.objectContaining({ method: 'POST', redirect: 'error', body: new URLSearchParams({ To: phone, Channel: 'sms' }).toString() }));
    fetcher.mockResolvedValue(new Response(JSON.stringify({ ...result, status: 'approved' })));
    expect(await provider.check(sid, phone, '123456')).toEqual({ sid, serviceSid, phone, status: 'approved' });
    expect(fetcher.mock.calls[1]?.[1].body).toBe('VerificationSid=' + sid + '&Code=123456');
  });
  it.each([{ to: '+919876543211' }, { service_sid: 'VA' + 'e'.repeat(32) }, { channel: 'call' }, { status: 'delivered' }, { sid: 'invalid' }])('rejects mismatched or indeterminate provider evidence', async (override) => {
    const provider = new TwilioVerify(settings, async () => new Response(JSON.stringify({ ...result, ...override })));
    await expect(provider.send(phone)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('does not disclose provider/network bodies and bounds decoded responses', async () => {
    const fetcher = jest.fn<ReturnType<ProviderFetch>, Parameters<ProviderFetch>>().mockRejectedValue(new Error('credential-secret-canary'));
    const provider = new TwilioVerify(settings, fetcher);
    await expect(provider.send(phone)).rejects.toThrow('Service Unavailable');
    fetcher.mockResolvedValue(new Response('credential-secret-canary', { status: 500 }));
    await expect(provider.send(phone)).rejects.toThrow('Service Unavailable');
    fetcher.mockResolvedValue(new Response(JSON.stringify({ ...result, huge: 'x'.repeat(65_536) })));
    await expect(provider.send(phone)).rejects.toThrow('Service Unavailable');
  });
  it('requires the checked SID and safely accepts cancellation only', async () => {
    const fetcher = jest.fn<ReturnType<ProviderFetch>, Parameters<ProviderFetch>>().mockResolvedValue(new Response(JSON.stringify({ ...result, sid: 'VE' + 'f'.repeat(32), status: 'approved' })));
    const provider = new TwilioVerify(settings, fetcher);
    await expect(provider.check(sid, phone, '123456')).rejects.toBeInstanceOf(ServiceUnavailableException);
    fetcher.mockResolvedValue(new Response('', { status: 404 }));
    await expect(provider.cancel(sid)).resolves.toBeUndefined();
    fetcher.mockResolvedValue(new Response(JSON.stringify({ ...result, status: 'pending' })));
    await expect(provider.cancel(sid)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

describe('Resend adapter - DEV-014, substitute evidence', () => {
  it('uses the configured sender/link, an idempotency key and no automatic retry', async () => {
    const fetcher = jest.fn<ReturnType<ProviderFetch>, Parameters<ProviderFetch>>().mockResolvedValue(new Response(JSON.stringify({ id: 'fixture-delivery' })));
    const provider = new ResendRegistrationEmail({ apiKey: 're_fixture_secret', sender: 'verify@example.test', verificationUrl: 'aayuva://verify-email' }, fetcher);
    await provider.send('member@example.test', 'opaque-token', 'fixture-id');
    const payload = JSON.parse(fetcher.mock.calls[0]![1].body as string) as { from: string; to: string[]; text: string };
    expect(payload.from).toBe('verify@example.test'); expect(payload.to).toEqual(['member@example.test']);
    expect(payload.text).toContain('aayuva://verify-email?authorization=opaque-token');
    expect(fetcher.mock.calls[0]![1].headers).toMatchObject({ 'Idempotency-Key': 'registration/fixture-id' });
    fetcher.mockRejectedValue(new Error('provider-secret-canary'));
    await expect(provider.send('member@example.test', 'opaque-token', 'fixture-id')).rejects.toThrow('Service Unavailable');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('rejects unsafe configured link destinations', () => {
    expect(() => new ResendRegistrationEmail({ apiKey: 'fixture', sender: 'verify@example.test', verificationUrl: 'https://user:password@example.test/verify' })).toThrow('Incomplete email-provider configuration.');
  });
});

describe('purpose-limited capabilities - R2-C', () => {
  it('issues unique opaque random credentials and separates verifiers by purpose', () => {
    const first = issueCapability('pending_registration'); const second = issueCapability('pending_registration');
    expect(first.token).toHaveLength(43); expect(first.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(first.token).not.toBe(second.token);
    expect(first.hash).not.toBe(capabilityHash('registration_email', first.token));
    expect(first.hash).not.toContain(first.token);
    expect(() => capabilityHash('pending_registration', 'invalid-secret-canary')).toThrow();
  });
});
