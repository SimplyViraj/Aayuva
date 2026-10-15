import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ApiClient, ApiError } from '../lib/api/client';
import { getMobileEnvironment } from '../lib/config';
import { pendingCredential, PendingCredential, pendingStorage, PendingStorage } from '../features/auth/services/pending-store';
import { registrationApi, RegistrationApi, RegistrationStatus } from '../features/auth/services/registration-api';

declare const process: { env: { EXPO_PUBLIC_API_TIMEOUT_MS?: string } };
export interface RegistrationSession {
  phase: 'loading' | 'none' | 'active' | 'unavailable'; status: RegistrationStatus | null; api: RegistrationApi | null;
  refresh(): Promise<void>; begin(issued: PendingCredential): Promise<void>; clear(): Promise<void>;
}
const Context = createContext<RegistrationSession | null>(null);
function nativeApi(token: string): RegistrationApi {
  const environment = getMobileEnvironment();
  const configured = process.env.EXPO_PUBLIC_API_TIMEOUT_MS;
  if (!configured || !/^\d+$/.test(configured)) throw new Error('Account setup configuration is unavailable.');
  // Deployment selects an explicit reviewed deadline. Test deadlines do not
  // become a production default, and it must allow the provider's own deadline.
  return registrationApi(new ApiClient(environment.apiBaseUrl, Number(configured)), token);
}

export function RegistrationProvider({ children, storage = pendingStorage, createApi = nativeApi }: {
  children: ReactNode; storage?: PendingStorage; createApi?: (token: string) => RegistrationApi;
}) {
  const [view, setView] = useState<Pick<RegistrationSession, 'phase' | 'status' | 'api'>>({ phase: 'loading', status: null, api: null });
  const revision = useRef(0); const mounted = useRef(true);
  const restore = useCallback(async (): Promise<void> => {
    const version = ++revision.current;
    if (mounted.current) setView({ phase: 'loading', status: null, api: null });
    try {
      const stored = await storage.read();
      if (!stored) { if (mounted.current && version === revision.current) setView({ phase: 'none', status: null, api: null }); return; }
      // Credential presence and client time never decide backend validity.
      const api = createApi(stored.token); const status = await api.status();
      if (mounted.current && version === revision.current) setView({ phase: 'active', status, api });
    } catch (error) {
      if (version !== revision.current || !mounted.current) return;
      if (error instanceof ApiError && error.code === 'unauthenticated') {
        try { await storage.clear(); } catch { if (version === revision.current && mounted.current) setView({ phase: 'unavailable', status: null, api: null }); return; }
        if (version === revision.current && mounted.current) setView({ phase: 'none', status: null, api: null });
      } else setView({ phase: 'unavailable', status: null, api: null });
    }
  }, [storage, createApi]);
  useEffect(() => {
    mounted.current = true; void restore();
    return () => { mounted.current = false; ++revision.current; };
  }, [restore]);
  const clear = useCallback(async (): Promise<void> => {
    const version = ++revision.current; setView({ phase: 'loading', status: null, api: null });
    try { await storage.clear(); if (mounted.current && version === revision.current) setView({ phase: 'none', status: null, api: null }); }
    catch { if (mounted.current && version === revision.current) setView({ phase: 'unavailable', status: null, api: null }); throw new Error('Account setup could not be cleared.'); }
  }, [storage]);
  const begin = useCallback(async (issued: PendingCredential): Promise<void> => {
    const version = ++revision.current; setView({ phase: 'loading', status: null, api: null });
    try { await storage.write(pendingCredential(issued)); if (mounted.current && version === revision.current) await restore(); }
    catch { if (mounted.current && version === revision.current) setView({ phase: 'unavailable', status: null, api: null }); throw new Error('Account setup could not be stored.'); }
  }, [storage, restore]);
  return <Context.Provider value={{ ...view, refresh: restore, begin, clear }}>{children}</Context.Provider>;
}
export function useRegistration(): RegistrationSession {
  const value = useContext(Context);
  if (!value) throw new Error('Account setup context is unavailable.');
  return value;
}
export function useOptionalRegistration(): RegistrationSession | null { return useContext(Context); }
