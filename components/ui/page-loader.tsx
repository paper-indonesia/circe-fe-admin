"use client"

import React from 'react'
import Image from 'next/image'

interface PageLoaderProps {
  text?: string
}

export function PageLoader({ text = "Loading" }: PageLoaderProps) {
  const [dots, setDots] = React.useState('')

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
      {/* Animated Logo */}
      <div className="relative">
        <div className="w-24 h-24">
          <Image
            src="/reserva_logo_only_loading.gif"
            alt="Loading..."
            width={96}
            height={96}
            unoptimized
            priority
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl opacity-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse" />
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center space-y-2 mt-6">
        <p className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {text}{dots}
        </p>
        <p className="text-xs text-muted-foreground">
          Please wait a moment
        </p>
      </div>

      {/* Progress indicator */}
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
        <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-loading" />
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        .animate-loading {
          animation: loading 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}