import { Tabs } from 'expo-router'
import { Platform } from 'react-native'
import { Colors } from '../../lib/design'

// Minimal SVG-like icons via text for cross-platform compatibility
function HomeIcon({ color }: { color: string }) {
  const { View } = require('react-native')
  return (
    <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 18, height: 14, borderWidth: 1.5, borderColor: color, borderRadius: 2, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.inkSoft,
        tabBarInactiveTintColor: Colors.mute,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: 'rgba(199,199,199,0.6)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 56,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: '피드',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarLabel: '검색',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: '마이',
        }}
      />
    </Tabs>
  )
}
