import { CredentialStorageError, CredentialStore, SecureStorageAdapter } from '../src/lib/storage/credential-store';
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(), setItemAsync: jest.fn(), deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
}));

it('serializes writes, reads and cleanup without deriving authentication', async () => {
  let value: string | null = null;
  const adapter: SecureStorageAdapter = {
    get: async () => value, set: async (next) => { value = next; }, remove: async () => { value = null; },
  };
  const store = new CredentialStore(adapter);
  await Promise.all([store.write('refresh-canary'), store.clear()]);
  expect(await store.read()).toBeNull();
});

it('sanitizes native failures and allows subsequent cleanup', async () => {
  const adapter: SecureStorageAdapter = {
    get: async () => { throw new Error('native-secret-canary'); },
    set: async () => { throw new Error('native-secret-canary'); }, remove: jest.fn().mockResolvedValue(undefined),
  };
  const store = new CredentialStore(adapter);
  await expect(store.read()).rejects.toThrow('Credential storage is unavailable.');
  await expect(store.write('refresh-canary')).rejects.toBeInstanceOf(CredentialStorageError);
  await store.clear();
  expect(adapter.remove).toHaveBeenCalledTimes(1);
});
