import Container from '@/components/Container'
import Dropdown from '@/components/Dropdown'
import IconButton from '@/components/IconButton'
import Section from '@/components/Section'
import SectionCard from '@/components/SectionCard'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/context/AuthContext'
import { toastService } from '@/context/ToastContext'
import useBudgets from '@/hooks/useBudget'
import useBudgetDetail from '@/hooks/useBudgetDetail'
import useCategories from '@/hooks/useCategories'
import { getIcon } from '@/lib/getIcon'
import { router, useGlobalSearchParams, useNavigation } from 'expo-router'
import { History, Pencil, Plus, Trash2 } from 'lucide-react-native'
import { useColorScheme } from 'nativewind'
import React, { useLayoutEffect } from 'react'
import { Alert, View } from 'react-native'

const Budget = () => {
  const { user } = useAuth()
  const { id } = useGlobalSearchParams()
  const { budgetDetailData, isRefetching, isFetching } = useBudgetDetail(
    Number(id),
  )
  const { deleteBudget, refetch } = useBudgets(user ? user.uid : '')
  const { categoriesData } = useCategories()

  const isCurrentBudget =
    new Date() >= new Date(budgetDetailData?.fechaInicio!) &&
    new Date() <= new Date(budgetDetailData?.fechaFin!)

  const isNotFuture =
    new Date(budgetDetailData?.fechaFin!) < new Date() ||
    (new Date() <= new Date(budgetDetailData?.fechaFin!) &&
      new Date() >= new Date(budgetDetailData?.fechaInicio!))

  const montoPresupuestado = budgetDetailData?.monto
  const montoTotalGastado = budgetDetailData?.PresupuestoCategoria.reduce(
    (acc, presupuestoCategoria) => acc + (presupuestoCategoria.gastado ?? 0),
    0,
  )
  const montoRestante = (
    (montoPresupuestado ?? 0) - (montoTotalGastado ?? 0)
  ).toLocaleString('es-AR')
  const fechaInicio = new Date(
    budgetDetailData?.fechaInicio!,
  ).toLocaleDateString(
    'es-ES',
    new Date(budgetDetailData?.fechaInicio!).getFullYear() ===
      new Date().getFullYear()
      ? { day: 'numeric', month: 'long' }
      : {},
  )
  const fechaFin = new Date(budgetDetailData?.fechaFin!).toLocaleDateString(
    'es-ES',
    new Date(budgetDetailData?.fechaInicio!).getFullYear() ===
      new Date().getFullYear()
      ? { day: 'numeric', month: 'long' }
      : {},
  )
  const porcentajePresupuesto =
    ((montoTotalGastado ?? 0) / (montoPresupuestado ?? 0)) * 100

  // Projection Logic
  const diasTotales =
    (new Date(budgetDetailData?.fechaFin!).getTime() -
      new Date(budgetDetailData?.fechaInicio!).getTime()) /
    (1000 * 3600 * 24)
  const diasTranscurridos =
    (new Date().getTime() -
      new Date(budgetDetailData?.fechaInicio!).getTime()) /
    (1000 * 3600 * 24)

  const diasTranscurridosReal =
    diasTranscurridos < 0 ? 0 : diasTranscurridos > diasTotales ? diasTotales : diasTranscurridos
  
  const gastoPromedioDiario = (montoTotalGastado ?? 0) / (diasTranscurridosReal || 1)
  const proyeccionGasto = gastoPromedioDiario * diasTotales

  // Proyeccion
  const presupuestoEsperadoAlMomento = (montoPresupuestado! / diasTotales) * diasTranscurridosReal
  
  const diferencia = (montoTotalGastado ?? 0) - presupuestoEsperadoAlMomento
  // diferencia > 0 => Gastando más de lo debido -> Adelantado
  // diferencia < 0 => Gastando menos de lo debido -> Atrasado

  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Dropdown
          width={200}
          data={
            !isNotFuture
              ? [
                  {
                    value: 'history',
                    label: 'Ver historial',
                    icon: History,
                    onPress: () => router.push('/budget/history'),
                  },
                  {
                    value: 'add',
                    label: 'Agregar',
                    icon: Plus,
                    onPress: () => router.push('/budget/modal/add'),
                  },
                  {
                    value: 'edit',
                    label: 'Editar',
                    icon: Pencil,
                    onPress: () => handleEditBudget(),
                  },
                  {
                    value: 'delete',
                    label: 'Eliminar',
                    icon: Trash2,
                    destructive: true,
                    onPress: () => handleDeleteBudget(),
                  },
                ]
              : [
                  {
                    value: 'history',
                    label: 'Ver historial',
                    icon: History,
                    onPress: () => router.push('/budget/history'),
                  },
                  {
                    value: 'add',
                    label: 'Agregar',
                    icon: Plus,
                    onPress: () => router.push('/budget/modal/add'),
                  },
                  {
                    value: 'delete',
                    label: 'Eliminar',
                    icon: Trash2,
                    destructive: true,
                    onPress: () => handleDeleteBudget(),
                  },
                ]
          }
          onChange={() => {}}
          type="button"
        />
      ),
    })
  }, [isNotFuture])

  async function handleEditBudget() {
    router.push({
      pathname: '/budget/edit-budget',
      params: { budgetId: id },
    })
  }

  async function handleDeleteBudget() {
    Alert.alert(
      '¿Estás seguro que deseas eliminar este presupuesto?',
      'Esta acción es IRREVERSIBLE',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(Number(id))
              refetch()
              router.dismissAll()
              router.push('/budget/history')
            } catch (error) {
              console.log(error)
              toastService.show('Error al eliminar presupuesto', 'error')
            }
          },
        },
      ],
    )
  }

  return (
    <Container activity={isRefetching || isFetching}>
      <Section>
        <SectionCard className="bg-transparent">
          <Text className="text-muted-foreground text-lg">
            {isCurrentBudget ? 'Llevás gastado' : 'Gastado'}
          </Text>
          <Text className="text-4xl font-semibold">
            ${montoTotalGastado?.toLocaleString('GB-gb')}
          </Text>
          <Text className="text-muted-foreground">
            {fechaInicio} - {fechaFin}
          </Text>
        </SectionCard>
        {isCurrentBudget && (
          <SectionCard>
              <View className="flex-row items-center justify-between w-full">
                  <View>
                      <Text className="text-muted-foreground">Proyección</Text>
                      <Text className="text-2xl font-semibold">${proyeccionGasto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</Text>
                  </View>
                  <View className="items-end">
                     {diferencia > 0 ? (
                        <Text className="text-red-500 font-bold">Adelantado (+${diferencia.toLocaleString('es-AR', { maximumFractionDigits: 0 })})</Text>
                     ) : (
                        <Text className="text-green-500 font-bold">Atrasado ({diferencia.toLocaleString('es-AR', { maximumFractionDigits: 0 })})</Text>
                     )}
                     <Text className="text-muted-foreground text-xs text-right max-w-[200px]">
                         {diferencia > 0 
                            ? "Estás gastando más rápido de lo planeado." 
                            : "Estás gastando a un buen ritmo."}
                     </Text>
                  </View>
              </View>
          </SectionCard>
        )}
      </Section>
      <Section>
        <SectionCard>
          <View className="flex-row justify-between w-full items-center">
            <View>
              <Text className="text-muted-foreground">Restante</Text>
              <Text
                className={`${porcentajePresupuesto >= 100 && 'text-red-800'}`}
              >
                ${montoRestante}
              </Text>
            </View>
            <Text
              className={`${porcentajePresupuesto >= 100 ? 'text-red-800' : porcentajePresupuesto >= 75 && porcentajePresupuesto < 100 ? 'text-orange-300' : ''} text-2xl`}
            >
              {porcentajePresupuesto.toFixed(0)}%
            </Text>
            <View>
              <Text className="text-muted-foreground">Presupuesto</Text>
              <Text>${montoPresupuestado?.toLocaleString('GB-gb')}</Text>
            </View>
          </View>
          <Progress
            value={porcentajePresupuesto}
            color={useColorScheme().colorScheme === 'dark' ? 'white' : 'black'}
          />
        </SectionCard>
        {budgetDetailData?.PresupuestoCategoria.map(
          (presupuestoCategoria, index) => {
            const categoriaId = presupuestoCategoria.categoriaId
            const montoCategoriaPresupuestado = presupuestoCategoria.monto
            const montoCategoriaGastado = presupuestoCategoria.gastado
            const porcentaje = presupuestoCategoria.porcentaje
            const alerta = presupuestoCategoria.alerta
            const limiteAlerta = presupuestoCategoria.limiteAlerta
            const categoria = categoriesData.find((c) => c.id === categoriaId)

            return (
              <SectionCard
                key={index}
                onPress={() =>
                  router.push({
                    pathname: '/budget/edit-category-budget',
                    params: { budgetId: id, categoryId: categoriaId },
                  })
                }
              >
                <View className="flex-row items-center justify-between w-full flex-1">
                  <View className="flex-row items-center gap-2 flex-1">
                    <IconButton
                      size="md"
                      text=""
                      icon={getIcon(categoria?.icono || 'ellipsis')}
                      iconColor={categoria?.color}
                    />
                    <Text
                      className="text-lg flex-1 max-w-[150px]"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {categoria?.nombre}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-lg text-muted-foreground">
                      ${montoCategoriaPresupuestado?.toLocaleString('es-AR')}
                    </Text>
                  </View>
                </View>
                <View className="w-full gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-semibold">
                      ${montoCategoriaGastado?.toLocaleString('es-AR')}
                    </Text>
                    <Text
                      className={`${
                        porcentaje >= 100
                          ? 'text-red-800'
                          : alerta &&
                              limiteAlerta &&
                              porcentaje >= limiteAlerta &&
                              porcentaje < 100
                            ? 'text-orange-300'
                            : ''
                      } font-bold`}
                    >
                      {porcentaje.toFixed(0)}%
                    </Text>
                    <Text className="font-semibold">
                      $
                      {(
                        montoCategoriaPresupuestado - montoCategoriaGastado
                      ).toLocaleString('es-AR')}
                    </Text>
                  </View>
                  <Progress
                    value={porcentaje}
                    color={categoria?.color}
                    limitVal={alerta ? limiteAlerta : undefined}
                  />
                </View>
              </SectionCard>
            )
          },
        )}
      </Section>
    </Container>
  )
}

export default Budget
