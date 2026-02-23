import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react-native"
import { useState } from "react"
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native"

function Input({
  className,
  placeholderClassName,
  secureTextEntry,
  ...props
}: TextInputProps & React.RefAttributes<TextInput>) {
  const [isPasswordVisible, setPasswordVisible] = useState(false)
  const isPasswordInput = secureTextEntry === true
  const Icon = isPasswordVisible ? EyeOff : Eye
  return (
    <View className='relative items-end justify-center '>
      <TextInput
        className={cn(
          "dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9",
          props.editable === false &&
            cn(
              "opacity-50",
              Platform.select({
                web: "disabled:pointer-events-none disabled:cursor-not-allowed",
              })
            ),
          Platform.select({
            web: cn(
              "placeholder:text-muted-foreground selection:bg-primary outline-none transition-[color,box-shadow] md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
            ),
            native: "placeholder:text-muted-foreground/50",
          }),
          className
        )}
        secureTextEntry={isPasswordInput ? !isPasswordVisible : false}
        {...props}
      />
      {isPasswordInput && (
        <View className='absolute p-4 z-100'>
          <Pressable onPress={() => setPasswordVisible((prev) => !prev)}>
            <Icon size={20} color='white' />
          </Pressable>
        </View>
      )}
    </View>
  )
}

export { Input }
