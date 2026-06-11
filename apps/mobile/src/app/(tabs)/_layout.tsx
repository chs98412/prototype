import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/lib/design';
import {
  HomeIcon, HomeFilledIcon,
  SearchIcon, BellIcon, BellFilledIcon, PersonIcon,
} from '@/components/ui/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.inkSoft,
        tabBarInactiveTintColor: '#666',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) =>
            focused ? <HomeFilledIcon color={color} /> : <HomeIcon color={color} />,
          tabBarLabel: '피드',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          tabBarLabel: '검색',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused, color }) =>
            focused ? <BellFilledIcon color={color} /> : <BellIcon color={color} />,
          tabBarLabel: '알림',
          tabBarBadge: undefined,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <PersonIcon color={color} />,
          tabBarLabel: '프로필',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 50,
    borderTopColor: 'rgba(199,199,199,0.6)',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
});
