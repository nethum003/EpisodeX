import { useCallback, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';

export default function SeriesTrackerScreen({ route, navigation }) {
  const { id } = route.params;
  const [sections, setSections] = useState([]);
  const [total, setTotal] = useState(0);
  const [watchedTotal, setWatchedTotal] = useState(0);

  const load = useCallback(async () => {
    const db = await getDb();
    const title = await db.getFirstAsync('SELECT title FROM titles WHERE id = ?', [id]);
    if (title) navigation.setOptions({ title: title.title });

    const seasons = await db.getAllAsync(
      'SELECT * FROM seasons WHERE title_id = ? ORDER BY season_number',
      [id]
    );

    const result = [];
    let t = 0;
    let w = 0;
    for (const s of seasons) {
      const eps = await db.getAllAsync(
        `SELECT e.id, e.episode_number, COALESCE(p.watched, 0) AS watched
         FROM episodes e
         LEFT JOIN episode_progress p ON p.episode_id = e.id
         WHERE e.season_id = ?
         ORDER BY e.episode_number`,
        [s.id]
      );
      const watched = eps.filter((e) => e.watched === 1).length;
      t += eps.length;
      w += watched;
      result.push({ season: s, watched, total: eps.length, data: eps });
    }
    setSections(result);
    setTotal(t);
    setWatchedTotal(w);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Update the library status automatically from episode progress
  async function syncStatus(db) {
    const row = await db.getFirstAsync(
      `SELECT COUNT(*) AS total, COALESCE(SUM(p.watched), 0) AS watched
       FROM episodes e
       JOIN seasons s ON s.id = e.season_id
       LEFT JOIN episode_progress p ON p.episode_id = e.id
       WHERE s.title_id = ?`,
      [id]
    );
    if (row.watched === 0) return;
    const status = row.watched === row.total ? 'completed' : 'watching';
    await db.runAsync(
      'INSERT OR IGNORE INTO library (title_id, status, added_at) VALUES (?, ?, ?)',
      [id, status, new Date().toISOString()]
    );
    await db.runAsync('UPDATE library SET status = ? WHERE title_id = ?', [status, id]);
  }

  async function toggle(ep) {
    const db = await getDb();
    const newValue = ep.watched ? 0 : 1;
    await db.runAsync(
      'INSERT OR REPLACE INTO episode_progress (episode_id, watched, watched_at) VALUES (?, ?, ?)',
      [ep.id, newValue, newValue ? new Date().toISOString() : null]
    );
    await syncStatus(db);
    await load();
  }

  const overallPct = total ? Math.round((watchedTotal / total) * 100) : 0;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.overall}>
            Overall: {watchedTotal}/{total} episodes ({overallPct}%)
          </Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${overallPct}%` }]} />
          </View>
        </View>
      }
      renderSectionHeader={({ section }) => {
        const pct = section.total ? Math.round((section.watched / section.total) * 100) : 0;
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Season {section.season.season_number}</Text>
            <Text>{section.watched}/{section.total} watched ({pct}%)</Text>
          </View>
        );
      }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.episode} onPress={() => toggle(item)}>
          <Text style={styles.episodeText}>Episode {item.episode_number}</Text>
          <Text style={styles.check}>{item.watched ? '✅' : '⬜'}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { padding: 16 },
  overall: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  barBg: { height: 10, backgroundColor: '#ddd', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, backgroundColor: '#2563eb' },
  sectionHeader: { backgroundColor: '#e8eefc', padding: 12, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  episode: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff',
  },
  episodeText: { fontSize: 16 },
  check: { fontSize: 22 },
});