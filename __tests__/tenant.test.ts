import { 
  getTenantFromHost, 
  getTenantFromPath, 
  normalizeTenantId,
  getTenantBySlug,
  getAllTenants 
} from '../lib/tenant'

describe('Tenant Resolution', () => {
  describe('getTenantFromHost', () => {
    test('resolves tenant from subdomain', () => {
      const tenant = getTenantFromHost('jakarta.beauty-clinic.com')
      expect(tenant?.slug).toBe('jakarta')
      expect(tenant?.id).toBe('beauty-clinic-jakarta')
    })
    
    test('resolves tenant from subdomain with port', () => {
      const tenant = getTenantFromHost('bali.beauty-clinic.com:3000')
      expect(tenant?.slug).toBe('bali')
    })
    
    test('returns null for main domain', () => {
      const tenant = getTenantFromHost('beauty-clinic.com')
      expect(tenant).toBeNull()
    })
    
    test('returns null for unknown subdomain', () => {
      const tenant = getTenantFromHost('unknown.beauty-clinic.com')
      expect(tenant).toBeNull()
    })
  })
  
  describe('getTenantFromPath', () => {
    test('resolves tenant from path', () => {
      const tenant = getTenantFromPath('/jakarta/dashboard')
      expect(tenant?.slug).toBe('jakarta')
      expect(tenant?.id).toBe('beauty-clinic-jakarta')
    })
    
    test('resolves tenant from root path', () => {
      const tenant = getTenantFromPath('/bali')
      expect(tenant?.slug).toBe('bali')
    })
    
    test('returns null for empty path', () => {
      const tenant = getTenantFromPath('/')
      expect(tenant).toBeNull()
    })
    
    test('returns null for unknown tenant', () => {
      const tenant = getTenantFromPath('/unknown/dashboard')
      expect(tenant).toBeNull()
    })
  })
  
  describe('normalizeTenantId', () => {
    test('converts to lowercase', () => {
      expect(normalizeTenantId('JAKARTA')).toBe('jakarta')
    })
    
    test('replaces spaces with hyphens', () => {
      expect(normalizeTenantId('beauty clinic jakarta')).toBe('beauty-clinic-jakarta')
    })
    
    test('removes special characters', () => {
      expect(normalizeTenantId('jakarta@#$%')).toBe('jakarta----')
    })
  })
  
  describe('getTenantBySlug', () => {
    test('returns tenant for valid slug', () => {
      const tenant = getTenantBySlug('jakarta')
      expect(tenant?.id).toBe('beauty-clinic-jakarta')
      expect(tenant?.name).toBe('Beauty Clinic Jakarta')
    })
    
    test('returns null for invalid slug', () => {
      const tenant = getTenantBySlug('invalid')
      expect(tenant).toBeNull()
    })
  })
  
  describe('getAllTenants', () => {
    test('returns all configured tenants', () => {
      const tenants = getAllTenants()
      expect(tenants.length).toBeGreaterThan(0)
      expect(tenants.some(t => t.slug === 'jakarta')).toBe(true)
      expect(tenants.some(t => t.slug === 'bali')).toBe(true)
      expect(tenants.some(t => t.slug === 'surabaya')).toBe(true)
    })
  })
})

describe('Tenant Features', () => {
  test('jakarta tenant has walk-in enabled', () => {
    const tenant = getTenantBySlug('jakarta')
    expect(tenant?.features?.walkIn).toBe(true)
  })
  
  test('surabaya tenant has walk-in disabled', () => {
    const tenant = getTenantBySlug('surabaya')
    expect(tenant?.features?.walkIn).toBe(false)
  })
  
  test('bali tenant has multiple locations', () => {
    const tenant = getTenantBySlug('bali')
    expect(tenant?.features?.multipleLocations).toBe(true)
  })
})

describe('Tenant Themes', () => {
  test('each tenant has unique colors', () => {
    const jakarta = getTenantBySlug('jakarta')
    const bali = getTenantBySlug('bali')
    const surabaya = getTenantBySlug('surabaya')
    
    expect(jakarta?.theme?.primaryColor).toBe('#FF6B6B')
    expect(bali?.theme?.primaryColor).toBe('#6B5B95')
    expect(surabaya?.theme?.primaryColor).toBe('#F7CAC9')
    
    expect(jakarta?.theme?.primaryColor).not.toBe(bali?.theme?.primaryColor)
    expect(bali?.theme?.primaryColor).not.toBe(surabaya?.theme?.primaryColor)
  })
})