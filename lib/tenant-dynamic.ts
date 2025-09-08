// Dynamic tenant configuration that works with database
export interface TenantConfig {
  id: string
  slug: string
  name: string
  domain?: string
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    logo?: string
    favicon?: string
  }
  features?: {
    walkIn?: boolean
    reporting?: boolean
    multipleLocations?: boolean
  }
  metadata?: {
    title?: string
    description?: string
  }
}

// Default/fallback tenants (hardcoded)
const DEFAULT_TENANTS: Record<string, TenantConfig> = {
  'jakarta': {
    id: 'jakarta',
    slug: 'jakarta',
    name: 'Beauty Clinic Jakarta',
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: false
    }
  },
  'bali': {
    id: 'bali',
    slug: 'bali',
    name: 'Beauty Clinic Bali',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: true
    }
  },
  'surabaya': {
    id: 'surabaya',
    slug: 'surabaya',
    name: 'Beauty Clinic Surabaya',
    theme: {
      primaryColor: '#F59E0B',
      secondaryColor: '#EF4444',
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: false
    }
  }
}

// Cache for database tenants
let tenantsCache: Record<string, TenantConfig> = {}
let cacheTimestamp = 0
const CACHE_DURATION = 60000 // 1 minute

// Function to fetch tenant from database via API
async function fetchTenantFromDB(slug: string): Promise<TenantConfig | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/tenants/${slug}`, {
      next: { revalidate: 60 } // Cache for 60 seconds in Next.js
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    // Transform DB tenant to TenantConfig format
    return {
      id: data.id || slug,
      slug: data.slug || slug,
      name: data.name || slug.charAt(0).toUpperCase() + slug.slice(1),
      theme: data.config?.theme || {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
      },
      features: data.config?.features || {
        walkIn: true,
        reporting: true,
        multipleLocations: false
      }
    }
  } catch (error) {
    console.error('Error fetching tenant from DB:', error)
    return null
  }
}

// Get tenant by slug - checks both hardcoded and database
export async function getTenantBySlug(slug: string): Promise<TenantConfig | null> {
  // First check hardcoded tenants
  if (DEFAULT_TENANTS[slug]) {
    return DEFAULT_TENANTS[slug]
  }
  
  // Check cache
  if (tenantsCache[slug] && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return tenantsCache[slug]
  }
  
  // Fetch from database
  const dbTenant = await fetchTenantFromDB(slug)
  if (dbTenant) {
    tenantsCache[slug] = dbTenant
    cacheTimestamp = Date.now()
    return dbTenant
  }
  
  return null
}

// Synchronous version for middleware (returns default if not found)
export function getTenantBySlugSync(slug: string): TenantConfig {
  // Check hardcoded tenants
  if (DEFAULT_TENANTS[slug]) {
    return DEFAULT_TENANTS[slug]
  }
  
  // Check cache
  if (tenantsCache[slug]) {
    return tenantsCache[slug]
  }
  
  // Return a generic tenant config for dynamic tenants
  return {
    id: slug,
    slug: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: false
    }
  }
}

export function getTenantFromPath(pathname: string): TenantConfig | null {
  if (!pathname) return null
  
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  
  const slug = segments[0]
  
  // Return sync version for middleware usage
  return getTenantBySlugSync(slug)
}

export function getTenantFromHost(host: string): TenantConfig | null {
  if (!host) return null
  
  const subdomain = host.split('.')[0]
  
  // Check if subdomain matches any tenant slug
  if (DEFAULT_TENANTS[subdomain]) {
    return DEFAULT_TENANTS[subdomain]
  }
  
  // Check cache for dynamic tenants
  if (tenantsCache[subdomain]) {
    return tenantsCache[subdomain]
  }
  
  return null
}