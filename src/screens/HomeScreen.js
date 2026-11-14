import { useCallback, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import TitleCard from '../components/TitleCard';
import { colors } from '../theme';

function Section({ title, items, navigation, subtitleOf, showProgress }) {
  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      {items.length === 0 && <Text style={styles.empty}>Nothing here yet.</Text>}
      {items.map((item) => {
        const pct = item.total_eps ? (item.watched_eps / item.total_eps) * 100 : 0;
        return (
          <TitleCard
            key={item.id}
            item={item}
            subtitle={subtitleOf(item)}
            onPress={() => navigation.navigate('Details', { id: item.id })}
            footer={
              showProgress && item.type === 'series' ? (
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
              ) : null
            }
          />
        );
      })}
    </>
  );
}

export default function HomeScreen({ navigation }) {
  const [watching, setWatching] = useState([]);
  const [plan, setPlan] = useState([]);
  const [recent, setRecent] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const db = await getDb();
        setWatching(
          await db.getAllAsync(
            `SELECT t.*,
               (SELECT COUNT(*) FROM episodes e JOIN seasons s ON s.id = e.season_id
                 WHERE s.title_id = t.id) AS total_eps,
               (SELECT COUNT(*) FROM episodes e JOIN seasons s ON s.id = e.season_id
                 JOIN episode_progress p ON p.episode_id = e.id
                 WHERE s.title_id = t.id AND p.watched = 1) AS watched_eps
             FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.status = 'watching' ORDER BY l.added_at DESC`
          )
        );
        setPlan(
          await db.getAllAsync(
            `SELECT t.* FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.status = 'plan' ORDER BY l.added_at DESC LIMIT 5`
          )
        );
        setRecent(
          await db.getAllAsync(
            `SELECT t.* FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.status = 'completed' ORDER BY l.added_at DESC LIMIT 5`
          )
        );
      }
      load();
    }, [])
  );

  const basic = (i) => `${i.year}  ·  ${i.genre}`;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
      <Text style={styles.app}>Episode<Text style={{ color: colors.accent }}>X</Text></Text>
      <Text style={styles.tagline}>Track every movie and episode, offline.</Text>

      <Section
        title="Currently Watching"
        items={watching}
        navigation={navigation}
        showProgress
        subtitleOf={(i) =>
          i.type === 'series' ? `${i.watched_eps}/${i.total_eps} episodes watched` : basic(i)
        }
      />
      <Section title="Watchlist" items={plan} navigation={navigation} subtitleOf={basic} />
      <Section title="Recently Completed" items={recent} navigation={navigation} subtitleOf={basic} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Explore')}>
        <Text style={styles.buttonText}>Browse the catalogue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  app: { color: colors.text, fontSize: 34, fontWeight: 'bold' },
  tagline: { color: colors.muted, marginBottom: 6 },
  heading: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 22, marginBottom: 12 },
  empty: { color: colors.muted, marginBottom: 8 },
  barBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 14, marginTop: 26 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});