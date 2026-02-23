import { TabBar } from '@/components/TabBar'
import { useAuth } from '@/context/AuthContext'
import useThemeColor from '@/theme/useThemeColor'
import { router, Tabs } from 'expo-router'
import { Bell } from 'lucide-react-native'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import useAlerts from '@/hooks/useAlerts'

export default function TabsLayout() {
  const { user, loading } = useAuth()
  const { colorHex } = useThemeColor()
  const { unseenCount } = useAlerts()

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: `Hola ${!loading ? user?.displayName : 'Cargando...'}`,
          tabBarLabel: 'Home',
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/alerts')}
              className="mr-4 relative"
            >
              <Bell color={colorHex} size={24} />
              {unseenCount > 0 && (
                <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 border border-white" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="movements"
        options={{
          title: 'Historial de Movimientos',
          tabBarLabel: 'Historial',
        }}
      />
      <Tabs.Screen
        name="piggy"
        options={{
          title: 'Piggy',
          tabBarLabel: 'Piggy',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  )
}
