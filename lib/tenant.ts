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

const TENANT_CONFIGS: Record<string, TenantConfig> = {
  'beauty-clinic-jakarta': {
    id: 'beauty-clinic-jakarta',
    slug: 'jakarta',
    name: 'Beauty Clinic Jakarta',
    domain: 'jakarta.beauty-clinic.com',
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      logo: '/tenants/jakarta/logo.png',
      favicon: '/tenants/jakarta/favicon.ico'
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: false
    },
    metadata: {
      title: 'Beauty Clinic Jakarta - Admin Dashboard',
      description: 'Admin dashboard for Beauty Clinic Jakarta'
    }
  },
  'beauty-clinic-bali': {
    id: 'beauty-clinic-bali',
    slug: 'bali',
    name: 'Beauty Clinic Bali',
    domain: 'bali.beauty-clinic.com',
    theme: {
      primaryColor: '#6B5B95',
      secondaryColor: '#88D8B0',
      logo: '/tenants/bali/logo.png',
      favicon: '/tenants/bali/favicon.ico'
    },
    features: {
      walkIn: true,
      reporting: true,
      multipleLocations: true
    },
    metadata: {
      title: 'Beauty Clinic Bali - Admin Dashboard',
      description: 'Admin dashboard for Beauty Clinic Bali'
    }
  },
  'skin-care-surabaya': {
    id: 'skin-care-surabaya',
    slug: 'surabaya',
    name: 'Skin Care Surabaya',
    domain: 'surabaya.beauty-clinic.com',
    theme: {
      primaryColor: '#F7CAC9',
      secondaryColor: '#92A8D1',
      logo: '/tenants/surabaya/logo.png',
      favicon: '/tenants/surabaya/favicon.ico'
    },
    features: {
      walkIn: false,
      reporting: true,
      multipleLocations: false
    },
    metadata: {
      title: 'Skin Care Surabaya - Admin Dashboard',
      description: 'Admin dashboard for Skin Care Surabaya'
    }
  }
}

export const tenants = Object.values(TENANT_CONFIGS)

const DEFAULT_TENANT: TenantConfig = {
  id: 'default',
  slug: 'default',
  name: 'Beauty Clinic',
  theme: {
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4'
  },
  features: {
    walkIn: true,
    reporting: true,
    multipleLocations: false
  },
  metadata: {
    title: 'Beauty Clinic Admin',
    description: 'Admin dashboard for beauty clinic management'
  }
}

export function getTenantFromHost(host: string): TenantConfig | null {
  if (!host) return null
  
  const subdomain = host.split('.')[0]
  
  const tenant = Object.values(TENANT_CONFIGS).find(
    config => config.domain?.split('.')[0] === subdomain || config.slug === subdomain
  )
  
  return tenant || null
}

export function getTenantFromPath(pathname: string): TenantConfig | null {
  if (!pathname) return null
  
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  
  const slug = segments[0]
  
  const tenant = Object.values(TENANT_CONFIGS).find(
    config => config.slug === slug
  )
  
  return tenant || null
}

export function normalizeTenantId(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

export function getTenant(req?: Request): TenantConfig {
  try {
    if (req) {
      const url = new URL(req.url)
      const host = req.headers.get('host') || ''
      const xTenantHeader = req.headers.get('x-tenant-id')
      
      if (xTenantHeader && TENANT_CONFIGS[xTenantHeader]) {
        return TENANT_CONFIGS[xTenantHeader]
      }
      
      const tenantFromHost = getTenantFromHost(host)
      if (tenantFromHost) return tenantFromHost
      
      const tenantFromPath = getTenantFromPath(url.pathname)
      if (tenantFromPath) return tenantFromPath
    }
  } catch (error) {
    console.error('Error getting tenant:', error)
  }
  
  return DEFAULT_TENANT
}

export function getTenantById(tenantId: string): TenantConfig | null {
  return TENANT_CONFIGS[tenantId] || null
}

export function getTenantBySlug(slug: string): TenantConfig | null {
  return Object.values(TENANT_CONFIGS).find(config => config.slug === slug) || null
}

export function getAllTenants(): TenantConfig[] {
  return Object.values(TENANT_CONFIGS)
}

export function withTenant<T extends (...args: any[]) => any>(
  fn: T,
  tenantId: string
): T {
  return ((...args) => {
    const contextWithTenant = { ...args[0], tenantId }
    return fn(contextWithTenant, ...args.slice(1))
  }) as T
}