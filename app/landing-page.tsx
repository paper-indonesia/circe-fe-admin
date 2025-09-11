"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Shield, Users, Calendar, Star, Sparkles, Heart, Zap, Award, CheckCircle, ArrowRight, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const defaultTenants = [
  { 
    name: "Jakarta", 
    slug: "jakarta", 
    gradient: "gradient-purple-lavender",
    bgColor: "bg-pastel-purple",
    icon: "✨",
    stats: { clients: "2.5k+", staff: "45+", rating: "4.9" }
  },
  { 
    name: "Bali", 
    slug: "bali", 
    gradient: "gradient-pink-lavender",
    bgColor: "bg-pastel-pink",
    icon: "🌸",
    stats: { clients: "1.8k+", staff: "32+", rating: "4.8" }
  },
  { 
    name: "Surabaya", 
    slug: "surabaya", 
    gradient: "gradient-periwinkle-blue",
    bgColor: "bg-pastel-periwinkle",
    icon: "💫",
    stats: { clients: "3.2k+", staff: "58+", rating: "4.9" }
  },
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Modern Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#FFD6FF]/10 via-white to-[#BBD0FF]/10">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
        
        {/* Subtle Animated Orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-[#C8B6FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute top-[50%] right-[10%] w-80 h-80 bg-[#BBD0FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[10%] left-[30%] w-96 h-96 bg-[#FFD6FF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/20 via-transparent to-pink-200/20" />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Enhanced Header with animation */}
        <div className={`text-center mb-16 ${mounted ? 'animate-fadeInDown' : 'opacity-0'}`}>
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 w-32 h-32 bg-[#E7C6FF] rounded-full blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C8B6FF] to-[#E7C6FF] shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 group">
              <Sparkles className="w-12 h-12 text-white drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-[#C8B6FF] via-[#E7C6FF] to-[#FFD6FF] bg-clip-text text-transparent">Beauty Clinic</span>
          </h1>
          
          <div className="relative">
            <p className="text-2xl text-gray-700 font-light tracking-wide flex items-center justify-center gap-3">
              <Heart className="w-6 h-6 text-[#FFD6FF] drop-shadow-sm" />
              <span className="text-gray-600">Your Beauty Journey Starts Here</span>
              <Heart className="w-6 h-6 text-[#FFD6FF] drop-shadow-sm" />
            </p>
            <div className="mt-4 flex items-center justify-center gap-8 text-sm font-medium">
              <span className="text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#C8B6FF]" />
                Trusted by 10,000+ Clients
              </span>
              <span className="text-gray-600 flex items-center gap-2">
                <Star className="w-4 h-4 fill-pastel-pink text-pastel-pink" />
                4.9/5 Rating
              </span>
              <span className="text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#BBD0FF]" />
                Award Winning Service
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Admin Access with premium design */}
          <div className={`mb-16 ${mounted ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8B6FF] to-[#E7C6FF]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.2),transparent_70%)]" />
              </div>
              <CardHeader className="relative z-10 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative p-4 bg-white/30 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-all duration-300">
                      <Shield className="relative w-10 h-10 text-white drop-shadow-md" />
                    </div>
                    <div>
                      <CardTitle className="text-4xl text-white font-black flex items-center gap-3">
                        Platform Administrator
                        <Award className="w-7 h-7 text-yellow-300 animate-pulse drop-shadow-lg" />
                      </CardTitle>
                      <CardDescription className="text-white/90 text-lg mt-1">
                        Full control over all branches and system settings
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/admin/login">
                    <Button 
                      size="lg" 
                      className="relative bg-white text-gray-700 hover:bg-white/95 font-bold px-10 py-6 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group/btn"
                    >
                      <Zap className="relative mr-2 h-6 w-6 text-[#C8B6FF]" />
                      <span className="relative">Admin Portal</span>
                      <ArrowRight className="relative ml-2 h-6 w-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Branch Access with enhanced cards */}
          <div className="space-y-6">
            <div className={`text-center ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Branch</h2>
              <p className="text-gray-600">Select your location to access the management portal</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {defaultTenants.map((tenant, index) => (
                <Card 
                  key={tenant.slug} 
                  className={`group relative overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 ${
                    mounted ? 'animate-fadeInUp' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setHoveredCard(tenant.slug)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Subtle hover effect */}
                  <div className={`absolute inset-0 ${tenant.gradient} opacity-0 group-hover:opacity-5 transition-all duration-300`} />
                  
                  <CardHeader className={`relative ${tenant.gradient} text-gray-800 p-6`}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent group-hover:scale-110 transition-transform duration-700 origin-top-left" />
                    </div>
                    
                    <div className="absolute top-3 right-3 text-3xl opacity-50">{tenant.icon}</div>
                    
                    <div className="relative flex items-center justify-between mb-6">
                      <div className="p-2.5 bg-white/40 backdrop-blur-sm rounded-xl group-hover:scale-105 transition-transform duration-200">
                        <Building2 className="w-8 h-8 text-gray-700" />
                      </div>
                      <span className="text-xs font-semibold bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        Premium Branch
                      </span>
                    </div>
                    <CardTitle className="relative text-2xl font-bold text-gray-800">{tenant.name}</CardTitle>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-2 mt-4 text-gray-700 text-sm">
                      <div className="flex items-center gap-1.5 bg-white/30 px-2.5 py-1 rounded-lg">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{tenant.stats.clients}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/30 px-2.5 py-1 rounded-lg">
                        <Award className="w-4 h-4" />
                        <span className="font-medium">{tenant.stats.staff}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/30 px-2.5 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-pastel-pink text-pastel-pink" />
                        <span className="font-medium">{tenant.stats.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    {/* Enhanced Features */}
                    <div className="space-y-4">
                      {[
                        { icon: Users, text: "Advanced Staff Management", badge: "Pro" },
                        { icon: Calendar, text: "Smart Scheduling System", badge: "AI" },
                        { icon: TrendingUp, text: "Business Analytics", badge: "New" },
                        { icon: Clock, text: "Real-time Updates", badge: null }
                      ].map((feature, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 ${
                            hoveredCard === tenant.slug ? 'bg-gray-100' : ''
                          }`}
                          style={{ transitionDelay: `${idx * 75}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tenant.bgColor}/20`}>
                              <feature.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-800">{feature.text}</span>
                          </div>
                          {feature.badge && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              feature.badge === 'Pro' ? 'bg-purple-100 text-purple-700' :
                              feature.badge === 'AI' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feature.badge}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Enhanced Action buttons */}
                    <div className="pt-6 space-y-4">
                      <Link href={`/${tenant.slug}/signin`} className="block">
                        <Button 
                          className="w-full h-12 group/btn border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all duration-200" 
                          variant="outline"
                          size="lg"
                        >
                          <span className="font-semibold text-gray-700">Sign In to Dashboard</span>
                          <ArrowRight className="ml-2 h-5 w-5 text-gray-500 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                      <Link href={`/${tenant.slug}/signup`} className="block">
                        <Button 
                          className={`w-full h-12 ${tenant.gradient} text-gray-800 hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200 font-semibold`}
                          size="lg"
                        >
                          <Sparkles className="mr-2 h-5 w-5" />
                          Start Free Trial
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Info Section */}
          <div className={`mt-16 ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-blue-400/10" />
              <CardContent className="relative p-8">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Need Assistance?</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Our support team is here to help you get started with your beauty clinic management journey
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                    <a href="mailto:support@beautyclinic.com" className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 transition-colors group">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
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