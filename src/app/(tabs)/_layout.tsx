import { router, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GNB } from '@/components/ui/GNB';
import { spacing } from '@/constants/theme';

const TAB_GNB_VALUES: Record<string, string> = {
  index: 'home',
  schedule: 'list',
  condition: 'condition',
  settings: 'setting',
};

const GNB_ROUTES: Record<string, keyof typeof TAB_GNB_VALUES> = {
  home: 'index',
  list: 'schedule',
  condition: 'condition',
  setting: 'settings',
};

interface TabsGNBProps {
  state: {
    index: number;
    routes: Array<{ name: string }>;
  };
  navigation: {
    navigate: (routeName: string) => void;
  };
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabsGNB {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarLabel: '홈',
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: '일정',
          tabBarLabel: '일정',
        }}
      />
      <Tabs.Screen
        name="condition"
        options={{
          title: '컨디션',
          tabBarLabel: '컨디션',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarLabel: '설정',
        }}
      />
    </Tabs>
  );
}

function TabsGNB({ state, navigation }: TabsGNBProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name ?? 'index';
  const currentValue = TAB_GNB_VALUES[currentRoute] ?? 'home';

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.gnbLayer,
        {
          bottom: insets.bottom + spacing[2],
        },
      ]}
    >
      <GNB
        value={currentValue}
        onAddPress={() => router.push('/card/new')}
        onChange={(value) => {
          const routeName = GNB_ROUTES[value];

          if (routeName == null) return;
          navigation.navigate(routeName);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gnbLayer: {
    position: 'absolute',
    right: 0,
    left: 0,
    zIndex: 100,
    elevation: 100,
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
});
