import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Button, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';

const STATUSES = [
  { key: 'plan', label: 'Plan to Watch' },
  { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' },
  { key: 'dropped', label: 'Dropped' },
];

export default function DetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [entry, setEntry] = useState(null); // row from the library table, or null
  const [reviewText, setReviewText] = useState('');

  const load = useCallback(async () => {
    const db = await getDb();
    const row = await db.getFirstAsync('SELECT * FROM titles WHERE id = ?', [id]);
    if (!row) return;
    const lib = await db.getFirstAsync('SELECT * FROM library WHERE title_id = ?', [id]);
    setItem(row);
    setEntry(lib);
    setReviewText(lib?.review ?? '');
    navigation.setOptions({ title: row.title });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Make sure a library row exists, then change one field in it
  async function updateField(field, value) {
    const db = await getDb();
    await db.runAsync(
      "INSERT OR IGNORE INTO library (title_id, status, added_at) VALUES (?, 'plan', ?)",
      [id, new Date().toISOString()]
    );
    await db.runAsync(`UPDATE library SET ${field} = ? WHERE title_id = ?`, [value, id]);
    await load();
  }

  async function removeFromLibrary() {
    const db = await getDb();
    await db.runAsync('DELETE FROM library WHERE title_id = ?', [id]);
    await load();
  }

  if (!item) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      <Text style={styles.section}>Status</Text>
      <View style={styles.row}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.chip, entry?.status === s.key && styles.chipActive]}
            onPress={() => updateField('status', s.key)}
          >
            <Text style={entry?.status === s.key ? styles.chipTextActive : styles.chipText}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!entry && <Text style={styles.hint}>Not in your library yet. Pick a status to add it.</Text>}

      <Text style={styles.section}>Favourite</Text>
      <Button
        title={entry?.is_favourite ? '★ Remove from favourites' : '☆ Add to favourites'}
        onPress={() => updateField('is_favourite', entry?.is_favourite ? 0 : 1)}
      />

      <Text style={styles.section}>Your rating</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => updateField('rating', n)}>
            <Text style={styles.star}>{entry?.rating >= n ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Your review</Text>
      <TextInput
        style={styles.review}
        placeholder="Write a short review..."
        multiline
        value={reviewText}
        onChangeText={setReviewText}
      />
      <Button title="Save review" onPress={() => updateField('review', reviewText)} />

      {entry && (
        <View style={{ marginTop: 24 }}>
          <Button title="Remove from library" color="#c0392b" onPress={removeFromLibrary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  meta: { fontSize: 16, color: '#555', marginBottom: 4 },
  desc: { fontSize: 16, marginVertical: 16 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 22, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, marginBottom: 8,
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  hint: { color: '#777', marginTop: 4 },
  star: { fontSize: 34, marginRight: 6, color: '#f5a623' },
  review: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, minHeight: 80, marginBottom: 10, textAlignVertical: 'top',
  },
});