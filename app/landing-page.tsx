"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, Calendar, Star, Sparkles, Heart, Award, CheckCircle, ArrowRight, TrendingUp, Clock, LogIn, UserPlus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Modern Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FCD6F5]/10 via-white to-[#C4B5FD]/10">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#8B5CF6]/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#A78BFA]/20 via-transparent to-transparent" />

        {/* Subtle Animated Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-[#8B5CF6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute top-[50%] right-[10%] w-80 h-80 bg-[#C4B5FD] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[10%] left-[30%] w-96 h-96 bg-[#FCD6F5] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#EDE9FE]/20 via-transparent to-[#FCD6F5]/20" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Enhanced Header with animation */}
        <div className={`text-center mb-16 ${mounted ? 'animate-fadeInDown' : 'opacity-0'}`}>
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 w-32 h-32 bg-[#EDE9FE] rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative">
              <img
                src="/reserva_logo.webp"
                alt="Reserva"
                className="h-24 w-24 object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="mb-6">
            <img
              src="/reserva_name.webp"
              alt="Reserva"
              className="h-20 md:h-24 mx-auto object-contain"
            />
          </div>

          <div className="relative">
            <p className="text-2xl text-gray-700 font-light tracking-wide flex items-center justify-center gap-3">
              <Heart className="w-6 h-6 text-[#FCD6F5] drop-shadow-sm" />
              <span className="text-gray-600">Management System</span>
              <Heart className="w-6 h-6 text-[#FCD6F5] drop-shadow-sm" />
            </p>
            <div className="mt-4 flex items-center justify-center gap-8 text-sm font-medium">
              <span className="text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                Trusted by 10,000+ Clients
              </span>
              <span className="text-gray-600 flex items-center gap-2">
                <Star className="w-4 h-4 fill-[#EC4899] text-[#EC4899]" />
                4.9/5 Rating
              </span>
              <span className="text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C4B5FD]" />
                Award Winning Service
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Login Access Card */}
          <div className={`mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#EDE9FE]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_70%)]" />
              </div>
              <CardHeader className="relative z-10 p-8">
                <div className="text-center">
                  <div className="relative p-4 bg-white/30 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-all duration-300 inline-flex mb-6">
                    <Building2 className="relative w-12 h-12 text-white drop-shadow-md" />
                  </div>
                  <CardTitle className="text-4xl text-white font-black mb-2">
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription className="text-white/90 text-lg mb-8">
                    Access your beauty clinic management system
                  </CardDescription>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signin">
                      <Button
                        size="lg"
                        className="relative bg-white text-gray-700 hover:bg-white/95 font-bold px-10 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group/btn w-full sm:w-auto"
                      >
                        <LogIn className="relative mr-2 h-6 w-6 text-[#8B5CF6]" />
                        <span className="relative">Sign In</span>
                        <ArrowRight className="relative ml-2 h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>

                    <Link href="/signup">
                      <Button
                        size="lg"
                        variant="outline"
                        className="relative bg-transparent border-white/30 text-white hover:bg-white/10 font-bold px-10 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group/btn w-full sm:w-auto"
                      >
                        <UserPlus className="relative mr-2 h-6 w-6" />
                        <span className="relative">Sign Up</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Features Section */}
          <div className={`mb-16 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Everything You Need</h2>
              <p className="text-gray-600">Comprehensive tools to manage your beauty clinic</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: Users, title: "Client Management", description: "Keep track of client information, appointments, and preferences" },
                { icon: Calendar, title: "Smart Scheduling", description: "Advanced booking system with real-time availability" },
                { icon: TrendingUp, title: "Business Analytics", description: "Detailed reports and insights to grow your business" },
                { icon: Clock, title: "Real-time Updates", description: "Stay connected with instant notifications and updates" }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[#EDE9FE] rounded-xl">
                      <feature.icon className="w-6 h-6 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div className={`mt-16 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10" />
              <CardContent className="relative p-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] shadow-lg mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Need Assistance?</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Our support team is here to help you get started with your beauty clinic management journey
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                    <a href="mailto:support@beautyclinic.com" className="flex items-center justify-center gap-2 text-[#8B5CF6] hover:text-[#6D28D9] transition-colors group">
                      <div className="p-2 bg-[#EDE9FE] rounded-lg group-hover:bg-[#C4B5FD] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="font-medium">support@beautyclinic.com</span>
                    </a>

                    <a href="tel:+62123456789" className="flex items-center justify-center gap-2 text-pink-600 hover:text-pink-700 transition-colors group">
                      <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="font-medium">+62 123 456 789</span>
                    </a>
                  </div>

                  <div className="pt-6 flex items-center justify-center gap-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>24/7 Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Secure Platform</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>99.9% Uptime</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}