import { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { initDatabase } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((e) => console.error('DB init failed', e));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <AppNavigator />
    </>
  );
}