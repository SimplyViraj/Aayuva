import { ReactNode, useEffect, useState } from 'react';
import { StateNotice } from '../components/feedback/StateNotice';

export type BackendAccessDecision = 'allowed' | 'signedOut' | 'denied';
interface Props {
  checkAccess: () => Promise<BackendAccessDecision>;
  children: ReactNode;
}

// checkAccess must call the authoritative backend; token presence, decoded roles
// and provider SDK state are never a permission decision. Fixtures are test-only.
export function BackendAccessBoundary({ checkAccess, children }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    check: Props['checkAccess']; attempt: number;
    decision: BackendAccessDecision | 'failed';
  }>();
  const decision = result?.check === checkAccess && result.attempt === attempt ? result.decision : 'checking';

  useEffect(() => {
    let current = true;
    void Promise.resolve().then(checkAccess).then(
      (value) => { if (current) setResult({ check: checkAccess, attempt, decision: value }); },
      () => { if (current) setResult({ check: checkAccess, attempt, decision: 'failed' }); },
    );
    return () => { current = false; };
  }, [checkAccess, attempt]);

  if (decision === 'allowed') return <>{children}</>;
  if (decision === 'checking') return <StateNotice kind="loading" message="Checking access…" />;
  if (decision === 'signedOut') return <StateNotice kind="empty" message="Sign in to continue." />;
  if (decision === 'denied') return <StateNotice kind="denied" message="You do not have access." />;
  return <StateNotice kind="error" message="Access could not be checked. Please try again." onRetry={() => setAttempt((value) => value + 1)} />;
}
