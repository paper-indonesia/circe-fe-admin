"use client"

import type React from "react"
import { useState, createContext, useContext } from "react"
import { Sidebar } from "./sidebar"
import { NavigationLoader } from "@/components/navigation-loader"

interface LayoutContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

const LayoutContext = createContext<LayoutContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export const useLayout = () => useContext(LayoutContext)

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved === 'true'
    }
    return false
  })

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', value.toString())
    }
  }

  return (
    <LayoutContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed }}>
      <NavigationLoader />
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          <main className="py-6 px-4 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}