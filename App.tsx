import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from './src/context/AppDataContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider style={{ backgroundColor: '#0B0B0E' }}>
      <AppDataProvider>
        <RootNavigator />
        <StatusBar style="light" backgroundColor="#0B0B0E" />
      </AppDataProvider>
    </SafeAreaProvider>
  );
}
