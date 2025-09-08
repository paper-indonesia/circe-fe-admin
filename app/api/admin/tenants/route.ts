import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import { getUserFromRequest, isPlatformAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB()

    // Get all active tenants from MongoDB
    const tenants = await Tenant.findActive()
    
    // If we have tenants from DB, return them
    if (tenants && tenants.length > 0) {
      return NextResponse.json({
        tenants: tenants.map(tenant => ({
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug,
          isActive: tenant.isActive,
          config: {
            ...tenant.config,
            theme: tenant.config?.theme || {
              primaryColor: '#8B5CF6',
              secondaryColor: '#EC4899'
            },
            features: tenant.config?.features || {
              maxUsers: 100,
              maxBookings: 1000,
              walkIn: true,
              reporting: true,
              multipleLocations: false
            }
          },
          createdAt: tenant.createdAt,
        }))
      })
    }
    
    // Otherwise return default tenants
    return NextResponse.json({
      tenants: [
        {
          id: '1',
          name: 'Jakarta',
          slug: 'jakarta',
          isActive: true,
          config: {
            theme: {
              primaryColor: '#8B5CF6',
              secondaryColor: '#EC4899'
            },
            features: {
              maxUsers: 100,
              maxBookings: 1000,
              walkIn: true,
              reporting: true,
              multipleLocations: false
            }
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bali',
          slug: 'bali',
          isActive: true,
          config: {
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981'
            },
            features: {
              maxUsers: 100,
              maxBookings: 1000,
              walkIn: true,
              reporting: true,
              multipleLocations: true
            }
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Surabaya',
          slug: 'surabaya',
          isActive: true,
          config: {
            theme: {
              primaryColor: '#F59E0B',
              secondaryColor: '#EF4444'
            },
            features: {
              maxUsers: 100,
              maxBookings: 1000,
              walkIn: true,
              reporting: true,
              multipleLocations: false
            }
          },
          createdAt: new Date().toISOString(),
        },
      ]
    })
  } catch (error) {
    console.error('Get tenants error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user is platform admin
    const user = getUserFromRequest(req)
    if (!user || !isPlatformAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, slug, domain, config, createdBy } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Check if slug already exists
    const existingTenant = await Tenant.findBySlug(slug)
    if (existingTenant) {
      return NextResponse.json(
        { error: 'A tenant with this slug already exists' },
        { status: 400 }
      )
    }

    // Create new tenant
    const tenant = new Tenant({
      name,
      slug,
      domain,
      config: config || {},
      createdBy: createdBy || user.userId,
      isActive: true,
    })

    await tenant.save()

    // Create default admin user for the new tenant
    try {
      const User = (await import('@/models/User')).default
      const { hashPassword } = await import('@/lib/auth')
      
      const adminEmail = `admin@${slug}.com`
      const defaultPassword = 'admin123'
      
      const hashedPassword = await hashPassword(defaultPassword)
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        name: `${name} Admin`,
        role: 'admin',
        tenantId: tenant._id.toString(),
        isActive: true,
      })
      
      await adminUser.save()
      console.log(`Created default admin user for tenant ${name}: ${adminEmail}`)
    } catch (userError) {
      console.error('Failed to create default admin user:', userError)
      // Don't fail the tenant creation if user creation fails
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        config: tenant.config,
      },
      defaultAdmin: {
        email: `admin@${slug}.com`,
        password: 'admin123',
        message: 'Default admin user created. Please change the password after first login.'
      }
    })
  } catch (error) {
    console.error('Create tenant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}