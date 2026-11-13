import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initDatabase } from './src/database/db';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase()
  .then(() => setReady(true))
  .catch((e) => console.error('DB init failed', e));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}