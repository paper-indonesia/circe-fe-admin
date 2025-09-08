import { headers } from 'next/headers'
import { TenantConfig, getTenantFromHost, getTenantFromPath, getTenantBySlug } from './tenant'

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

export async function getTenantServer(): Promise<TenantConfig> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const xTenantHeader = headersList.get('x-tenant-id')
    
    if (xTenantHeader && TENANT_CONFIGS[xTenantHeader]) {
      return TENANT_CONFIGS[xTenantHeader]
    }
    
    const tenantFromHost = getTenantFromHost(host)
    if (tenantFromHost) return tenantFromHost
    
    const pathname = headersList.get('x-pathname') || ''
    const tenantFromPath = getTenantFromPath(pathname)
    if (tenantFromPath) return tenantFromPath
  } catch (error) {
    console.error('Error getting tenant:', error)
  }
  
  return DEFAULT_TENANT
}