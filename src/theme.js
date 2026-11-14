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
  'Sci-Fi': '#3B82F6',
  Action: '#EF4444',
  Drama: '#A855F7',
  Thriller: '#F97316',
  Crime: '#64748B',
  Animation: '#EC4899',
  Comedy: '#EAB308',
  Fantasy: '#10B981',
};

export function getGenre(name) {
  return { color: GENRES[name] || colors.primary };
}