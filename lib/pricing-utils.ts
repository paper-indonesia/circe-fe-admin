/**
 * Pricing Utility Functions
 * Implements pricing hierarchy: Promotional → Outlet-Specific → Base Price
 */

export interface PricingData {
  base_price: number
  currency?: string
  outlet_prices?: Record<string, number>
  promotional_price?: number | null
  promotional_valid_until?: string | null
}

export interface EffectivePriceResult {
  price: number
  source: 'promotional' | 'outlet' | 'base'
  isPromoActive: boolean
  hasOutletPricing: boolean
}

/**
 * Calculate effective price based on pricing hierarchy
 * Priority: 1. Promotional (if valid) → 2. Outlet-Specific → 3. Base
 */
export function calculateEffectivePrice(
  pricing: PricingData | null | undefined,
  outletId?: string | null
): EffectivePriceResult {
  // Default result
  const defaultResult: EffectivePriceResult = {
    price: 0,
    source: 'base',
    isPromoActive: false,
    hasOutletPricing: false,
  }

  if (!pricing) {
    return defaultResult
  }

  const basePrice = pricing.base_price || 0
  const hasOutletPricing = !!(pricing.outlet_prices && Object.keys(pricing.outlet_prices).length > 0)

  // Priority 1: Check promotional pricing (highest priority, global)
  if (pricing.promotional_price && pricing.promotional_valid_until) {
    const now = new Date()
    const validUntil = new Date(pricing.promotional_valid_until)

    if (validUntil > now) {
      // Promotional price is active
      return {
        price: pricing.promotional_price,
        source: 'promotional',
        isPromoActive: true,
        hasOutletPricing,
      }
    }
  }

  // Priority 2: Check outlet-specific pricing
  if (outletId && pricing.outlet_prices) {
    const outletPrice = pricing.outlet_prices[outletId]
    if (outletPrice !== undefined && outletPrice !== null) {
      return {
        price: outletPrice,
        source: 'outlet',
        isPromoActive: false,
        hasOutletPricing,
      }
    }
  }

  // Priority 3: Return base price (fallback)
  return {
    price: basePrice,
    source: 'base',
    isPromoActive: false,
    hasOutletPricing,
  }
}

/**
 * Check if promotional price is currently active
 */
export function isPromotionalActive(pricing: PricingData | null | undefined): boolean {
  if (!pricing?.promotional_price || !pricing?.promotional_valid_until) {
    return false
  }

  const now = new Date()
  const validUntil = new Date(pricing.promotional_valid_until)
  return validUntil > now
}

/**
 * Get pricing info for display purposes
 */
export function getPricingDisplayInfo(
  pricing: PricingData | null | undefined,
  outletId?: string | null
) {
  const effectivePrice = calculateEffectivePrice(pricing, outletId)
  const basePrice = pricing?.base_price || 0

  return {
    ...effectivePrice,
    basePrice,
    showStrikethrough: effectivePrice.source === 'promotional' && effectivePrice.price < basePrice,
    discountPercent: effectivePrice.price < basePrice
      ? Math.round(((basePrice - effectivePrice.price) / basePrice) * 100)
      : 0,
  }
}
