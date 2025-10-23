"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
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

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  tips
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Icon className="h-12 w-12 text-[#8B5CF6]" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
            <span className="text-lg">✨</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-wrap gap-3 justify-center">
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90"
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button onClick={onSecondaryAction} variant="outline">
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}

        {tips && tips.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
            {tips.map((tip, index) => {
              const TipIcon = tip.icon
              const colors = [
                'bg-[#EDE9FE] text-[#8B5CF6]',
                'bg-pink-50 text-pink-600',
                'bg-blue-50 text-blue-600'
              ]
              return (
                <div key={index} className={`${colors[index % 3]} rounded-lg p-4 text-center`}>
                  <TipIcon className={`h-8 w-8 mx-auto mb-2 ${colors[index % 3].split(' ')[1]}`} />
                  <p className="font-semibold text-sm text-gray-900">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}