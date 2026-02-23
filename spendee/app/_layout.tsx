import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DeepLinkProvider } from '@/context/DeepLinkContext'
import { ToastProvider } from '@/context/ToastContext'
import '@/global.css'
import { ThemeProvider as DynamicColors } from '@/theme/themeContext'
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native'
import { PortalHost } from '@rn-primitives/portal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router, Stack, useSegments } from 'expo-router'
import React, { useEffect } from 'react'
import { useColorScheme } from 'react-native'

const queryClient = new QueryClient()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <DeepLinkProvider>
      <DynamicColors>
        <ThemeProvider value={theme}>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ToastProvider>
                <AuthGate />
              </ToastProvider>
            </QueryClientProvider>
            <PortalHost />
          </AuthProvider>
        </ThemeProvider>
      </DynamicColors>
    </DeepLinkProvider>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return

    const inAuth = segments[0] === 'sign-in' || segments[0] === 'sign-up'

    if (!user && !inAuth) {
      console.log('entre sign-in')
      router.replace('/sign-in')
    }

    if (user && inAuth) {
      router.replace('/(tabs)')
    }
  }, [user, loading, segments])

  return <RootNavigator />
}

function RootNavigator() {
  return (
    <Stack
      screenOptions={{ animation: 'ios_from_right', animationDuration: 300 }}
    >
      <Stack.Screen name="sign-in/index" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="alerts/index"
        options={{
          headerTitle: 'Alertas',
          headerBackVisible: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="developer-tools/index"
        options={{
          title: 'Herramientas de Desarrollador',
          headerBackTitle: 'Perfil',
        }}
      />

      <Stack.Screen
        name="edit-profile/index"
        options={{ title: 'Editar Perfil', headerBackTitle: 'Perfil' }}
      />

      <Stack.Screen
        name="edit-profile/change-password"
        options={{ title: 'Cambiar Contraseña', headerBackTitle: 'Volver' }}
      />

      <Stack.Screen name="category" options={{ headerShown: false }} />

      <Stack.Screen
        name="expense/index"
        options={{ title: 'Mis Gastos', headerBackTitle: 'Home' }}
      />

      <Stack.Screen
        name="expense/modal/add"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
        }}
      />

      <Stack.Screen
        name="expense/modal/add-service"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
        }}
      />

      <Stack.Screen
        name="expense/modal/workshops-list"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="expense/modal/services-list"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="expense/modal/categories-list"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="expense/categories-list"
        options={{
          headerTitle: 'Editar categoría',
          headerBackTitle: 'Atrás',
        }}
      />

      <Stack.Screen
        name="expense/[id]"
        options={{ title: 'Detalle del Gasto', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="expense/perCategory/[id]"
        options={{ title: 'Gastos por categoría', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="expense/historical-view"
        options={{ title: 'Evolución Mensual', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="expense/list"
        options={{ title: 'Historial de Gastos', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="income/modal/add"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5],
          sheetGrabberVisible: true,
        }}
      />

      <Stack.Screen
        name="income/modal/categories-list"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="budget/[id]"
        options={{
          title: 'Presupuesto',
          headerBackTitle: 'Atrás',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="budget/modal/add"
        options={{ title: 'Nuevo Presupuesto', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="budget/modal/category-picker"
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="budget/history"
        options={{
          title: 'Historial',
          headerBackTitle: 'Atrás',
          headerBackVisible: true,
        }}
      />

      <Stack.Screen
        name="budget/edit-budget"
        options={{ title: 'Editar Presupuesto', headerBackTitle: 'Atrás' }}
      />

      <Stack.Screen
        name="streak/index"
        options={{ title: 'Rachas', headerBackTitle: 'Atrás' }}
      />
    </Stack>
  )
}
