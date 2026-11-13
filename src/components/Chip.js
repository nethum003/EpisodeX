import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Chip({ label, active, onPress, color = colors.primary }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    marginRight: 8, marginBottom: 8,
  },
  text: { color: colors.muted, fontWeight: '600' },
  textActive: { color: '#fff' },
});