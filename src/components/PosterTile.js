import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { colors, getGenre } from '../theme';
import { getPoster } from '../posters';

const GAP = 12;
const PADDING = 16;
const WIDTH = (Dimensions.get('window').width - PADDING * 2 - GAP) / 2;

export default function PosterTile({ item, onPress }) {
  const g = getGenre(item.genre);
  const poster = getPoster(item.title);
  const isMovie = item.type === 'movie';
  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: g.color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {poster ? (
        <Image source={poster} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <>
          <View style={styles.circleBig} />
          <View style={styles.circleSmall} />
          <Text style={styles.emoji}>{g.icon}</Text>
        </>
      )}

      <View style={[styles.badge, { backgroundColor: isMovie ? colors.primary : colors.accent }]}>
        <Text style={styles.badgeText}>{isMovie ? 'MOVIE' : 'SERIES'}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.meta}>{item.year} · {item.genre}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: { width: WIDTH, height: WIDTH * 1.5, borderRadius: 16, overflow: 'hidden', marginBottom: GAP },
  circleBig: {
    position: 'absolute', width: WIDTH * 1.1, height: WIDTH * 1.1, borderRadius: WIDTH * 0.55,
    backgroundColor: 'rgba(255,255,255,0.14)', top: -WIDTH * 0.35, right: -WIDTH * 0.35,
  },
  circleSmall: {
    position: 'absolute', width: WIDTH * 0.6, height: WIDTH * 0.6, borderRadius: WIDTH * 0.3,
    backgroundColor: 'rgba(0,0,0,0.12)', bottom: WIDTH * 0.3, left: -WIDTH * 0.2,
  },
  emoji: { position: 'absolute', top: WIDTH * 0.32, width: '100%', textAlign: 'center', fontSize: 58 },
  badge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  bottom: {
    position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  title: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  meta: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
});