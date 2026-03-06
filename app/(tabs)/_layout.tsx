import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="forgot-password" />
      <Tabs.Screen name="sign-in" />
      <Tabs.Screen name="sign-up" />
    </Tabs>
  );
}
