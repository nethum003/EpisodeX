import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { colors, getGenre } from '../theme';

const EPISODE_MINUTES = 45;

function formatTime(min) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function Stat({ icon, label, value, color }) {
  return (
    <View style={[styles.stat, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
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
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Your Statistics</Text>
      <View style={styles.grid}>
        <Stat icon="🎬" label="Movies watched" value={stats.movies} color="#3B82F6" />
        <Stat icon="🏆" label="Series completed" value={stats.series} color="#A855F7" />
        <Stat icon="📺" label="Episodes watched" value={stats.episodes} color={colors.accent} />
        <Stat icon="▶️" label="Currently watching" value={stats.watching} color="#F97316" />
        <Stat icon="⭐" label={`Avg rating (${stats.ratedCount})`} value={stats.avgRating} color={colors.star} />
        <Stat icon="⏱️" label="Est. watch time" value={formatTime(stats.minutes)} color={colors.success} />
      </View>
      <Text style={styles.note}>
        Watch time counts movie durations plus {EPISODE_MINUTES} min per episode watched.
      </Text>

      <Text style={styles.heading}>Favourite Genres</Text>
      {genres.length === 0 && <Text style={styles.empty}>Add titles to your library first.</Text>}
      {genres.map((g) => (
        <View key={g.genre} style={[styles.genreRow, { backgroundColor: getGenre(g.genre).color }]}>
          <Text style={styles.genreText}>{getGenre(g.genre).icon}  {g.genre}</Text>
          <Text style={styles.genreText}>{g.c}</Text>
        </View>
      ))}

      <Text style={styles.heading}>My Reviews</Text>
      {reviews.length === 0 && <Text style={styles.empty}>No reviews yet.</Text>}
      {reviews.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.card}
          onPress={() => navigation.navigate('Details', { id: r.id })}
        >
          <Text style={styles.cardTitle}>
            {r.title}{r.rating ? `  ·  ${'★'.repeat(r.rating)}` : ''}
          </Text>
          <Text style={styles.cardText}>{r.review}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: {
    width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 14,
    marginBottom: 12, borderLeftWidth: 4,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { color: colors.muted, marginTop: 2 },
  note: { color: colors.muted, fontSize: 12 },
  empty: { color: colors.muted },
  genreRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, marginBottom: 8,
  },
  genreText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardText: { color: colors.muted },
});