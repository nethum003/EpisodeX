import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, getGenre } from '../theme';
import { getPoster } from '../posters';

export default function TitleCard({ item, onPress, subtitle, footer }) {
  const g = getGenre(item.genre);
  const poster = getPoster(item.title);
  const isMovie = item.type === 'movie';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {poster ? (
        <Image source={poster} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={[styles.poster, styles.fallback, { backgroundColor: g.color }]}>
          <Text style={styles.icon}>{g.icon}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta}>{subtitle ?? `${item.year} · ${item.genre}`}</Text>
        <View style={[styles.tag, { backgroundColor: isMovie ? colors.primary : colors.accent }]}>
          <Text style={styles.tagText}>{isMovie ? 'MOVIE' : 'SERIES'}</Text>
        </View>
        {footer}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: 16,
    padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  poster: { width: 64, height: 96, borderRadius: 10 },
  fallback: { justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 30 },
  info: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  title: { color: colors.text, fontSize: 17, fontWeight: 'bold' },
  meta: { color: colors.muted, marginTop: 3, marginBottom: 8 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
});