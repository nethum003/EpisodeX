import { Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import LibraryScreen from '../screens/LibraryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SeriesTrackerScreen from '../screens/SeriesTrackerScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

const ICONS = {
  Home: '🏠',
  Explore: '🧭',
  'My Library': '📚',
  Profile: '👤',
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: 'bold' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{ICONS[route.name]}</Text>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="My Library" component={LibraryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen
          name="SeriesTracker"
          component={SeriesTrackerScreen}
          options={{ title: 'Series Tracker' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}