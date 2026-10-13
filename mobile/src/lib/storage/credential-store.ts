import * as SecureStore from 'expo-secure-store';

const CREDENTIAL_KEY = 'aayuva.refresh';
export interface SecureStorageAdapter {
  get(): Promise<string | null>;
  set(value: string): Promise<void>;
  remove(): Promise<void>;
}

const nativeStorage: SecureStorageAdapter = {
  get: () => SecureStore.getItemAsync(CREDENTIAL_KEY),
  set: (value) => SecureStore.setItemAsync(CREDENTIAL_KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  }),
  remove: () => SecureStore.deleteItemAsync(CREDENTIAL_KEY),
};

export class CredentialStorageError extends Error {
  constructor(readonly operation: 'read' | 'write' | 'clear') {
    super('Credential storage is unavailable.');
    this.name = 'CredentialStorageError';
  }
}

export class CredentialStore {
  private queue: Promise<void> = Promise.resolve();
  constructor(private readonly storage: SecureStorageAdapter = nativeStorage) {}

  read(): Promise<string | null> { return this.run('read', () => this.storage.get()); }
  write(value: string): Promise<void> {
    if (typeof value !== 'string' || !value.length) return Promise.reject(new CredentialStorageError('write'));
    return this.run('write', () => this.storage.set(value));
  }
  clear(): Promise<void> { return this.run('clear', () => this.storage.remove()); }

  private run<T>(operation: 'read' | 'write' | 'clear', action: () => Promise<T>): Promise<T> {
    const result = this.queue.then(async () => {
      try { return await action(); }
      catch { throw new CredentialStorageError(operation); }
    });
    // Preserve ordering after failures; the returned result still exposes failure.
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }
}
