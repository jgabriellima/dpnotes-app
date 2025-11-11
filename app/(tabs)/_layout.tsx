import { Tabs } from 'expo-router';
import { Home, Tag, Settings } from 'lucide-react-native';
import { ProtectedRoute } from '../../src/components/auth/ProtectedRoute';

export default function TabsLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#ffccc3', // Primary color
          tabBarInactiveTintColor: '#6C6F7D', // Text secondary
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#ffe6e1',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="labels"
          options={{
            title: 'Labels',
            tabBarIcon: ({ color, size }) => <Tag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}

