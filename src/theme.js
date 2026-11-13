export const colors = {
  bg: '#0E0F1F',
  card: '#1A1C33',
  card2: '#252850',
  border: '#2C2F57',
  primary: '#7C5CFF',
  accent: '#FF5C8A',
  text: '#FFFFFF',
  muted: '#9A9CB8',
  success: '#2ECC71',
  danger: '#FF5C5C',
  star: '#FFC83D',
};

const GENRES = {
  'Sci-Fi': { color: '#3B82F6', icon: '🚀' },
  Action: { color: '#EF4444', icon: '💥' },
  Drama: { color: '#A855F7', icon: '🎭' },
  Thriller: { color: '#F97316', icon: '😱' },
  Crime: { color: '#64748B', icon: '🕵️' },
  Animation: { color: '#EC4899', icon: '✨' },
  Comedy: { color: '#EAB308', icon: '😂' },
  Fantasy: { color: '#10B981', icon: '🐉' },
};

export function getGenre(name) {
  return GENRES[name] || { color: colors.primary, icon: '🎬' };
}