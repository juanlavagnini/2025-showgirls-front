import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { toastService } from '@/context/ToastContext'
import { auth } from '@/firebase.config'
import useBudgets from '@/hooks/useBudget'
import useBudgetsDetail from '@/hooks/useBudgetDetail'
import useCategories from '@/hooks/useCategories'
import useThemeColor from '@/theme/useThemeColor'
import { useLocalSearchParams, useRouter } from 'expo-router'
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
import Slider from '@react-native-community/slider'

const EditCategoryBudget = () => {
  const user = auth.currentUser
  const userId = user?.uid
  const router = useRouter()
  const { budgetId, categoryId } = useLocalSearchParams()
  const { colorHex } = useThemeColor()

  const { budgetDetailData } = useBudgetsDetail(parseInt(budgetId as string))
  const { modifyBudget } = useBudgets(userId!)
  const { categoriesData } = useCategories()

  const [amountState, setAmountState] = useState<string>('')
  const [alertPercentage, setAlertPercentage] = useState<number>(80)
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categoryIdNum = parseInt(categoryId as string)
  const categoryInfo = categoriesData?.find((c) => c.id === categoryIdNum)

  useEffect(() => {
    if (budgetDetailData) {
      const categoryBudget = budgetDetailData.PresupuestoCategoria.find(
        (c) => c.categoriaId === categoryIdNum,
      )
      if (categoryBudget) {
        setAmountState(categoryBudget.monto.toString())
        setAlertPercentage(categoryBudget.alerta || 80)
      }
    }
  }, [budgetDetailData, categoryIdNum])

  const onSubmit = async () => {
    if (!amountState || Number(amountState) <= 0) {
      setError('Ingresa un monto válido')
      return
    }
  
    if (!budgetDetailData) return
  
    try {
      setSubmitting(true)
      
      const updatedCategories = budgetDetailData.PresupuestoCategoria.map((c) => {
        if (c.categoriaId === categoryIdNum) {
          return {
            ...c,
            monto: Number(amountState),
            alerta: alertPercentage,
          }
        }
        return c
      })
  
      await modifyBudget({
        budgetId: parseInt(budgetId as string),
        body: {
          usuarioId: userId,
          fechaInicio: budgetDetailData.fechaInicio,
          fechaFin: budgetDetailData.fechaFin,
          monto: budgetDetailData.monto, // Assuming total budget amount is NOT automatically updated by category sum here, or handled by backend? 
          // Usually if budget is sum of categories, we might need to update total monto too. 
          // Let's assume we keep the categories array updated.
          PresupuestoCategoria: updatedCategories,
        },
      })
  
      toastService.show('Categoría actualizada', 'success')
      router.back()
    } catch (err) {
      console.log(err)
      toastService.show('Error al actualizar', 'error')
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
              <Text className="text-2xl font-bold" style={{ color: categoryInfo?.color || colorHex }}>
                {categoryInfo?.nombre || 'Editar Categoría'}
              </Text>

              <View className="w-full gap-2">
                 <Text className="text-muted-foreground">Límite de gasto</Text>
                 <View className="flex-row items-center justify-center gap-2 mb-4">
                    <Text style={{ color: colorHex }} className="text-3xl">
                      $
                    </Text>
                    <View
                      style={{ borderBottomColor: colorHex, borderBottomWidth: 2 }}
                      className="items-center justify-center w-[200px] h-[50px]"
                    >
                      <TextInput
                        style={{
                          fontSize: 32,
                          color: 'white',
                          textAlign: 'center',
                          width: '100%',
                          height: '100%',
                        }}
                        maxLength={9}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        value={amountState}
                        onChangeText={setAmountState}
                        placeholder="0"
                        placeholderTextColor="white"
                      />
                    </View>
                 </View>
              </View>

              <View className="w-full gap-4">
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Alerta de consumo</Text>
                  <Text className="font-bold text-lg">{alertPercentage.toFixed(0)}%</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={alertPercentage}
                  onValueChange={setAlertPercentage}
                  minimumTrackTintColor={categoryInfo?.color || colorHex}
                  maximumTrackTintColor="#FFFFFF"
                  thumbTintColor={categoryInfo?.color || colorHex}
                />
                <Text className="text-muted-foreground text-sm text-center">
                   Te avisaremos cuando alcances el {alertPercentage}% de tu presupuesto para esta categoría.
                </Text>
              </View>

              {error ? <Text className="text-red-700 text-base">{error}</Text> : null}

              <View className="flex-1" />

              <Button
                style={{ backgroundColor: colorHex }}
                className="w-full"
                onPress={onSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text className="text-white font-semibold">
                    Guardar Cambios
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

export default EditCategoryBudget
