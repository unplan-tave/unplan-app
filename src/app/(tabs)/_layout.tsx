import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
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
      <Tabs.Screen
        name="settings-ui-primitives"
        options={{
          href: null,
          title: 'UI 컴포넌트',
        }}
      />
    </Tabs>
  );
}
