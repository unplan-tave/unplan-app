import { Redirect } from 'expo-router';

import { UiPrimitivesScreen } from '@/screens/dev/ui-primitives-screen';

export default function SettingsUiPrimitivesRoute() {
  if (process.env.NODE_ENV === 'production') {
    return <Redirect href="/settings" />;
  }

  return <UiPrimitivesScreen />;
}
