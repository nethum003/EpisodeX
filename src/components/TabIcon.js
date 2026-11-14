import { View } from 'react-native';
import { colors } from '../theme';

export default function TabIcon({ name, color }) {
  if (name === 'home') {
    return (
      <View style={{ width: 24, height: 24, alignItems: 'center' }}>
        <View
          style={{
            width: 0, height: 0,
            borderLeftWidth: 12, borderRightWidth: 12, borderBottomWidth: 11,
            borderLeftColor: 'transparent', borderRightColor: 'transparent',
            borderBottomColor: color,
          }}
        />
        <View style={{ width: 17, height: 12, backgroundColor: color, alignItems: 'center' }}>
          <View
            style={{
              position: 'absolute', bottom: 0, width: 5, height: 7,
              backgroundColor: colors.card,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === 'explore') {
    return (
      <View style={{ width: 24, height: 24 }}>
        <View
          style={{
            position: 'absolute', left: 1, top: 1, width: 16, height: 16,
            borderRadius: 8, borderWidth: 2.5, borderColor: color,
          }}
        />
        <View
          style={{
            position: 'absolute', left: 15, top: 13, width: 3, height: 10,
            borderRadius: 2, backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
    );
  }

  if (name === 'library') {
    return (
      <View style={{ width: 24, height: 24, alignItems: 'center' }}>
        <View
          style={{
            width: 14, height: 20, backgroundColor: color,
            borderTopLeftRadius: 3, borderTopRightRadius: 3,
          }}
        >
          <View
            style={{
              position: 'absolute', left: 3, top: 16, width: 8, height: 8,
              backgroundColor: colors.card, transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      </View>
    );
  }

  // profile
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center' }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <View
        style={{
          width: 18, height: 9, marginTop: 2, backgroundColor: color,
          borderTopLeftRadius: 9, borderTopRightRadius: 9,
        }}
      />
    </View>
  );
}