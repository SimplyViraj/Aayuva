import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../lib/api/client';

export function useRegistrationOperation(identity: unknown) {
  const [feedback, setFeedback] = useState<{ identity: unknown; kind: 'loading' | 'error' | 'success'; message: string }>();
  const current = useRef(identity); const generation = useRef(0); const busy = useRef(false); const alive = useRef(true);
  if (current.current !== identity) { current.current = identity; generation.current++; busy.current = false; }
  useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++; }; }, []);
  async function run<T>(action: () => Promise<T>, success: string): Promise<T | undefined> {
    if (busy.current) return undefined;
    busy.current = true; const version = generation.current;
    setFeedback({ identity, kind: 'loading', message: 'Please wait…' });
    try {
      const result = await action();
      if (!alive.current || version !== generation.current) return undefined;
      setFeedback({ identity, kind: 'success', message: success }); return result;
    } catch (error) {
      if (alive.current && version === generation.current) setFeedback({ identity, kind: 'error', message: error instanceof ApiError ? error.message : 'Account setup could not be completed. Please refresh its status.' });
      return undefined;
    } finally { if (version === generation.current) busy.current = false; }
  }
  return { run, feedback: feedback?.identity === identity ? feedback : undefined, busy: feedback?.identity === identity && feedback.kind === 'loading' };
}
