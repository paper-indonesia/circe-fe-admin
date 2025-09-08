import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Tenant from '@/models/Tenant'
import { getUserFromRequest, isPlatformAdmin } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB()
    
    const tenant = await Tenant.findById(params.id)
    
    if (!tenant) {
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, slug, isActive, config } = body

    await connectMongoDB()

    // Check if slug is being changed and if it already exists
    if (slug) {
      const existingTenant = await Tenant.findOne({ 
        slug, 
        _id: { $ne: params.id } 
      })
      
      if (existingTenant) {
        return NextResponse.json(
          { error: 'A tenant with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const tenant = await Tenant.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(config && { config }),
      },
      { new: true }
    )

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
        config: tenant.config,
      }
    })
  } catch (error) {
    console.error('Update tenant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is platform admin
    const user = getUserFromRequest(req)
    if (!user || !isPlatformAdmin(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectMongoDB()

    // Don't allow deletion of default tenants
    const tenant = await Tenant.findById(params.id)
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of default tenants
    const defaultSlugs = ['jakarta', 'bali', 'surabaya']
    if (defaultSlugs.includes(tenant.slug)) {
      return NextResponse.json(
        { error: 'Cannot delete default tenants' },
        { status: 400 }
      )
    }

    await Tenant.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Tenant deleted successfully'
    })
  } catch (error) {
    console.error('Delete tenant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}