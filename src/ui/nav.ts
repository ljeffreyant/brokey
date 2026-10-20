import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/** Go back if there is somewhere to go back to, otherwise land on Home. Deep links open screens with no history. */
export function useLeave(): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }, [router]);
}
