import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUTCDateAsLocal(dateString: string | Date | undefined) {
  if (!dateString) return undefined
  const date = new Date(dateString)
  return new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
}

export function formatDateUTC(dateString: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = getUTCDateAsLocal(dateString)
  if (!date) return ''
  return date.toLocaleDateString('es-ES', options)
}
