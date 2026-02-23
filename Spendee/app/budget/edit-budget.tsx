import { getUTCDateAsLocal } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { toastService } from '@/context/ToastContext'
import { auth } from '@/firebase.config'
import useBudgets from '@/hooks/useBudget'
import useBudgetsDetail from '@/hooks/useBudgetDetail'
import usePiggy from '@/hooks/usePiggy'
import useThemeColor from '@/theme/useThemeColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ChevronDown } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import DateTimePicker, {
  DateType,
  useDefaultStyles,
} from 'react-native-ui-datepicker'

const EditBudget = () => {
  const user = auth.currentUser
  const userId = user?.uid
  const router = useRouter()
  const { budgetId } = useLocalSearchParams()
  const { updateObjective } = usePiggy()

  const { colorHex } = useThemeColor()

  const { budgetDetailData } = useBudgetsDetail(parseInt(budgetId as string))
  const { modifyBudget, budgetDates } = useBudgets(userId!)
  const { catValues } = useLocalSearchParams()

  const defaultStyles = useDefaultStyles()

  const [amountState, setAmountState] = useState<string>('')
  const [categoriesValues, setCategoriesValues] = useState<string | undefined>(
    undefined,
  )
  const [selectedRange, setSelectedRange] = useState<{
    startDate: DateType | null
    endDate: DateType | null
  }>({
    startDate: (budgetDetailData?.fechaInicio as DateType) || null,
    endDate: (budgetDetailData?.fechaFin as DateType) || null,
  })
  const [amountChanged, setAmountChanged] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (budgetDetailData) {
      setAmountState(budgetDetailData.monto.toString())

      setCategoriesValues(
        JSON.stringify(
          budgetDetailData.PresupuestoCategoria.map((c) => ({
            categoriaId: c.categoriaId,
            monto: c.monto,
          })),
        ),
      )

      setSelectedRange({
        startDate: budgetDetailData.fechaInicio,
        endDate: budgetDetailData.fechaFin,
      })
    }
  }, [budgetDetailData])
  useEffect(() => {
    if (catValues) {
      setCategoriesValues(catValues as string)
    }
  }, [catValues])

  const handleAmountChange = (value: string) => {
    setAmountState(value)

    if (!amountChanged) {
      setAmountChanged(true)
      setCategoriesValues(undefined)
    }
  }

  const onSubmit = async () => {
    if (!amountState || Number(amountState) <= 0) {
      setError('Ingresa un monto')
      return
    }

    if (!selectedRange.startDate || !selectedRange.endDate) {
      setError('Selecciona un rango de fechas')
      return
    }

    if (!categoriesValues) {
      setError('Selecciona las categorías')
      return
    }
    try {
      setSubmitting(true)
      await modifyBudget({
        budgetId: parseInt(budgetId as string),
        body: {
          usuarioId: userId,
          monto: Number(amountState),
          fechaInicio: new Date(selectedRange.startDate as string),
          fechaFin: new Date(selectedRange.endDate as string),
          PresupuestoCategoria: JSON.parse(categoriesValues),
        },
      })
      await updateObjective('budget_update')

      toastService.show('Presupuesto modificado con éxito', 'success')
      router.dismissAll()
      router.push('/budget/history')
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          scrollEnabled={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card className="bg-background w-full h-screen py-6 border-0">
            <CardContent className="gap-6 w-full h-full items-center">
              <View className="flex-row items-center justify-center gap-2">
                <Text style={{ color: colorHex }} className="text-3xl">
                  $
                </Text>
                <View
                  style={{ borderBottomColor: colorHex, borderBottomWidth: 2 }}
                  className="items-center justify-center w-[250px] h-[64px]"
                >
                  <TextInput
                    style={{
                      fontSize: 42,
                      color: 'white',
                      textAlign: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                    maxLength={9}
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={onSubmit}
                    onChangeText={handleAmountChange}
                    value={amountState}
                    placeholder="0"
                    placeholderTextColor="white"
                  />
                </View>
              </View>
              <View className="gap-2">
                <Button
                  variant="ghost"
                  className="gap-0"
                  disabled={!amountState}
                  onPress={() =>
                    router.push({
                      pathname: '/budget/modal/category-picker',
                      params: {
                        expense: amountState,
                        path: '/budget/edit-budget',
                        budgetId: budgetId,
                      },
                    })
                  }
                >
                  <Text className="text-base">Categoría: </Text>
                  {categoriesValues ? (
                    <Text className="text-base font-semibold">Asignadas</Text>
                  ) : (
                    <Text className="text-muted-foreground text-base">
                      Seleccionar
                    </Text>
                  )}
                  <ChevronDown color="white" size={18} />
                </Button>
                <DateTimePicker
                  mode="range"
                  startDate={selectedRange.startDate}
                  endDate={selectedRange.endDate}
                  onChange={({ startDate, endDate }) =>
                    setSelectedRange({ startDate, endDate })
                  }
                  styles={defaultStyles}
                  minDate={new Date()}
                  disabledDates={budgetDates}
                />
              </View>

              {error && <Text className="text-red-700 text-base">{error}</Text>}

              <Button
                style={{ backgroundColor: colorHex }}
                className="w-full"
                onPress={onSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-white font-semibold">
                    Editar presupuesto
                  </Text>
                )}
              </Button>
            </CardContent>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default EditBudget
