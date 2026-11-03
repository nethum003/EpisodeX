import { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import { initDatabase, getDb } from './src/database/db';

export default function App() {
  const [titles, setTitles] = useState([]);

  useEffect(() => {
    async function load() {
      await initDatabase();
      const db = await getDb();
      const rows = await db.getAllAsync('SELECT * FROM titles');
      setTitles(rows);
    }
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>EpisodeX</Text>
      <FlatList
        data={titles}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.title} ({item.year}) - {item.type}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20, backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  item: { fontSize: 18, marginBottom: 10 },
});