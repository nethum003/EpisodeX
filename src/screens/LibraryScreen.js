import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDb } from '../database/db';
import Chip from '../components/Chip';
import TitleCard from '../components/TitleCard';
import { colors } from '../theme';

const TABS = [
  { key: 'plan', label: 'Plan', color: '#3B82F6' },
  { key: 'watching', label: 'Watching', color: '#F97316' },
  { key: 'completed', label: 'Completed', color: '#2ECC71' },
  { key: 'dropped', label: 'Dropped', color: '#FF5C5C' },
  { key: 'fav', label: '★ Favourites', color: '#E0A800' },
];

export default function LibraryScreen({ navigation }) {
  const [tab, setTab] = useState('plan');
  const [items, setItems] = useState([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const db = await getDb();
        const where = tab === 'fav' ? 'l.is_favourite = 1' : 'l.status = ?';
        const params = tab === 'fav' ? [] : [tab];
        setItems(
          await db.getAllAsync(
            `SELECT t.*, l.status, l.is_favourite, l.rating
             FROM library l JOIN titles t ON t.id = l.title_id
             WHERE ${where} ORDER BY l.added_at DESC`,
            params
          )
        );
      }
      load();
    }, [tab])
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {TABS.map((t) => (
          <Chip key={t.key} label={t.label} color={t.color} active={tab === t.key} onPress={() => setTab(t.key)} />
        ))}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing here yet.{'\n'}Add titles from Explore.</Text>
        }
        renderItem={({ item }) => (
          <TitleCard
            item={item}
            onPress={() => navigation.navigate('Details', { id: item.id })}
            subtitle={
              `${item.is_favourite ? '★ ' : ''}${item.year} · ${item.genre}` +
              (item.rating ? `  ·  ${item.rating}/5` : '')
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.bg },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 50, fontSize: 16, lineHeight: 24 },
});