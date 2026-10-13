import { ServiceUnavailableException } from '@nestjs/common';
import { isEmail } from 'class-validator';
import type { ProviderFetch } from './twilio-verify';
import { providerObject } from './provider-response';

export interface RegistrationEmailDelivery { send(email: string, token: string, authorizationId: string): Promise<void> }

export class ResendRegistrationEmail implements RegistrationEmailDelivery {
  private readonly link: URL;
  constructor(private readonly settings: { apiKey: string; sender: string; verificationUrl: string }, private readonly fetcher: ProviderFetch = fetch) {
    try { this.link = new URL(settings.verificationUrl); } catch { throw new Error('Incomplete email-provider configuration.'); }
    if (!settings.apiKey || /\s/.test(settings.apiKey) || !isEmail(settings.sender) || !['https:', 'aayuva:'].includes(this.link.protocol) || this.link.username || this.link.password || this.link.search || this.link.hash) throw new Error('Incomplete email-provider configuration.');
  }
  async send(email: string, token: string, authorizationId: string): Promise<void> {
    const link = new URL(this.link);
    // Configured application destination only; no request-selected host/redirect.
    link.searchParams.set('authorization', token);
    try {
      const response = await this.fetcher('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: 'Bearer ' + this.settings.apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'registration/' + authorizationId },
        body: JSON.stringify({ from: this.settings.sender, to: [email], subject: 'Verify your AAyuva email', text: 'Verify your email within five minutes:\n' + link.toString() + '\n\nIf you did not request this message, you can ignore it.' }),
        signal: AbortSignal.timeout(10_000), redirect: 'error', cache: 'no-store',
      });
      if (!response.ok) throw new ServiceUnavailableException();
      const value = await providerObject(response);
      if (typeof value.id !== 'string' || !value.id.length) throw new ServiceUnavailableException();
    } catch { throw new ServiceUnavailableException(); }
  }
}
