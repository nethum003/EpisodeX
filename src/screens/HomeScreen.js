import { useCallback, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import { colors, TYPE_COLORS } from '../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function MiniCard({ item, meta, onPress }) {
  const c = TYPE_COLORS[item.type];
  return (
    <TouchableOpacity style={styles.mini} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.miniBar, { backgroundColor: c }]} />
      <Text style={[styles.miniType, { color: c }]}>
        {item.type === 'movie' ? 'MOVIE' : 'SERIES'}
      </Text>
      <Text style={styles.miniTitle} numberOfLines={3}>{item.title}</Text>
      <Text style={styles.miniMeta}>{meta}</Text>
    </TouchableOpacity>
  );
}

function Row({ title, items, navigation }) {
  if (items.length === 0) return null;
  return (
    <>
      <Text style={styles.heading}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {items.map((i) => (
          <MiniCard
            key={i.id}
            item={i}
            meta={`${i.year}  ·  ${i.genre}`}
            onPress={() => navigation.navigate('Details', { id: i.id })}
          />
        ))}
      </ScrollView>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [hero, setHero] = useState(null);
  const [next, setNext] = useState(null);
  const [alsoWatching, setAlsoWatching] = useState([]);
  const [plan, setPlan] = useState([]);
  const [recent, setRecent] = useState([]);
  const [counts, setCounts] = useState({ watching: 0, plan: 0, completed: 0, fav: 0, total: 0 });
  const [pick, setPick] = useState(null);

  const loadPick = useCallback(async () => {
    const db = await getDb();
    const row = await db.getFirstAsync(
      `SELECT * FROM titles
       WHERE id NOT IN (SELECT title_id FROM library)
       ORDER BY RANDOM() LIMIT 1`
    );
    setPick(row);
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const db = await getDb();

        // Series/movies being watched, most recent activity first
        const watching = await db.getAllAsync(
          `SELECT t.*,
             (SELECT COUNT(*) FROM episodes e JOIN seasons s ON s.id = e.season_id
               WHERE s.title_id = t.id) AS total_eps,
             (SELECT COUNT(*) FROM episodes e JOIN seasons s ON s.id = e.season_id
               JOIN episode_progress p ON p.episode_id = e.id
               WHERE s.title_id = t.id AND p.watched = 1) AS watched_eps,
             COALESCE(
               (SELECT MAX(p.watched_at) FROM episode_progress p
                 JOIN episodes e ON e.id = p.episode_id
                 JOIN seasons s ON s.id = e.season_id
                 WHERE s.title_id = t.id),
               l.added_at
             ) AS last_activity
           FROM library l JOIN titles t ON t.id = l.title_id
           WHERE l.status = 'watching'
           ORDER BY last_activity DESC`
        );
        const first = watching[0] || null;
        setHero(first);
        setAlsoWatching(watching.slice(1));

        // Next unwatched episode of the hero series
        if (first && first.type === 'series') {
          setNext(
            await db.getFirstAsync(
              `SELECT s.season_number, e.episode_number
               FROM episodes e
               JOIN seasons s ON s.id = e.season_id
               LEFT JOIN episode_progress p ON p.episode_id = e.id
               WHERE s.title_id = ? AND COALESCE(p.watched, 0) = 0
               ORDER BY s.season_number, e.episode_number LIMIT 1`,
              [first.id]
            )
          );
        } else {
          setNext(null);
        }

        setPlan(
          await db.getAllAsync(
            `SELECT t.* FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.status = 'plan' ORDER BY l.added_at DESC LIMIT 8`
          )
        );
        setRecent(
          await db.getAllAsync(
            `SELECT t.* FROM library l JOIN titles t ON t.id = l.title_id
             WHERE l.status = 'completed' ORDER BY l.added_at DESC LIMIT 8`
          )
        );

        const rows = await db.getAllAsync(
          'SELECT status, COUNT(*) AS c FROM library GROUP BY status'
        );
        const fav = await db.getFirstAsync(
          'SELECT COUNT(*) AS c FROM library WHERE is_favourite = 1'
        );
        const by = {};
        let total = 0;
        rows.forEach((r) => { by[r.status] = r.c; total += r.c; });
        setCounts({
          watching: by.watching || 0,
          plan: by.plan || 0,
          completed: by.completed || 0,
          fav: fav.c,
          total,
        });

        loadPick();
      }
      load();
    }, [loadPick])
  );

  const pct = hero && hero.total_eps ? Math.round((hero.watched_eps / hero.total_eps) * 100) : 0;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>{greeting()}</Text>
      <Text style={styles.app}>
        Episode<Text style={{ color: colors.accent }}>X</Text>
      </Text>

      {counts.total === 0 && (
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Start your collection</Text>
          <Text style={styles.welcomeText}>
            Browse the catalogue and add movies and series to your library. Your progress shows up here.
          </Text>
          <TouchableOpacity style={styles.welcomeBtn} onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.welcomeBtnText}>Browse the catalogue</Text>
          </TouchableOpacity>
        </View>
      )}

      {hero && (
        <TouchableOpacity
          style={[styles.hero, { backgroundColor: TYPE_COLORS[hero.type] }]}
          onPress={() => navigation.navigate('Details', { id: hero.id })}
          activeOpacity={0.9}
        >
          <Text style={styles.heroLabel}>CONTINUE WATCHING</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>{hero.title}</Text>

          {hero.type === 'series' ? (
            <>
              <Text style={styles.heroMeta}>
                {next
                  ? `Next: Season ${next.season_number}, Episode ${next.episode_number}`
                  : 'All episodes watched'}
              </Text>
              <View style={styles.heroBarBg}>
                <View style={[styles.heroBarFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.heroPct}>
                {hero.watched_eps} of {hero.total_eps} episodes  ·  {pct}%
              </Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => navigation.navigate('SeriesTracker', { id: hero.id })}
              >
                <Text style={[styles.heroBtnText, { color: TYPE_COLORS[hero.type] }]}>
                  Open tracker
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.heroMeta}>{hero.year}  ·  {hero.genre}</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.statsRow}>
        <Stat label="Watching" value={counts.watching} />
        <Stat label="Plan" value={counts.plan} />
        <Stat label="Completed" value={counts.completed} />
        <Stat label="Favourites" value={counts.fav} />
      </View>

      {pick && (
        <View style={styles.pick}>
          <Text style={styles.pickLabel}>PICK FOR TONIGHT</Text>
          <Text style={styles.pickTitle}>{pick.title}</Text>
          <Text style={[styles.pickMeta, { color: TYPE_COLORS[pick.type] }]}>
            {pick.type === 'movie' ? 'Movie' : 'TV Series'}  ·  {pick.year}  ·  {pick.genre}
          </Text>
          <Text style={styles.pickDesc} numberOfLines={2}>{pick.description}</Text>
          <View style={styles.pickButtons}>
            <TouchableOpacity
              style={[styles.pickBtn, { backgroundColor: TYPE_COLORS[pick.type] }]}
              onPress={() => navigation.navigate('Details', { id: pick.id })}
            >
              <Text style={styles.pickBtnText}>View details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffleBtn} onPress={loadPick}>
              <Text style={styles.shuffleText}>Shuffle</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Row title="Also Watching" items={alsoWatching} navigation={navigation} />
      <Row title="Watchlist" items={plan} navigation={navigation} />
      <Row title="Recently Completed" items={recent} navigation={navigation} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50 },
  greeting: { color: colors.muted, fontSize: 15 },
  app: { color: colors.text, fontSize: 36, fontWeight: 'bold', marginBottom: 18 },

  welcome: {
    backgroundColor: colors.card, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 18,
  },
  welcomeTitle: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
  welcomeText: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  welcomeBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 16 },
  welcomeBtnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  hero: { borderRadius: 22, padding: 22, marginBottom: 18 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 },
  heroTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 8, lineHeight: 38 },
  heroMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8 },
  heroBarBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4,
    marginTop: 16, overflow: 'hidden',
  },
  heroBarFill: { height: 8, backgroundColor: '#fff', borderRadius: 4 },
  heroPct: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 8 },
  heroBtn: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 20,
  },
  heroBtnText: { fontWeight: 'bold', fontSize: 15 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  stat: {
    width: '23.5%', backgroundColor: colors.card, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: colors.muted, fontSize: 11, marginTop: 2 },

  pick: {
    backgroundColor: colors.card, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginBottom: 6,
  },
  pickLabel: { color: colors.muted, fontSize: 12, fontWeight: 'bold', letterSpacing: 1.5 },
  pickTitle: { color: colors.text, fontSize: 26, fontWeight: 'bold', marginTop: 8 },
  pickMeta: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  pickDesc: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  pickButtons: { flexDirection: 'row', marginTop: 16 },
  pickBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, marginRight: 10 },
  pickBtnText: { color: '#fff', fontWeight: 'bold' },
  shuffleBtn: {
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18,
    borderWidth: 1, borderColor: colors.border,
  },
  shuffleText: { color: colors.text, fontWeight: '600' },

  heading: { color: colors.text, fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 12 },
  mini: {
    width: 150, minHeight: 130, backgroundColor: colors.card, borderRadius: 16,
    padding: 14, marginRight: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  miniBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  miniType: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1.2, marginTop: 4 },
  miniTitle: { color: colors.text, fontSize: 17, fontWeight: 'bold', marginTop: 6 },
  miniMeta: { color: colors.muted, fontSize: 12, marginTop: 8 },
});