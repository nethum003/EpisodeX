import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, getGenre } from '../theme';

export default function TitleCard({ item, onPress, subtitle, footer }) {
  const g = getGenre(item.genre);
  const isMovie = item.type === 'movie';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.accent, { backgroundColor: g.color }]} />
      <View style={styles.body}>
        <Text style={[styles.type, { color: g.color }]}>{isMovie ? 'MOVIE' : 'TV SERIES'}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta}>{subtitle ?? `${item.year}  ·  ${item.genre}`}</Text>
        {footer}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: { width: 6 },
  body: { flex: 1, padding: 16 },
  type: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1.2, marginBottom: 4 },
  title: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
  meta: { color: colors.muted, fontSize: 14, marginTop: 6 },
});