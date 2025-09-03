"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Users, Star, FileText, Settings, UserPlus, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Treatments", href: "/treatments", icon: Star },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Walk-in Booking", href: "/walk-in", icon: UserPlus },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background rounded-full shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r-2 border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-8 border-b-2 border-sidebar-border feminine-gradient">
            <div className="text-3xl">
              <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white drop-shadow-md">Beauty Clinic</h1>
              <p className="text-sm text-white/80 font-medium">Admin Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "text-sidebar-foreground hover:bg-secondary/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t-2 border-sidebar-border">
            <div className="flex items-center p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-300">
              <div className="w-10 h-10 feminine-gradient rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-sidebar-foreground">Admin User</p>
                <p className="text-xs text-sidebar-foreground/70 font-medium">admin@beautyclinic.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
