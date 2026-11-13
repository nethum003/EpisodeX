import { useEffect, useState } from 'react';
import {
  View, FlatList, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { getDb } from '../database/db';

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen({ navigation }) {
  const [titles, setTitles] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [genre, setGenre] = useState('all');
  const [year, setYear] = useState('');

  // Load the list of genres once
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

  // Re-run the query whenever search or a filter changes
  useEffect(() => {
    async function loadTitles() {
      const db = await getDb();
      let sql = 'SELECT * FROM titles WHERE title LIKE ?';
      const params = [`%${search.trim()}%`];

      if (type !== 'all') { sql += ' AND type = ?'; params.push(type); }
      if (genre !== 'all') { sql += ' AND genre = ?'; params.push(genre); }
      if (year.length === 4) { sql += ' AND year = ?'; params.push(Number(year)); }

      sql += ' ORDER BY title';
      const rows = await db.getAllAsync(sql, params);
      setTitles(rows);
    }
    loadTitles();
  }, [search, type, genre, year]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search by title..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.row}>
        <Chip label="All" active={type === 'all'} onPress={() => setType('all')} />
        <Chip label="Movies" active={type === 'movie'} onPress={() => setType('movie')} />
        <Chip label="TV Series" active={type === 'series'} onPress={() => setType('series')} />
        <TextInput
          style={styles.yearInput}
          placeholder="Year"
          keyboardType="number-pad"
          maxLength={4}
          value={year}
          onChangeText={setYear}
        />
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          <Chip label="All genres" active={genre === 'all'} onPress={() => setGenre('all')} />
          {genres.map((g) => (
            <Chip key={g} label={g} active={genre === g} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={titles}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.empty}>No titles found.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Details', { id: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.year} · {item.genre} · {item.type}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, fontSize: 16, marginBottom: 12,
  },
  row: { flexDirection: 'row', marginBottom: 10, flexGrow: 0 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: '#eee', marginRight: 8, alignSelf: 'flex-start',
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  yearInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
    paddingHorizontal: 14, width: 80, marginLeft: 'auto',
  },
  card: { padding: 16, backgroundColor: '#f2f2f2', borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 30, color: '#777' },
});