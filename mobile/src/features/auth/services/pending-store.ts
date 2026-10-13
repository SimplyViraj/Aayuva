import * as SecureStore from 'expo-secure-store';
import { CredentialStore, CredentialStorageError } from '../../../lib/storage/credential-store';

export interface PendingCredential { token: string; expiresAt: string }
export interface PendingStorage { read(): Promise<PendingCredential | null>; write(value: PendingCredential): Promise<void>; clear(): Promise<void> }
const KEY = 'aayuva.registration';

export function pendingCredential(value: unknown): PendingCredential {
  if (typeof value !== 'object' || value === null || !('token' in value) || typeof value.token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value.token) || !('expiresAt' in value) || typeof value.expiresAt !== 'string' || !Number.isFinite(Date.parse(value.expiresAt))) throw new CredentialStorageError('read');
  return { token: value.token, expiresAt: value.expiresAt };
}
const native = new CredentialStore({
  get: () => SecureStore.getItemAsync(KEY),
  set: (value) => SecureStore.setItemAsync(KEY, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  remove: () => SecureStore.deleteItemAsync(KEY),
});
export const pendingStorage: PendingStorage = {
  read: async () => {
    const value = await native.read();
    if (value === null) return null;
    try { return pendingCredential(JSON.parse(value) as unknown); }
    catch { throw new CredentialStorageError('read'); }
  },
  write: async (value) => { await native.write(JSON.stringify(pendingCredential(value))); },
  clear: () => native.clear(),
};
