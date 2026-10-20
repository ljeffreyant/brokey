import { Redirect } from 'expo-router';
import { useStore } from '../store';

export default function Index() {
  const onboarded = useStore((s) => s.settings.onboarded);
  return <Redirect href={onboarded ? '/home' : '/onboarding'} />;
}
