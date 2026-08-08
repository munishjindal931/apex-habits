import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAppData } from '../context/AppDataContext';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AddEditHabitScreen } from '../screens/AddEditHabitScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MinimalDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0B0E',
    card: '#0B0B0E',
    text: '#F4F4F5',
    border: '#1F1F24',
    primary: '#6366F1',
  },
};

export function RootNavigator() {
  const { settings, loaded } = useAppData();

  if (!loaded) return null;

  return (
    <NavigationContainer theme={MinimalDarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#0B0B0E' },
          headerTitleStyle: { color: '#F4F4F5', fontWeight: '700', fontSize: 17 },
          headerTintColor: '#6366F1',
          contentStyle: { backgroundColor: '#0B0B0E' },
          statusBarStyle: 'light',
        }}
      >
        {!settings.onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit Analytics' }} />
            <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress & Trends' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen
              name="AddEditHabit"
              component={AddEditHabitScreen}
              options={{ presentation: 'modal', title: 'New Habit' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
