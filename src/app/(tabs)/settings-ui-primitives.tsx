import { Redirect } from 'expo-router';

import { UiPrimitivesScreen } from '@/screens/dev/ui-primitives-screen';

export default function SettingsUiPrimitivesRoute() {
  if (!__DEV__) {
    return <Redirect href="/settings" />;
  }

  return <UiPrimitivesScreen />;
}
