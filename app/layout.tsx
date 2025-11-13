import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"

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

export const metadata: Metadata = {
  title: "Reserva - Business Management Platform",
  description: "Complete booking and appointment management system for service-based businesses",
  icons: {
    icon: "/reserva_logo.webp",
    shortcut: "/reserva_logo.webp",
    apple: "/reserva_logo.webp",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
