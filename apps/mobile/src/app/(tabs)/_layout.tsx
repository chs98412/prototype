import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0a0a0a',
        tabBarInactiveTintColor: '#999',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          borderBottomColor: '#f0f0f0',
          borderBottomWidth: 1,
        },
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            borderTopColor: '#f0f0f0',
            borderTopWidth: 1,
          },
          default: {
            borderTopColor: '#f0f0f0',
            borderTopWidth: 1,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: '홈',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabel: '검색',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: '프로필',
        }}
      />
    </Tabs>
  )
}
