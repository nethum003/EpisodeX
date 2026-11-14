import { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import Chip from '../components/Chip';
import { colors, getGenre } from '../theme';
import { getPoster } from '../posters';

const STATUSES = [
  { key: 'plan', label: 'Plan to Watch', color: '#3B82F6' },
  { key: 'watching', label: 'Watching', color: '#F97316' },
  { key: 'completed', label: 'Completed', color: '#2ECC71' },
  { key: 'dropped', label: 'Dropped', color: '#FF5C5C' },
];

function Button({ label, onPress, color = colors.primary }) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [item, setItem] = useState(null);
  const [entry, setEntry] = useState(null);
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

  const g = getGenre(item.genre);
  const poster = getPoster(item.title);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
      <View style={[styles.hero, { backgroundColor: g.color }]}>
        {poster ? (
          <Image source={poster} style={styles.heroPoster} resizeMode="cover" />
        ) : (
          <Text style={styles.heroIcon}>{g.icon}</Text>
        )}
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>
        {item.year} · {item.genre} · {item.type === 'movie' ? 'Movie' : 'TV Series'}
        {item.duration_min ? ` · ${item.duration_min} min` : ''}
      </Text>
      <Text style={styles.desc}>{item.description}</Text>

      {item.type === 'series' && (
        <Button
          label="📺  Open Series Tracker"
          color={colors.accent}
          onPress={() => navigation.navigate('SeriesTracker', { id: item.id })}
        />
      )}

      <Text style={styles.section}>Status</Text>
      <View style={styles.row}>
        {STATUSES.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            color={s.color}
            active={entry?.status === s.key}
            onPress={() => updateField('status', s.key)}
          />
        ))}
      </View>
      {!entry && <Text style={styles.hint}>Not in your library yet. Pick a status to add it.</Text>}

      <Text style={styles.section}>Favourite</Text>
      <Button
        label={entry?.is_favourite ? '★  In your favourites' : '☆  Add to favourites'}
        color={entry?.is_favourite ? '#E0A800' : colors.card2}
        onPress={() => updateField('is_favourite', entry?.is_favourite ? 0 : 1)}
      />

      <Text style={styles.section}>Your rating</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => updateField('rating', n)}>
            <Text style={[styles.star, { color: entry?.rating >= n ? colors.star : colors.border }]}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>Your review</Text>
      <TextInput
        style={styles.review}
        placeholder="Write a short review..."
        placeholderTextColor={colors.muted}
        multiline
        value={reviewText}
        onChangeText={setReviewText}
      />
      <Button label="Save review" onPress={() => updateField('review', reviewText)} />

      {entry && (
        <View style={{ marginTop: 14 }}>
          <Button label="Remove from library" color={colors.danger} onPress={removeFromLibrary} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 60 },
  hero: { height: 280, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  heroIcon: { fontSize: 84 },
  heroPoster: { width: 160, height: 240, borderRadius: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20 },
  meta: { color: colors.muted, fontSize: 15, marginTop: 4, paddingHorizontal: 20 },
  desc: {
    color: colors.text, fontSize: 16, lineHeight: 23,
    margin: 20, marginBottom: 16, opacity: 0.85,
  },
  section: {
    color: colors.text, fontSize: 18, fontWeight: 'bold',
    marginTop: 22, marginBottom: 10, paddingHorizontal: 20,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 },
  hint: { color: colors.muted, paddingHorizontal: 20 },
  star: { fontSize: 38, marginRight: 8 },
  review: {
    color: colors.text, backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 14, minHeight: 90,
    marginHorizontal: 20, marginBottom: 12, textAlignVertical: 'top',
  },
  button: { marginHorizontal: 20, padding: 14, borderRadius: 14 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});