import { ServiceUnavailableException } from '@nestjs/common';
import { providerObject } from './provider-response';

export interface PhoneVerificationResult { sid: string; serviceSid: string; phone: string; status: 'pending' | 'approved' }
export interface PhoneVerificationProvider {
  readonly serviceSid: string;
  send(phone: string): Promise<PhoneVerificationResult>;
  check(sid: string, phone: string, code: string): Promise<PhoneVerificationResult>;
  cancel(sid: string): Promise<void>;
}
export type ProviderFetch = (url: string, options: RequestInit) => Promise<Response>;

export class TwilioVerify implements PhoneVerificationProvider {
  readonly serviceSid: string;
  private readonly authorization: string;
  private readonly base: string;
  constructor(settings: { accountSid: string; authToken: string; serviceSid: string }, private readonly fetcher: ProviderFetch = fetch) {
    if (!/^AC[0-9a-fA-F]{32}$/.test(settings.accountSid) || !/^VA[0-9a-fA-F]{32}$/.test(settings.serviceSid) || !/^[0-9a-fA-F]{32}$/.test(settings.authToken)) throw new Error('Incomplete phone-provider configuration.');
    this.serviceSid = settings.serviceSid;
    this.base = 'https://verify.twilio.com/v2/Services/' + settings.serviceSid;
    this.authorization = 'Basic ' + Buffer.from(settings.accountSid + ':' + settings.authToken).toString('base64');
  }
  async send(phone: string): Promise<PhoneVerificationResult> {
    const result = await this.post('/Verifications', new URLSearchParams({ To: phone, Channel: 'sms' }));
    return this.result(result, phone);
  }
  async check(sid: string, phone: string, code: string): Promise<PhoneVerificationResult> {
    if (!/^VE[0-9a-fA-F]{32}$/.test(sid)) throw new ServiceUnavailableException();
    // Code is transient request data only. Never attach it to error/log metadata.
    const result = this.result(await this.post('/VerificationCheck', new URLSearchParams({ VerificationSid: sid, Code: code })), phone);
    if (result.sid !== sid) throw new ServiceUnavailableException();
    return result;
  }
  async cancel(sid: string): Promise<void> {
    if (!/^VE[0-9a-fA-F]{32}$/.test(sid)) throw new ServiceUnavailableException();
    const result = await this.post('/Verifications/' + sid, new URLSearchParams({ Status: 'canceled' }), true);
    if (result === null) return; // Provider documents removal on terminal/expired state.
    if (!this.isRecord(result) || result.sid !== sid || result.service_sid !== this.serviceSid || result.status !== 'canceled') throw new ServiceUnavailableException();
  }
  private async post(path: string, body: URLSearchParams, absentIsTerminal = false): Promise<unknown> {
    try {
      const response = await this.fetcher(this.base + path, {
        method: 'POST', headers: { Authorization: this.authorization, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(), signal: AbortSignal.timeout(10_000), redirect: 'error', cache: 'no-store',
      });
      if (absentIsTerminal && response.status === 404) return null;
      if (!response.ok) throw new ServiceUnavailableException();
      return await providerObject(response);
    } catch { throw new ServiceUnavailableException(); }
  }
  private result(value: unknown, phone: string): PhoneVerificationResult {
    if (!this.isRecord(value) || typeof value.sid !== 'string' || !/^VE[0-9a-fA-F]{32}$/.test(value.sid) || value.service_sid !== this.serviceSid || value.to !== phone || value.channel !== 'sms' || !['pending', 'approved'].includes(String(value.status))) throw new ServiceUnavailableException();
    return { sid: value.sid, serviceSid: this.serviceSid, phone, status: value.status as 'pending' | 'approved' };
  }
  private isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
}
