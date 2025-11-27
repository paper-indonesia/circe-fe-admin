"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Gift,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import type { CustomerPackage, CustomerCredit, CustomerCreditSummary } from "@/lib/types"

interface CustomerCreditsSectionProps {
  customerId: string
  customerName: string
  onSellPackage: () => void
}

export function CustomerCreditsSection({
  customerId,
  customerName,
  onSellPackage
}: CustomerCreditsSectionProps) {
  const [summary, setSummary] = useState<CustomerCreditSummary | null>(null)
  const [credits, setCredits] = useState<CustomerCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (customerId) {
      fetchCredits()
    }
  }, [customerId])

  const fetchCredits = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch summary and credits in parallel
      const [summaryRes, creditsRes] = await Promise.all([
        fetch(`/api/staff/customer-packages/${customerId}/summary`),
        fetch(`/api/staff/customer-packages/${customerId}/credits?include_expired=false`)
      ])

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json()
        // Handle both array response and items property
        const creditsList = Array.isArray(creditsData) ? creditsData : (creditsData.items || [])
        setCredits(creditsList)
      }
    } catch (err) {
      console.error('Error fetching customer credits:', err)
      setError('Failed to load credit information')
    } finally {
      setLoading(false)
    }
  }

  const togglePackageExpanded = (packageId: string) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(packageId)) {
        newSet.delete(packageId)
      } else {
        newSet.add(packageId)
      }
      return newSet
    })
  }

  // Group credits by customer_package_id
  const groupedCredits = credits.reduce((acc, credit) => {
    const key = credit.customer_package_id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(credit)
    return acc
  }, {} as Record<string, CustomerCredit[]>)

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'No expiry'
    try {
      const date = parseISO(dateStr)
      if (!isValid(date)) return 'N/A'
      return format(date, 'dd MMM yyyy')
    } catch {
      return 'N/A'
    }
  }

  const getDaysUntilExpiry = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null
    try {
      const expiryDate = parseISO(expiresAt)
      if (!isValid(expiryDate)) return null
      return differenceInDays(expiryDate, new Date())
    } catch {
      return null
    }
  }

  const getExpiryBadge = (expiresAt: string | null | undefined, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>
    }

    // No expiry date means no expiration
    if (!expiresAt) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">No expiry</Badge>
    }

    const daysLeft = getDaysUntilExpiry(expiresAt)
    if (daysLeft === null) return null

    if (daysLeft <= 7) {
      return <Badge variant="destructive" className="text-xs">Expires in {daysLeft} days</Badge>
    } else if (daysLeft <= 30) {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Expires in {daysLeft} days</Badge>
    }

    return <Badge variant="secondary" className="text-xs">Valid until {formatDate(expiresAt)}</Badge>
  }

  // Helper to get total credits (backend uses total_credits, type uses allocated_credits)
  const getTotalCredits = (credit: any) => {
    return credit.total_credits ?? credit.allocated_credits ?? 0
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-lg p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
          <span className="ml-2 text-sm text-muted-foreground">Loading credits...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[#6D28D9] flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Package Credits
        </h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchCredits}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onSellPackage}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
          >
            <Gift className="h-4 w-4 mr-1" />
            Sell Package
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Active Packages</p>
            <p className="text-lg font-bold text-[#6D28D9]">{summary.active_packages}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Total Credits</p>
            <p className="text-lg font-bold text-[#6D28D9]">{summary.total_credits}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-green-600">{summary.remaining_credits}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Used</p>
            <p className="text-lg font-bold text-gray-600">{summary.used_credits}</p>
          </div>
        </div>
      )}

      {/* Credits List */}
      {credits.length === 0 ? (
        <div className="text-center py-6 bg-white/40 rounded-lg">
          <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-muted-foreground">No active package credits</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Sell Package" to add credits for this customer
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedCredits).map(([packageId, packageCredits]) => {
            const isExpanded = expandedPackages.has(packageId)
            const totalRemaining = packageCredits.reduce((sum, c) => sum + c.remaining_credits, 0)
            const totalAllocated = packageCredits.reduce((sum, c) => sum + getTotalCredits(c), 0)
            const firstCredit = packageCredits[0]
            const hasExpiringSoon = packageCredits.some(c => {
              if (!c.expires_at) return false // No expiry = not expiring soon
              const days = getDaysUntilExpiry(c.expires_at)
              return days !== null && days <= 30 && !c.is_expired
            })

            return (
              <Collapsible
                key={packageId}
                open={isExpanded}
                onOpenChange={() => togglePackageExpanded(packageId)}
              >
                <CollapsibleTrigger asChild>
                  <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-[#8B5CF6]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">Package Credits</span>
                            {hasExpiringSoon && (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {packageCredits.length} service(s) • {totalRemaining} of {totalAllocated} credits remaining
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {totalRemaining} credits
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 bg-white rounded-lg overflow-hidden border border-gray-100">
                    <div className="divide-y divide-gray-100">
                      {packageCredits.map((credit) => (
                        <div key={credit.id} className="p-3 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{credit.service_name}</span>
                                {getExpiryBadge(credit.expires_at, credit.is_expired)}
                              </div>
                              {credit.expires_at && (
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Expires: {formatDate(credit.expires_at)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                {credit.is_expired ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : credit.remaining_credits === 0 ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-blue-500" />
                                )}
                                <span className={`font-bold ${
                                  credit.is_expired ? 'text-red-500' :
                                  credit.remaining_credits === 0 ? 'text-gray-400' :
                                  'text-[#6D28D9]'
                                }`}>
                                  {credit.remaining_credits}/{getTotalCredits(credit)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {credit.used_credits} used
                              </p>
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                credit.is_expired ? 'bg-red-400' :
                                credit.remaining_credits === 0 ? 'bg-gray-300' :
                                'bg-[#8B5CF6]'
                              }`}
                              style={{
                                width: `${getTotalCredits(credit) > 0 ? (credit.remaining_credits / getTotalCredits(credit)) * 100 : 0}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      )}
    </div>
  )
}
