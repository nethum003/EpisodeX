import { useEffect, useState } from 'react';
import { View, FlatList, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { getDb } from '../database/db';
import Chip from '../components/Chip';
import PosterTile from '../components/PosterTile';
import { colors, getGenre } from '../theme';

export default function ExploreScreen({ navigation }) {
  const [titles, setTitles] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [genre, setGenre] = useState('all');
  const [year, setYear] = useState('');

  useEffect(() => {
    async function loadGenres() {
      const db = await getDb();
      const rows = await db.getAllAsync(
        'SELECT DISTINCT genre FROM titles WHERE genre IS NOT NULL ORDER BY genre'
      );
      setGenres(rows.map((r) => r.genre));
    }
    loadGenres();
  }, []);

  useEffect(() => {
    async function loadTitles() {
      const db = await getDb();
      let sql = 'SELECT * FROM titles WHERE title LIKE ?';
      const params = [`%${search.trim()}%`];
      if (type !== 'all') { sql += ' AND type = ?'; params.push(type); }
      if (genre !== 'all') { sql += ' AND genre = ?'; params.push(genre); }
      if (year.length === 4) { sql += ' AND year = ?'; params.push(Number(year)); }
      sql += ' ORDER BY title';
      setTitles(await db.getAllAsync(sql, params));
    }
    loadTitles();
  }, [search, type, genre, year]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={{ fontSize: 18 }}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Search movies & series..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.row}>
        <Chip label="All" active={type === 'all'} onPress={() => setType('all')} />
        <Chip label="Movies" active={type === 'movie'} onPress={() => setType('movie')} />
        <Chip label="TV Series" active={type === 'series'} onPress={() => setType('series')} color={colors.accent} />
        <TextInput
          style={styles.yearInput}
          placeholder="Year"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          maxLength={4}
          value={year}
          onChangeText={setYear}
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreRow}>
          <Chip label="All genres" active={genre === 'all'} onPress={() => setGenre('all')} />
          {genres.map((g) => (
            <Chip
              key={g}
              label={`${getGenre(g).icon} ${g}`}
              active={genre === g}
              color={getGenre(g).color}
              onPress={() => setGenre(g)}
            />
          ))}
        </ScrollView>
      </View>

      <Text style={styles.count}>{titles.length} titles</Text>

      <FlatList
        data={titles}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={styles.empty}>🔍 No titles found.</Text>}
        renderItem={({ item }) => (
          <PosterTile item={item} onPress={() => navigation.navigate('Details', { id: item.id })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: 14, paddingHorizontal: 14, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, color: colors.text, fontSize: 16, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  yearInput: {
    marginLeft: 'auto', width: 80, color: colors.text, textAlign: 'center',
    backgroundColor: colors.card, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, paddingVertical: 7,
  },
  genreRow: { flexGrow: 0 },
  count: { color: colors.muted, marginTop: 4, marginBottom: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40, fontSize: 16 },
});