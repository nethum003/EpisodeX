import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';

const TABS = [
  { key: 'plan', label: 'Plan' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'fav', label: '★ Favourites' },
];

export default function LibraryScreen({ navigation }) {
  const [tab, setTab] = useState('plan');
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const db = await getDb();
        const where = tab === 'fav' ? 'l.is_favourite = 1' : 'l.status = ?';
        const params = tab === 'fav' ? [] : [tab];
        const rows = await db.getAllAsync(
          `SELECT t.*, l.status, l.is_favourite, l.rating
           FROM library l JOIN titles t ON t.id = l.title_id
           WHERE ${where} ORDER BY l.added_at DESC`,
          params
        );
        setItems(rows);
      }
      load();
    }, [tab])
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, tab === t.key && styles.chipActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={tab === t.key ? styles.chipTextActive : styles.chipText}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Details', { id: item.id })}
          >
            <Text style={styles.title}>
              {item.is_favourite ? '★ ' : ''}{item.title}
            </Text>
            <Text>
              {item.year} · {item.genre} · {item.type}
              {item.rating ? `  ·  Rated ${item.rating}/5` : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, marginBottom: 8,
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  card: { padding: 16, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 30, color: '#777' },
});