import { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDb } from '../database/db';

export default function ExploreScreen({ navigation }) {
  const [titles, setTitles] = useState([]);

  useEffect(() => {
    async function load() {
      const db = await getDb();
      const rows = await db.getAllAsync('SELECT * FROM titles');
      setTitles(rows);
    }
    load();
  }, []);

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={titles}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Details', { id: item.id })}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text>{item.year} · {item.genre} · {item.type}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
});