import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="my-profile" />
      <Stack.Screen name="report-problem" />
    </Stack>
  );
}
