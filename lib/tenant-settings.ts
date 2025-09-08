// Tenant-specific settings management
export interface TenantSettings {
  tenantId: string
  general: {
    clinicName: string
    email: string
    phone: string
    address: string
    website?: string
    taxNumber?: string
  }
  operational: {
    openTime: string
    closeTime: string
    workDays: string[]
    timezone: string
    currency: string
    dateFormat: string
    language: string
  }
  booking: {
    allowWalkIn: boolean
    allowOnlineBooking: boolean
    maxAdvanceBookingDays: number
    minAdvanceBookingHours: number
    requireDeposit: boolean
    depositPercentage: number
    cancellationHours: number
    autoConfirm: boolean
    sendReminders: boolean
    reminderHours: number
  }
  payment: {
    acceptCash: boolean
    acceptCard: boolean
    acceptQRIS: boolean
    acceptBankTransfer: boolean
    paymentGateway?: string
    bankAccounts?: Array<{
      bankName: string
      accountNumber: string
      accountName: string
    }>
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    whatsappNotifications: boolean
    notificationEmail?: string
    notificationPhone?: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    faviconUrl?: string
    emailSignature?: string
    invoiceFooter?: string
  }
}

// Default settings for each tenant
const TENANT_SETTINGS: Record<string, TenantSettings> = {
  'beauty-clinic-jakarta': {
    tenantId: 'beauty-clinic-jakarta',
    general: {
      clinicName: 'Beauty Clinic Jakarta',
      email: 'info@beautyclinic-jakarta.com',
      phone: '+62 21 5555 1234',
      address: 'Jl. Sudirman No. 123, Jakarta Pusat 10210',
      website: 'https://jakarta.beautyclinic.com',
      taxNumber: 'NPWP.123.456.789'
    },
    operational: {
      openTime: '09:00',
      closeTime: '21:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      dateFormat: 'DD/MM/YYYY',
      language: 'id'
    },
    booking: {
      allowWalkIn: true,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      requireDeposit: true,
      depositPercentage: 50,
      cancellationHours: 24,
      autoConfirm: false,
      sendReminders: true,
      reminderHours: 24
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptQRIS: true,
      acceptBankTransfer: true,
      paymentGateway: 'Midtrans',
      bankAccounts: [
        {
          bankName: 'BCA',
          accountNumber: '1234567890',
          accountName: 'PT Beauty Clinic Jakarta'
        },
        {
          bankName: 'Mandiri',
          accountNumber: '0987654321',
          accountName: 'PT Beauty Clinic Jakarta'
        }
      ]
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: true,
      notificationEmail: 'admin@beautyclinic-jakarta.com',
      notificationPhone: '+62 812 3456 7890'
    },
    branding: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      logoUrl: '/tenants/jakarta/logo.png',
      faviconUrl: '/tenants/jakarta/favicon.ico',
      emailSignature: 'Best regards,\nBeauty Clinic Jakarta Team',
      invoiceFooter: 'Thank you for choosing Beauty Clinic Jakarta'
    }
  },
  'beauty-clinic-bali': {
    tenantId: 'beauty-clinic-bali',
    general: {
      clinicName: 'Beauty Clinic Bali Spa & Resort',
      email: 'info@beautyclinic-bali.com',
      phone: '+62 361 7777 888',
      address: 'Jl. Sunset Road No. 88, Seminyak, Bali 80361',
      website: 'https://bali.beautyclinic.com',
      taxNumber: 'NPWP.987.654.321'
    },
    operational: {
      openTime: '08:00',
      closeTime: '22:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      timezone: 'Asia/Makassar',
      currency: 'IDR',
      dateFormat: 'DD/MM/YYYY',
      language: 'en'
    },
    booking: {
      allowWalkIn: true,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 60,
      minAdvanceBookingHours: 1,
      requireDeposit: false,
      depositPercentage: 30,
      cancellationHours: 12,
      autoConfirm: true,
      sendReminders: true,
      reminderHours: 12
    },
    payment: {
      acceptCash: true,
      acceptCard: true,
      acceptQRIS: true,
      acceptBankTransfer: false,
      paymentGateway: 'Xendit',
      bankAccounts: []
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      notificationEmail: 'spa@beautyclinic-bali.com',
      notificationPhone: '+62 813 9999 8888'
    },
    branding: {
      primaryColor: '#6B5B95',
      secondaryColor: '#88D8B0',
      logoUrl: '/tenants/bali/logo.png',
      faviconUrl: '/tenants/bali/favicon.ico',
      emailSignature: 'Namaste,\nBeauty Clinic Bali Spa Team',
      invoiceFooter: 'Thank you for your visit. We hope to see you again soon!'
    }
  },
  'skin-care-surabaya': {
    tenantId: 'skin-care-surabaya',
    general: {
      clinicName: 'Skin Care Medical Center Surabaya',
      email: 'info@skincare-surabaya.com',
      phone: '+62 31 8888 999',
      address: 'Jl. Raya Darmo No. 45, Surabaya 60264',
      website: 'https://surabaya.skincarecenter.com',
      taxNumber: 'NPWP.555.666.777'
    },
    operational: {
      openTime: '10:00',
      closeTime: '20:00',
      workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      dateFormat: 'DD/MM/YYYY',
      language: 'id'
    },
    booking: {
      allowWalkIn: false, // Walk-in disabled for Surabaya
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 14,
      minAdvanceBookingHours: 24,
      requireDeposit: true,
      depositPercentage: 100, // Full payment required
      cancellationHours: 48,
      autoConfirm: false,
      sendReminders: true,
      reminderHours: 48
    },
    payment: {
      acceptCash: false, // No cash, medical center policy
      acceptCard: true,
      acceptQRIS: true,
      acceptBankTransfer: true,
      paymentGateway: 'Midtrans',
      bankAccounts: [
        {
          bankName: 'BNI',
          accountNumber: '5555666777',
          accountName: 'PT Skin Care Medical Surabaya'
        }
      ]
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
      notificationEmail: 'medical@skincare-surabaya.com',
      notificationPhone: '+62 811 2222 3333'
    },
    branding: {
      primaryColor: '#F7CAC9',
      secondaryColor: '#92A8D1',
      logoUrl: '/tenants/surabaya/logo.png',
      faviconUrl: '/tenants/surabaya/favicon.ico',
      emailSignature: 'Sincerely,\nSkin Care Medical Center Team',
      invoiceFooter: 'Medical aesthetic services - Professional care for your skin'
    }
  }
}

// Get tenant settings
export function getTenantSettings(tenantId: string): TenantSettings {
  return TENANT_SETTINGS[tenantId] || TENANT_SETTINGS['beauty-clinic-jakarta']
}

// Save tenant settings (to localStorage per tenant)
export function saveTenantSettings(tenantId: string, settings: Partial<TenantSettings>) {
  if (typeof window === 'undefined') return
  
  const currentSettings = getTenantSettings(tenantId)
  const updatedSettings = { ...currentSettings, ...settings }
  
  localStorage.setItem(`tenant-settings-${tenantId}`, JSON.stringify(updatedSettings))
  return updatedSettings
}

// Load tenant settings from localStorage
export function loadTenantSettings(tenantId: string): TenantSettings {
  if (typeof window === 'undefined') return getTenantSettings(tenantId)
  
  const saved = localStorage.getItem(`tenant-settings-${tenantId}`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return getTenantSettings(tenantId)
    }
  }
  return getTenantSettings(tenantId)
}