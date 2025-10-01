"use client"

import type React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/lib/theme-context"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <head>
        <title>Reserva - Business Management Platform</title>
        <meta name="description" content="Complete booking and appointment management system for service-based businesses" />
        <meta name="generator" content="v0.app" />
        <link rel="icon" href="/reserva_logo.webp" />
        <link rel="shortcut icon" href="/reserva_logo.webp" />
        <link rel="apple-touch-icon" href="/reserva_logo.webp" />
      </head>
      <body>
        <AuthProvider>
          <AppProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
