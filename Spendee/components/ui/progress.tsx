import { cn } from '@/lib/utils'
import * as ProgressPrimitive from '@rn-primitives/progress'
import { Platform, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated'

function Progress({
  className,
  value,
  indicatorClassName,
  color,
  progressiveColors = true,
  limitVal,
  ...props
}: ProgressPrimitive.RootProps &
  React.RefAttributes<ProgressPrimitive.RootRef> & {
    indicatorClassName?: string
    color?: string
    progressiveColors?: boolean
    limitVal?: number
  }) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'bg-primary/20 relative h-2 w-full overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <Indicator
        value={value}
        className={indicatorClassName}
        color={color}
        progressiveColors={progressiveColors}
      />
      {limitVal !== undefined && (
        <View
          className="absolute top-0 h-full w-[2px] bg-white z-10"
          style={{ left: `${limitVal}%` }}
        />
      )}
    </ProgressPrimitive.Root>
  )
}

export { Progress }

const Indicator = Platform.select({
  web: WebIndicator,
  native: NativeIndicator,
  default: NullIndicator,
})

type IndicatorProps = {
  value: number | undefined | null
  className?: string
  color?: string
  progressiveColors?: boolean
}

function WebIndicator({ value, className }: IndicatorProps) {
  if (Platform.OS !== 'web') {
    return null
  }

  return (
    <View
      className={cn('h-full w-full flex-1 transition-all', className)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
    >
      <ProgressPrimitive.Indicator className={cn('h-full w-full', className)} />
    </View>
  )
}

function NativeIndicator({
  value,
  className,
  color,
  progressiveColors,
}: IndicatorProps) {
  const progress = useDerivedValue(() => value ?? 0)

  const indicator = useAnimatedStyle(() => {
    return {
      width: withSpring(
        `${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
        { overshootClamping: true },
      ),
      backgroundColor:
        (progressiveColors &&
          value &&
          (value >= 100
            ? 'darkred'
            : value >= 75 && value < 100
              ? 'orange'
              : color)) ||
        color,
    }
  }, [value])

  if (Platform.OS === 'web') {
    return null
  }

  return (
    <ProgressPrimitive.Indicator asChild>
      <Animated.View
        style={indicator}
        className={cn('bg-foreground h-full', className)}
      />
    </ProgressPrimitive.Indicator>
  )
}

function NullIndicator(_props: IndicatorProps) {
  return null
}
