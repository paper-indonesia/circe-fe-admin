"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'
import GradientLoading from './gradient-loading'
import { EmptyState } from './ui/empty-state'

interface DataWrapperProps {
  children: React.ReactNode
  isLoading: boolean
  isEmpty: boolean
  emptyState: {
    icon: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    secondaryActionLabel?: string
    onSecondaryAction?: () => void
    tips?: Array<{
      icon: LucideIcon
      title: string
      description: string
    }>
  }
}

export function DataWrapper({ children, isLoading, isEmpty, emptyState }: DataWrapperProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[600px] w-full items-center justify-center">
        <GradientLoading />
      </div>
    )
  }

  if (isEmpty) {
    return <EmptyState {...emptyState} />
  }

  return <>{children}</>
}