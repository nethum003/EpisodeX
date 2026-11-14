import { useCallback, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { colors } from '../theme';

function Bar({ pct, color }) {
  return (
    <View style={styles.barBg}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

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
      style={{ backgroundColor: colors.bg }}
      sections={sections}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.overall}>{overallPct}% complete</Text>
          <Text style={styles.overallSub}>{watchedTotal} of {total} episodes watched</Text>
          <Bar pct={overallPct} color={colors.accent} />
        </View>
      }
      renderSectionHeader={({ section }) => {
        const pct = section.total ? Math.round((section.watched / section.total) * 100) : 0;
        return (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTop}>
              <Text style={styles.sectionTitle}>Season {section.season.season_number}</Text>
              <Text style={styles.sectionCount}>{section.watched}/{section.total} · {pct}%</Text>
            </View>
            <Bar pct={pct} color={colors.primary} />
          </View>
        );
      }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.episode} onPress={() => toggle(item)} activeOpacity={0.7}>
          <Text style={[styles.episodeText, item.watched === 1 && styles.episodeDone]}>
            Episode {item.episode_number}
          </Text>
                    <View style={[styles.check, item.watched === 1 && styles.checkDone]}>
            {item.watched === 1 && <Text style={styles.checkMark}>✓</Text>}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { padding: 20 },
  overall: { color: colors.text, fontSize: 30, fontWeight: 'bold' },
  overallSub: { color: colors.muted, marginBottom: 12, marginTop: 2 },
  barBg: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  sectionHeader: { backgroundColor: colors.card2, padding: 14, paddingHorizontal: 20 },
  sectionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
  sectionCount: { color: colors.muted },
  episode: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg,
  },
  episodeText: { color: colors.text, fontSize: 16 },
  episodeDone: { color: colors.muted, textDecorationLine: 'line-through' },
    check: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    borderColor: colors.muted, justifyContent: 'center', alignItems: 'center',
  },
  checkDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});