import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getDb } from '../database/db';

export default function DetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);

  useEffect(() => {
    async function load() {
      const db = await getDb();
      const row = await db.getFirstAsync('SELECT * FROM titles WHERE id = ?', [id]);
      setItem(row);
      navigation.setOptions({ title: row.title });
    }
    load();
  }, [id]);

  if (!item) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.year} · {item.genre} · {item.type}</Text>
      {item.duration_min ? <Text style={styles.meta}>{item.duration_min} minutes</Text> : null}
      <Text style={styles.desc}>{item.description}</Text>
      {item.type === 'series' && (
        <Button
          title="Open Series Tracker"
          onPress={() => navigation.navigate('SeriesTracker', { id: item.id })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  meta: { fontSize: 16, color: '#555', marginBottom: 4 },
  desc: { fontSize: 16, marginVertical: 16 },
});