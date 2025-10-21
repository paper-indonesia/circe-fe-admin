"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  show: boolean
  text?: string
  className?: string
}

export function LoadingOverlay({ show, text = "Loading", className }: LoadingOverlayProps) {
  if (!show) return null

  return (
    <div
      className={cn(
        "absolute inset-0 z-40",
        "flex flex-col items-center justify-center",
        "bg-white/80 backdrop-blur-sm",
        "pointer-events-none",
        className
      )}
      aria-label={text}
      role="status"
    >
      <div className="relative">
        {/* 2x2 Grid of animated boxes - smaller version */}
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="w-10 h-10 relative">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-xl blur-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFD6FF 0%, #C8B6FF 50%, #B8C0FF 100%)',
                  animation: `glow${index} 1.6s ease-in-out infinite`,
                  opacity: 0
                }}
              />

              {/* Background frame */}
              <div
                className="absolute inset-0 rounded-xl p-[2px]"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 182, 255, 0.3) 0%, rgba(184, 192, 255, 0.3) 100%)'
                }}
              >
                <div className="w-full h-full bg-white/50 backdrop-blur-sm rounded-lg" />
              </div>

              {/* Animated filled gradient */}
              <div
                className="absolute inset-0 rounded-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFD6FF 0%, #C8B6FF 50%, #B8C0FF 100%)',
                  animation: `fillBox${index} 1.6s ease-in-out infinite`,
                  boxShadow: '0 4px 16px rgba(200, 182, 255, 0.3)'
                }}
              />
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="mt-4 text-center">
          <p
            className="text-sm font-medium bg-gradient-to-r from-[#FFD6FF] via-[#C8B6FF] to-[#B8C0FF] bg-clip-text text-transparent"
            style={{
              animation: 'pulse-text 1.6s ease-in-out infinite'
            }}
          >
            {text}
          </p>
          <div className="flex justify-center items-center mt-1.5 gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#C8B6FF]"
                style={{
                  animation: `dot${i} 1.6s ease-in-out infinite`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fillBox0 {
          0% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          20% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          25% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          95%, 100% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
        }

        @keyframes fillBox1 {
          0%, 20% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          25% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          45% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          50%, 100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes fillBox2 {
          0%, 45% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          70% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes fillBox3 {
          0%, 70% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
          75% {
            opacity: 1;
            transform: scale(1.05) rotate(0deg);
          }
          95% {
            opacity: 0.8;
            transform: scale(1) rotate(5deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.85) rotate(0deg);
          }
        }

        @keyframes glow0 {
          0% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          20% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          25%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow1 {
          0%, 20% {
            opacity: 0;
            transform: scale(1);
          }
          25% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          45% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          50%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow2 {
          0%, 45% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          70% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          75%, 100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes glow3 {
          0%, 70% {
            opacity: 0;
            transform: scale(1);
          }
          75% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          95% {
            opacity: 0.3;
            transform: scale(1.1);
          }
          100% {
            opacity: 0;
            transform: scale(1);
          }
        }

        @keyframes pulse-text {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes dot0 {
          0%, 60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          20% {
            opacity: 1;
            transform: scale(1.2);
          }
          40% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes dot1 {
          0%, 60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          30% {
            opacity: 1;
            transform: scale(1.2);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes dot2 {
          0%, 50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
          60% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  )
}
