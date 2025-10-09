import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'treatments.json')

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeData(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const treatments = readData().filter((t: any) => t.isActive !== false)
    return NextResponse.json(treatments)
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const treatments = readData()

    // Check for duplicate name
    const existingTreatment = treatments.find((t: any) => t.name === body.name)
    if (existingTreatment) {
      return NextResponse.json({
        error: 'A treatment with this name already exists',
        details: 'Please use a different name for this treatment'
      }, { status: 400 })
    }

    const newTreatment = {
      id: Date.now().toString(),
      ...body,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    treatments.push(newTreatment)
    writeData(treatments)
    console.log('[API] Treatment created successfully:', newTreatment)
    return NextResponse.json(newTreatment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating treatment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create treatment'
    return NextResponse.json({
      error: 'Failed to create treatment',
      details: errorMessage
    }, { status: 500 })
  }
}
