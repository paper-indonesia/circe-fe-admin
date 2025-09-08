import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Tenant from '@/models/Tenant'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectMongoDB()

    // Find tenant by slug
    const tenant = await Tenant.findBySlug(params.slug)

    if (!tenant) {
      // Return default tenant config for known slugs
      const defaultTenants: Record<string, any> = {
        jakarta: {
          name: 'Jakarta Branch',
          slug: 'jakarta',
          config: {
            theme: {
              primaryColor: '#8B5CF6',
              secondaryColor: '#EC4899'
            },
            features: {
              walkIn: true,
              reporting: true,
              multipleLocations: false
            }
          }
        },
        bali: {
          name: 'Bali Branch',
          slug: 'bali',
          config: {
            theme: {
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981'
            },
            features: {
              walkIn: true,
              reporting: true,
              multipleLocations: true
            }
          }
        },
        surabaya: {
          name: 'Surabaya Branch',
          slug: 'surabaya',
          config: {
            theme: {
              primaryColor: '#F59E0B',
              secondaryColor: '#EF4444'
            },
            features: {
              walkIn: true,
              reporting: true,
              multipleLocations: false
            }
          }
        }
      }
      
      if (defaultTenants[params.slug]) {
        return NextResponse.json({
          tenant: defaultTenants[params.slug]
        })
      }
      
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
        config: tenant.config,
        createdAt: tenant.createdAt,
      }
    })
  } catch (error) {
    console.error('Get tenant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}