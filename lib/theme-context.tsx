"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type ThemeColor = "original" | "pink" | "blue" | "green" | "purple" | "gold"

interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  primaryRGB: string
  secondaryRGB: string
  accentRGB: string
}

const themes: Record<ThemeColor, ThemeConfig> = {
  original: {
    primary: "", // Will use CSS default
    secondary: "",
    accent: "",
    primaryRGB: "",
    secondaryRGB: "",
    accentRGB: ""
  },
  pink: {
    primary: "#EC4899",
    secondary: "#DB2777",
    accent: "#FDF2F8",
    primaryRGB: "236, 72, 153",
    secondaryRGB: "219, 39, 119",
    accentRGB: "253, 242, 248"
  },
  blue: {
    primary: "#3B82F6",
    secondary: "#2563EB",
    accent: "#EFF6FF",
    primaryRGB: "59, 130, 246",
    secondaryRGB: "37, 99, 235",
    accentRGB: "239, 246, 255"
  },
  green: {
    primary: "#10B981",
    secondary: "#059669",
    accent: "#F0FDF4",
    primaryRGB: "16, 185, 129",
    secondaryRGB: "5, 150, 105",
    accentRGB: "240, 253, 244"
  },
  purple: {
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#F5F3FF",
    primaryRGB: "139, 92, 246",
    secondaryRGB: "124, 58, 237",
    accentRGB: "245, 243, 255"
  },
  gold: {
    primary: "#F59E0B",
    secondary: "#D97706",
    accent: "#FFFBEB",
    primaryRGB: "245, 158, 11",
    secondaryRGB: "217, 119, 6",
    accentRGB: "255, 251, 235"
  }
}

interface BrandingSettings {
  logoUrl: string
  clinicName: string
  theme: ThemeColor
  language: string
}

interface ThemeContextType {
  branding: BrandingSettings
  updateBranding: (settings: Partial<BrandingSettings>) => void
  applyTheme: (theme: ThemeColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>({
    logoUrl: "",
    clinicName: "Beauty Clinic",
    theme: "original",
    language: "en"
  })

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem("brandingSettings")
    if (saved) {
      const settings = JSON.parse(saved)
      setBranding(settings)
      applyTheme(settings.theme)
    }
  }, [])

  const applyTheme = (theme: ThemeColor) => {
    const root = document.documentElement
    
    if (theme === "original") {
      // Reset to original theme by removing inline styles
      root.style.removeProperty("--primary")
      root.style.removeProperty("--secondary")
      root.style.removeProperty("--accent")
      root.style.removeProperty("--primary-rgb")
      root.style.removeProperty("--secondary-rgb")
      root.style.removeProperty("--accent-rgb")
      root.style.removeProperty("--primary-hsl")
      root.style.removeProperty("--secondary-hsl")
      root.style.removeProperty("--accent-hsl")
      return
    }
    
    const themeConfig = themes[theme]
    
    // Set CSS variables
    root.style.setProperty("--primary", themeConfig.primary)
    root.style.setProperty("--secondary", themeConfig.secondary)
    root.style.setProperty("--accent", themeConfig.accent)
    root.style.setProperty("--primary-rgb", themeConfig.primaryRGB)
    root.style.setProperty("--secondary-rgb", themeConfig.secondaryRGB)
    root.style.setProperty("--accent-rgb", themeConfig.accentRGB)
    
    // Update HSL values for better Tailwind integration
    if (theme === "pink") {
      root.style.setProperty("--primary-hsl", "330, 81%, 60%")
      root.style.setProperty("--secondary-hsl", "335, 78%, 48%")
      root.style.setProperty("--accent-hsl", "327, 73%, 97%")
    } else if (theme === "blue") {
      root.style.setProperty("--primary-hsl", "217, 91%, 60%")
      root.style.setProperty("--secondary-hsl", "221, 83%, 53%")
      root.style.setProperty("--accent-hsl", "214, 100%, 97%")
    } else if (theme === "green") {
      root.style.setProperty("--primary-hsl", "158, 64%, 52%")
      root.style.setProperty("--secondary-hsl", "160, 94%, 38%")
      root.style.setProperty("--accent-hsl", "138, 76%, 97%")
    } else if (theme === "purple") {
      root.style.setProperty("--primary-hsl", "263, 90%, 66%")
      root.style.setProperty("--secondary-hsl", "263, 83%, 58%")
      root.style.setProperty("--accent-hsl", "250, 100%, 98%")
    } else if (theme === "gold") {
      root.style.setProperty("--primary-hsl", "38, 92%, 50%")
      root.style.setProperty("--secondary-hsl", "32, 95%, 44%")
      root.style.setProperty("--accent-hsl", "48, 100%, 96%")
    }
  }

  const updateBranding = (settings: Partial<BrandingSettings>) => {
    const newBranding = { ...branding, ...settings }
    setBranding(newBranding)
    
    // Save to localStorage
    localStorage.setItem("brandingSettings", JSON.stringify(newBranding))
    
    // Apply theme if it changed
    if (settings.theme) {
      applyTheme(settings.theme)
    }
  }

  return (
    <ThemeContext.Provider value={{ branding, updateBranding, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}