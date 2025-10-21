"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TNCSections } from "@/components/tnc-sections"

export default function TermsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container max-w-5xl mx-auto p-6 py-12">
        {/* Header */}
        <div className={`mb-8 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          <Link href="/signup">
            <Button variant="ghost" className="mb-6 gap-2 hover:gap-3 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
              <p className="text-gray-600 mt-1">Syarat & Ketentuan Penggunaan Platform Reserva</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Effective Date: January 2025</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
        </div>

        {/* Content Card */}
        <Card className={`border-0 shadow-xl ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-100`}>
          <div className="h-2 bg-gradient-to-r from-purple-600 to-pink-600" />
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-2xl">Syarat & Ketentuan Layanan</CardTitle>
            <CardDescription>
              Mohon baca dengan saksama sebelum menggunakan layanan kami. Dengan menggunakan Platform Reserva, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh isi dokumen ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[70vh] overflow-y-auto">
              <TNCSections />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className={`mt-8 text-center ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-200`}>
          <p className="text-sm text-gray-600 mb-4">
            Jika ada pertanyaan terkait Terms & Conditions ini, silakan hubungi kami:
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <a href="mailto:reservaofficialig@gmail.com" className="text-purple-600 hover:text-purple-700 font-semibold">
              reservaofficialig@gmail.com
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`mt-8 flex items-center justify-center gap-4 ${mounted ? 'animate-fadeIn' : 'opacity-0'} animate-delay-300`}>
          <Link href="/signin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
              I Accept - Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
