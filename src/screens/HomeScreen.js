import { useCallback, useState } from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';

function Section({ title, items, navigation, renderMeta }) {
  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      {items.length === 0 && <Text style={styles.empty}>Nothing here yet.</Text>}
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => navigation.navigate('Details', { id: item.id })}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text>{renderMeta(item)}</Text>
        </TouchableOpacity>
      ))}
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.app}>EpisodeX</Text>

      <Section
        title="Currently Watching"
        items={watching}
        navigation={navigation}
        renderMeta={(i) =>
          i.type === 'series'
            ? `${i.watched_eps}/${i.total_eps} episodes watched`
            : `${i.year} · ${i.genre}`
        }
      />
      <Section
        title="Watchlist"
        items={plan}
        navigation={navigation}
        renderMeta={(i) => `${i.year} · ${i.genre} · ${i.type}`}
      />
      <Section
        title="Recently Completed"
        items={recent}
        navigation={navigation}
        renderMeta={(i) => `${i.year} · ${i.genre} · ${i.type}`}
      />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Explore')}>
        <Text style={styles.buttonText}>Browse the catalogue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  app: { fontSize: 30, fontWeight: 'bold', marginBottom: 8 },
  heading: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  empty: { color: '#777', marginBottom: 8 },
  card: { padding: 14, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 17, fontWeight: 'bold', marginBottom: 2 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, marginTop: 24 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});