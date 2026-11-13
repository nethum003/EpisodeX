import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';

const EPISODE_MINUTES = 45; // assumed length of one episode

function formatTime(min) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [genres, setGenres] = useState([]);
  const [reviews, setReviews] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const db = await getDb();

        const movies = await db.getFirstAsync(
          `SELECT COUNT(*) AS c, COALESCE(SUM(t.duration_min), 0) AS minutes
           FROM library l JOIN titles t ON t.id = l.title_id
           WHERE l.status = 'completed' AND t.type = 'movie'`
        );
        const series = await db.getFirstAsync(
          `SELECT COUNT(*) AS c FROM library l JOIN titles t ON t.id = l.title_id
           WHERE l.status = 'completed' AND t.type = 'series'`
        );
        const eps = await db.getFirstAsync(
          'SELECT COUNT(*) AS c FROM episode_progress WHERE watched = 1'
        );
        const watching = await db.getFirstAsync(
          "SELECT COUNT(*) AS c FROM library WHERE status = 'watching'"
        );
        const avg = await db.getFirstAsync(
          'SELECT AVG(rating) AS a, COUNT(rating) AS n FROM library WHERE rating IS NOT NULL'
        );

        setStats({
          movies: movies.c,
          series: series.c,
          episodes: eps.c,
          watching: watching.c,
          avgRating: avg.a ? avg.a.toFixed(1) : '-',
          ratedCount: avg.n,
          minutes: movies.minutes + eps.c * EPISODE_MINUTES,
        });

        setGenres(
          await db.getAllAsync(
            `SELECT t.genre, COUNT(*) AS c
             FROM library l JOIN titles t ON t.id = l.title_id
             WHERE t.genre IS NOT NULL
             GROUP BY t.genre ORDER BY c DESC LIMIT 3`
          )
        );

        setReviews(
          await db.getAllAsync(
            `SELECT t.id, t.title, l.rating, l.review
             FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.review IS NOT NULL AND l.review != ''`
          )
        );
      }
      load();
    }, [])
  );

  if (!stats) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Your Statistics</Text>
      <View style={styles.grid}>
        <Stat label="Movies watched" value={stats.movies} />
        <Stat label="Series completed" value={stats.series} />
        <Stat label="Episodes watched" value={stats.episodes} />
        <Stat label="Currently watching" value={stats.watching} />
        <Stat label={`Avg rating (${stats.ratedCount})`} value={stats.avgRating} />
        <Stat label="Est. watch time" value={formatTime(stats.minutes)} />
      </View>
      <Text style={styles.note}>
        Watch time counts movie durations plus {EPISODE_MINUTES} min per episode watched.
      </Text>

      <Text style={styles.heading}>Favourite Genres</Text>
      {genres.length === 0 && <Text style={styles.empty}>Add titles to your library first.</Text>}
      {genres.map((g) => (
        <Text key={g.genre} style={styles.line}>{g.genre} ({g.c})</Text>
      ))}

      <Text style={styles.heading}>My Reviews</Text>
      {reviews.length === 0 && <Text style={styles.empty}>No reviews yet.</Text>}
      {reviews.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.card}
          onPress={() => navigation.navigate('Details', { id: r.id })}
        >
          <Text style={styles.title}>
            {r.title}{r.rating ? `  ·  ${r.rating}/5` : ''}
          </Text>
          <Text>{r.review}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: {
    width: '48%', backgroundColor: '#f2f2f2', borderRadius: 10,
    padding: 14, marginBottom: 10,
  },
  statValue: { fontSize: 26, fontWeight: 'bold', color: '#2563eb' },
  statLabel: { color: '#555', marginTop: 2 },
  note: { color: '#777', fontSize: 12 },
  line: { fontSize: 16, marginBottom: 4 },
  empty: { color: '#777' },
  card: { padding: 14, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
});