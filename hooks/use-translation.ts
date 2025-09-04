import { useTheme } from "@/lib/theme-context"
import { getTranslation, Language } from "@/lib/translations"

export function useTranslation() {
  const { branding } = useTheme()
  
  const t = (path: string) => {
    return getTranslation(branding.language as Language, path)
  }
  
  return { t }
}