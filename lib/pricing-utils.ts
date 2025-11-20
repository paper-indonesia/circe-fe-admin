/**
 * Pricing Utility Functions
 * Implements pricing hierarchy: Promotional → Outlet-Specific → Base Price
 */

export interface PricingData {
  base_price: number | string
  currency?: string
  outlet_prices?: Record<string, number | string>
  promotional_price?: number | string | null
  promotional_valid_until?: string | null
}

export interface EffectivePriceResult {
  price: number
  source: 'promotional' | 'outlet' | 'base'
  isPromoActive: boolean
  hasOutletPricing: boolean
  isOutletPromo?: boolean  // True if outlet price is lower than base price
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

  const basePrice = typeof pricing.base_price === 'string' ? parseFloat(pricing.base_price) : (pricing.base_price || 0)
  const hasOutletPricing = !!(pricing.outlet_prices && Object.keys(pricing.outlet_prices).length > 0)

  // Priority 1: Check promotional pricing (highest priority, global)
  if (pricing.promotional_price && pricing.promotional_valid_until) {
    const now = new Date()
    const validUntil = new Date(pricing.promotional_valid_until)

    if (validUntil > now) {
      // Promotional price is active
      const promoPrice = typeof pricing.promotional_price === 'string'
        ? parseFloat(pricing.promotional_price)
        : pricing.promotional_price
      return {
        price: promoPrice,
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
      const parsedOutletPrice = typeof outletPrice === 'string'
        ? parseFloat(outletPrice)
        : outletPrice

      // Check if outlet price is lower than base price (promotional outlet pricing)
      const isOutletPromo = parsedOutletPrice < basePrice

      return {
        price: parsedOutletPrice,
        source: 'outlet',
        isPromoActive: false,
        hasOutletPricing,
        isOutletPromo,
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
  const rawBasePrice = pricing?.base_price || 0
  const basePrice = typeof rawBasePrice === 'string' ? parseFloat(rawBasePrice) : rawBasePrice

  return {
    ...effectivePrice,
    basePrice,
    showStrikethrough: (effectivePrice.source === 'promotional' && effectivePrice.price < basePrice) ||
                       (effectivePrice.source === 'outlet' && effectivePrice.isOutletPromo === true),
    discountPercent: effectivePrice.price < basePrice
      ? Math.round(((basePrice - effectivePrice.price) / basePrice) * 100)
      : 0,
  }
}
