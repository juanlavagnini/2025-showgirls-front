import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Text } from '@/components/ui/text'
import { toastService } from '@/context/ToastContext'
import { auth } from '@/firebase.config'
import useBudgets from '@/hooks/useBudget'
import useBudgetsDetail from '@/hooks/useBudgetDetail'
import useCategories from '@/hooks/useCategories'
import useThemeColor from '@/theme/useThemeColor'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
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
  Switch,
} from 'react-native'
import Slider from '@react-native-community/slider'

const EditCategoryBudget = () => {
  const user = auth.currentUser
  const userId = user?.uid
  const router = useRouter()
  const navigation = useNavigation()
  const { budgetId, categoryId } = useLocalSearchParams()
  const { colorHex } = useThemeColor()

  const { budgetDetailData, refetch } = useBudgetsDetail(parseInt(budgetId as string))
  const { modifyBudgetCategory } = useBudgets(userId!)
  const { categoriesData } = useCategories()

  const [amountState, setAmountState] = useState<string>('')
  const [alertPercentage, setAlertPercentage] = useState<number>(80)
  const [isAlertEnabled, setIsAlertEnabled] = useState<boolean>(true)
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categoryIdNum = parseInt(categoryId as string)
  const categoryInfo = categoriesData?.find((c) => c.id === categoryIdNum)

  useEffect(() => {
    navigation.setOptions({
        headerRight: () => (
            <Button variant="ghost" onPress={onSubmit} disabled={isSubmitting}>
                <Text style={{ color: colorHex }} className="font-bold text-lg">Guardar</Text>
            </Button>
        ),
        title: 'Editar Categoría'
    })
  }, [navigation, amountState, alertPercentage, isAlertEnabled, isSubmitting, colorHex, budgetDetailData]) // Dependencies for header update

  useEffect(() => {
    if (budgetDetailData) {
      const categoryBudget = budgetDetailData.PresupuestoCategoria.find(
        (c) => c.categoriaId === categoryIdNum,
      )
      if (categoryBudget) {
        setAmountState(categoryBudget.monto.toString())
        if (categoryBudget.alerta !== undefined && categoryBudget.alerta === true) {
            setAlertPercentage(categoryBudget.limiteAlerta || 80)
            setIsAlertEnabled(true)
        } else {
            setAlertPercentage(80) 
            setIsAlertEnabled(false)
        }
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
      
      const categoryBudgetId = parseInt(budgetId as string);

      await modifyBudgetCategory({
        budgetId: categoryBudgetId,
        categoryId: categoryIdNum,
        body: {
          monto: Number(amountState),
          alerta: isAlertEnabled,
          limiteAlerta: isAlertEnabled ? alertPercentage : undefined,
        },
      })
      
      await refetch() // Ensure we have latest data before going back
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
                 <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">Alerta de consumo</Text>
                  <Switch
                      value={isAlertEnabled}
                      onValueChange={setIsAlertEnabled}
                      trackColor={{ false: '#767577', true: colorHex }}
                      thumbColor={isAlertEnabled ? '#f4f3f4' : '#f4f3f4'}
                  />
                </View>
                {isAlertEnabled && (
                    <>
                        <View className="flex-row justify-between">
                        <Text className="text-muted-foreground">Porcentaje</Text>
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
                    </>
                )}
              </View>

              {error ? <Text className="text-red-700 text-base">{error}</Text> : null}
            </CardContent>
          </Card>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default EditCategoryBudget
