import { formatDateUTC } from '@/lib/utils'
import BudgetCard from '@/components/BudgetCard'
import Container from '@/components/Container'
import Section from '@/components/Section'
import SectionCard from '@/components/SectionCard'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/context/AuthContext'
import useBudgets from '@/hooks/useBudget'
import { ArrowLeftRightIcon, Info } from 'lucide-react-native'
import React, { useState } from 'react'
import { View } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'

export default function BudgetHistory() {
  const { user } = useAuth()
  const {
    pastBudgets,
    futureBudgets,
    currentBudget,
    isFetching,
    isRefetching,
  } = useBudgets(user ? user.uid : '')

  const [history, setHistory] = useState<'Pasados' | 'Futuros'>('Pasados')

  const stackedBars =
    pastBudgets?.map((budget) => {
      const fecha = formatDateUTC(budget.fechaInicio, {
        day: 'numeric',
        month: 'numeric',
      })

      const totalGastado = budget.PresupuestoCategoria?.reduce(
        (sum: number, cat: any) => sum + Number(cat.gastado),
        0,
      )

      const totalPresupuestado = budget.monto
      const exceso = Math.max(totalGastado - totalPresupuestado, 0)
      const dentroPresupuesto = Math.min(totalGastado, totalPresupuestado)

      return {
        stacks: [
          {
            value: dentroPresupuesto / 1000,
            color: '#4F46E5',
          },
          ...(exceso > 0
            ? [
                {
                  value: exceso / 1000,
                  color: 'darkred',
                },
              ]
            : []),
        ],
        label: fecha,
      }
    }) || []

  const promedioGastado =
    pastBudgets && pastBudgets.length > 0
      ? pastBudgets.reduce(
          (sum, budget) =>
            sum +
            budget.PresupuestoCategoria.reduce(
              (catSum: number, cat: any) => catSum + Number(cat.gastado),
              0,
            ),
          0,
        ) / pastBudgets.length
      : 0

  const promedioPresupuestado =
    pastBudgets && pastBudgets.length > 0
      ? pastBudgets.reduce((sum, d) => sum + d.monto, 0) / pastBudgets.length
      : 0

  const totalConExceso =
    pastBudgets?.filter((budget) => {
      const totalGastado = budget.PresupuestoCategoria?.reduce(
        (sum: number, cat: any) => sum + Number(cat.gastado),
        0,
      )
      return totalGastado > budget.monto
    }).length || 0

  const porcentajeConExceso =
    pastBudgets && pastBudgets.length > 0
      ? (totalConExceso / pastBudgets.length) * 100
      : 0

  return (
    <Container activity={isFetching || isRefetching}>
      <Section showWhen={pastBudgets && pastBudgets.length > 3}>
        <SectionCard items="center">
          <Text className="text-xl mb-2">Gasto total por presupuesto</Text>
          <BarChart
            stackData={stackedBars}
            isAnimated
            hideRules
            barWidth={26}
            spacing={30}
            yAxisThickness={0}
            xAxisThickness={0}
            xAxisLabelTextStyle={{ color: 'gray', fontSize: 12 }}
            yAxisTextStyle={{ color: 'gray', fontSize: 12 }}
            yAxisLabelSuffix="K"
            noOfSections={5}
            showReferenceLine1
            referenceLine1Position={promedioGastado / 1000}
            referenceLine1Config={{
              color: 'gray',
              dashWidth: 6,
              dashGap: 4,
              thickness: 2,
            }}
            showReferenceLine2
            referenceLine2Position={promedioPresupuestado / 1000}
            referenceLine2Config={{
              color: 'darkred',
              dashWidth: 6,
              dashGap: 4,
              thickness: 2,
            }}
          />
          <View className="flex-row gap-4">
            <View className="flex-row items-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'darkred' }}
              />
              <Text>Exceso</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#5046E4' }}
              />
              <Text>Presupuestado</Text>
            </View>
          </View>
          {porcentajeConExceso >= 50 && (
            <View className="flex-row gap-4 items-center w-full justify-center">
              <Info color="white" size={20} />
              <Text className="text-base flex-1">
                Tenés un exceso de gastos en el {porcentajeConExceso.toFixed(0)}
                % de tus presupuestos
              </Text>
            </View>
          )}
        </SectionCard>
      </Section>

      <Section showWhen={pastBudgets && pastBudgets.length > 3}>
        <SectionCard>
          <Text className="text-2xl">
            Gastaste un{' '}
            {((promedioGastado / promedioPresupuestado) * 100).toFixed(2)}% de
            lo presupuestado en promedio
          </Text>
          <View>
            <Text className="text-base text-muted-foreground">
              Promedio total gastado: $
              {promedioGastado.toLocaleString('es-AR', {
                maximumFractionDigits: 0,
              })}
            </Text>
            <Text className="text-base text-muted-foreground">
              Promedio total presupuestado: $
              {promedioPresupuestado.toLocaleString('es-AR', {
                maximumFractionDigits: 0,
              })}
            </Text>
          </View>
        </SectionCard>
      </Section>

      <Section
        title="Historial"
        actionText={history}
        actionIcon={ArrowLeftRightIcon}
        onActionPress={() => {
          history === 'Pasados' ? setHistory('Futuros') : setHistory('Pasados')
        }}
      >
        {history === 'Pasados'
          ? pastBudgets?.map((budget, index) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))
          : futureBudgets?.map((budget, index) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
      </Section>
    </Container>
  )
}
