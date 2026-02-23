import useAlerts from '@/hooks/useAlerts'
import { AppColor, AVAILABLE_COLORS } from '@/theme/colors'
import { Text } from '@/components/ui/text'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Progress } from '@/components/ui/progress'
import { getIcon } from '@/lib/getIcon'
import { useEffect } from 'react'

export default function AlertsScreen() {
  const { alertsData, isLoading, isRefetching, refetch, markAsSeen } =
    useAlerts()
  const router = useRouter()

  useEffect(() => {
    markAsSeen()
  }, [])

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['bottom', 'left', 'right']}
    >
      {isLoading ? (
        <ActivityIndicator className="mt-4" />
      ) : (
        <FlatList
          contentContainerClassName="p-6 pb-[120px] gap-4"
          data={alertsData || []}
          keyExtractor={(item) => String(item.categoria.id)}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-muted-foreground text-center">
                No tienes alertas activas en este momento.
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const Icon = getIcon(item.categoria.icono)
            const percentage = Math.min(
              100,
              Math.max(
                0,
                Math.round((item.gastadoAct / item.montoPresupuestado) * 100),
              ),
            )
            const remaining = item.montoPresupuestado - item.gastadoAct
            const alertLimit = item.limiteAlerta // Assuming limit is percentage (0-100)

            // Calculate status text
            let statusText = ''
            let statusColor = 'text-muted-foreground'

            if (percentage >= 100) {
              statusText = 'Presupuesto excedido'
              statusColor = 'text-red-500'
            } else if (alertLimit && percentage >= alertLimit) {
              statusText = 'Límite de alerta superado'
              statusColor = 'text-orange-500'
            } else {
              statusText = 'Dentro del límite'
              statusColor = 'text-green-500'
            }

            return (
              <View className="bg-card mb-4 rounded-3xl p-5 shadow-sm">
                <View className="mb-6 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        backgroundColor:
                          AVAILABLE_COLORS[item.categoria.color as AppColor] ||
                          item.categoria.color ||
                          '#3b82f6',
                      }}
                    >
                      <Icon size={24} color="black" />
                    </View>
                    <View>
                      <Text className="font-medium text-foreground text-lg">
                        {item.categoria.nombre}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text className="text-muted-foreground text-right text-xs font-medium">
                      Presupuesto
                    </Text>
                    <Text className="text-foreground text-right text-lg font-medium">
                      ${item.montoPresupuestado}
                    </Text>
                  </View>
                </View>

                <View className="mb-2 flex-row items-end justify-between">
                  <View>
                      <Text className="text-muted-foreground text-xs font-medium mb-1">
                        Gastado
                      </Text>
                      <Text className="text-foreground font-bold text-lg">
                        ${item.gastadoAct}
                      </Text>
                    </View>
                    <Text className={`font-medium text-sm mb-1 ${statusColor}`}>
                      {statusText}
                    </Text>
                    <View>
                      <Text className="text-right text-muted-foreground text-xs font-medium mb-1">
                        Restante
                      </Text>
                      <Text className="text-right text-muted-foreground font-medium text-lg">
                        ${remaining}
                      </Text>
                    </View>
                  </View>

                <Progress
                  value={percentage}
                  limitVal={alertLimit}
                  className="h-2.5 bg-secondary"
                  color={
                    AVAILABLE_COLORS[item.categoria.color as AppColor] ||
                    item.categoria.color
                  }
                />
              </View>
            )
          }}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  )
}
