import { ServiceUnavailableException } from '@nestjs/common';

export async function providerObject(response: Response): Promise<Record<string, unknown>> {
  if (!response.body) throw new ServiceUnavailableException();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0; let done = false;
  try {
    while (!done) {
      const chunk = await reader.read(); done = chunk.done;
      if (chunk.value) {
        size += chunk.value.byteLength;
        if (size > 65_536) throw new ServiceUnavailableException();
        chunks.push(chunk.value);
      }
    }
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new ServiceUnavailableException();
    return value as Record<string, unknown>;
  } catch { throw new ServiceUnavailableException(); }
  finally {
    if (!done) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
