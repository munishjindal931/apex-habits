import { NavigationContainer } from '@react-navigation/native';
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

export function RootNavigator() {
  const { settings, loaded } = useAppData();

  if (!loaded) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F7' },
          headerTitleStyle: { color: '#1C1C1E' },
          contentStyle: { backgroundColor: '#F5F5F7' },
        }}
      >
        {!settings.onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="HabitDetail" component={HabitDetailScreen} options={{ title: 'Habit' }} />
            <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
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
