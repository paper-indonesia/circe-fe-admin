"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  Sparkles,
  TrendingDown,
  Calendar,
  X,
  Plus,
  AlertCircle,
  Info,
  Tag,
  Percent
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OutletPrice {
  outlet_id: string
  outlet_name: string
  price: number
}

interface PricingStrategyProps {
  basePrice: number
  currency: string
  outletPrices?: Record<string, number>
  promotionalPrice?: number | null
  promotionalValidUntil?: string | null
  onOutletPricesChange: (outletPrices: Record<string, number>) => void
  onPromotionalPriceChange: (price: number | null, validUntil: string | null) => void
  availableOutlets?: Array<{ id: string; name: string }>
}

export function PricingStrategySection({
  basePrice,
  currency,
  outletPrices = {},
  promotionalPrice,
  promotionalValidUntil,
  onOutletPricesChange,
  onPromotionalPriceChange,
  availableOutlets = []
}: PricingStrategyProps) {
  const [showOutletPricing, setShowOutletPricing] = useState(Object.keys(outletPrices).length > 0)
  const [showPromotional, setShowPromotional] = useState(!!promotionalPrice)
  const [selectedOutletId, setSelectedOutletId] = useState<string>("")
  const [outletPriceInput, setOutletPriceInput] = useState<string>("")

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate discount percentage
  const calculateDiscount = (originalPrice: number, discountedPrice: number) => {
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
    return Math.round(discount)
  }

  // Check if promotion is active
  const isPromotionActive = () => {
    if (!promotionalPrice || !promotionalValidUntil) return false
    return new Date(promotionalValidUntil) > new Date()
  }

  // Add outlet price
  const handleAddOutletPrice = () => {
    if (!selectedOutletId || !outletPriceInput) return

    const price = parseFloat(outletPriceInput)
    if (isNaN(price) || price < 0) return

    const updatedPrices = {
      ...outletPrices,
      [selectedOutletId]: price
    }

    onOutletPricesChange(updatedPrices)
    setSelectedOutletId("")
    setOutletPriceInput("")
  }

  // Remove outlet price
  const handleRemoveOutletPrice = (outletId: string) => {
    const { [outletId]: removed, ...rest } = outletPrices
    onOutletPricesChange(rest)
  }

  // Get available outlets (not yet configured)
  const availableOutletsForSelection = availableOutlets.filter(
    outlet => !outletPrices[outlet.id]
  )

  // Get outlet name by ID
  const getOutletName = (outletId: string) => {
    const outlet = availableOutlets.find(o => o.id === outletId)
    return outlet?.name || outletId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Tag className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Pricing Strategy</h3>
        <Badge variant="outline" className="ml-auto">
          Optional
        </Badge>
      </div>

      {/* Pricing Hierarchy Info */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">Pricing Priority Order:</p>
              <ol className="space-y-1 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-white text-xs font-bold">1</span>
                  <span><strong>Promotional Price</strong> - Applies globally to all outlets (highest priority)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold">2</span>
                  <span><strong>Outlet-Specific Price</strong> - Custom price per location</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-400 text-white text-xs font-bold">3</span>
                  <span><strong>Base Price</strong> - Default price (Rp {basePrice.toLocaleString('id-ID')})</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotional Pricing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Promotional Pricing</h4>
              <p className="text-sm text-gray-500">Time-limited discount for marketing campaigns</p>
            </div>
          </div>
          <Switch
            checked={showPromotional}
            onCheckedChange={(checked) => {
              setShowPromotional(checked)
              if (!checked) {
                onPromotionalPriceChange(null, null)
              }
            }}
          />
        </div>

        {showPromotional && (
          <div className="pl-14 space-y-4 animate-in slide-in-from-top-2">
            <Card className={cn(
              "border-2 transition-colors",
              isPromotionActive() ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"
            )}>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo-price" className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Promotional Price (IDR)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                      <Input
                        id="promo-price"
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="75000"
                        value={promotionalPrice || ""}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || null
                          onPromotionalPriceChange(value, promotionalValidUntil || null)
                        }}
                        className="pl-10 h-11"
                      />
                    </div>
                    {promotionalPrice && promotionalPrice < basePrice && (
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700">
                          {calculateDiscount(basePrice, promotionalPrice)}% OFF
                        </span>
                        <span className="text-gray-500">
                          (Save {formatCurrency(basePrice - promotionalPrice)})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-valid-until" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Valid Until
                    </Label>
                    <Input
                      id="promo-valid-until"
                      type="datetime-local"
                      value={promotionalValidUntil ? new Date(promotionalValidUntil).toISOString().slice(0, 16) : ""}
                      onChange={(e) => {
                        const value = e.target.value ? new Date(e.target.value).toISOString() : null
                        onPromotionalPriceChange(promotionalPrice || null, value)
                      }}
                      className="h-11"
                    />
                    {promotionalValidUntil && (
                      <div className="flex items-center gap-2 text-sm">
                        {isPromotionActive() ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-medium text-green-700">Active Promotion</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-700">Expired</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Promotional Price Preview */}
                {promotionalPrice && (
                  <div className="mt-4 p-4 rounded-lg bg-white border-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Customer will see:</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg line-through text-gray-400">
                            {formatCurrency(basePrice)}
                          </span>
                          <span className="text-2xl font-bold text-orange-600">
                            {formatCurrency(promotionalPrice)}
                          </span>
                          <Badge className="bg-orange-600 hover:bg-orange-700">
                            SALE
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-blue-900">Promotional Pricing Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                  <li>Promotion applies to ALL outlets globally</li>
                  <li>Always takes priority over outlet-specific pricing</li>
                  <li>Automatically expires after the valid until date</li>
                  <li>Recommended discount: 20-40% for best conversion</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Outlet-Specific Pricing Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Outlet-Specific Pricing</h4>
              <p className="text-sm text-gray-500">Set custom prices for different locations</p>
            </div>
          </div>
          <Switch
            checked={showOutletPricing}
            onCheckedChange={(checked) => {
              setShowOutletPricing(checked)
              if (!checked) {
                onOutletPricesChange({})
              }
            }}
          />
        </div>

        {showOutletPricing && (
          <div className="pl-14 space-y-4 animate-in slide-in-from-top-2">
            {/* Add Outlet Price Form */}
            {availableOutletsForSelection.length > 0 && (
              <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="outlet-select" className="text-sm font-medium mb-2 block">
                        Select Outlet
                      </Label>
                      <select
                        id="outlet-select"
                        value={selectedOutletId}
                        onChange={(e) => setSelectedOutletId(e.target.value)}
                        className="w-full h-11 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Choose an outlet...</option>
                        {availableOutletsForSelection.map((outlet) => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <Label htmlFor="outlet-price-input" className="text-sm font-medium mb-2 block">
                        Custom Price
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <Input
                          id="outlet-price-input"
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="85000"
                          value={outletPriceInput}
                          onChange={(e) => setOutletPriceInput(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleAddOutletPrice}
                        disabled={!selectedOutletId || !outletPriceInput}
                        className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Outlet Prices List */}
            {Object.keys(outletPrices).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(outletPrices).map(([outletId, price]) => {
                  const outletName = getOutletName(outletId)
                  const priceDiff = price - basePrice
                  const isDifferent = priceDiff !== 0

                  return (
                    <Card key={outletId} className="border-purple-200 hover:border-purple-400 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{outletName}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold text-purple-600">
                                  {formatCurrency(price)}
                                </span>
                                {isDifferent && (
                                  <Badge variant={priceDiff > 0 ? "default" : "secondary"} className={cn(
                                    priceDiff > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"
                                  )}>
                                    {priceDiff > 0 ? "+" : ""}{formatCurrency(priceDiff)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOutletPrice(outletId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="font-medium">No outlet-specific prices configured</p>
                <p className="text-sm">All outlets will use the base price</p>
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-blue-900">Outlet Pricing Tips:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                  <li>Use higher prices for premium locations (malls, downtown)</li>
                  <li>Use lower prices for new outlets to attract customers</li>
                  <li>Promotional pricing overrides outlet pricing when active</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
