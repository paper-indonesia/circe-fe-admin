"use client"

import type React from "react"
import { useEffect } from "react"
import { useAppStore } from "@/lib/store"

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Access the store directly to avoid hook dependency issues
    const { loadData } = useAppStore.getState()
    loadData()
  }, []) // Empty dependency array to prevent infinite loop

  return <>{children}</>
}
