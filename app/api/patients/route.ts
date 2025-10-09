import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'patients.json')

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
    const patients = readData()
    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const patients = readData()

    // Check if patient with this phone already exists
    if (body.phone) {
      const existingIndex = patients.findIndex((p: any) => p.phone === body.phone)
      if (existingIndex !== -1) {
        // Update existing patient
        patients[existingIndex] = {
          ...patients[existingIndex],
          name: body.name || patients[existingIndex].name,
          email: body.email || patients[existingIndex].email,
          notes: body.notes || patients[existingIndex].notes
        }
        writeData(patients)
        return NextResponse.json(patients[existingIndex], { status: 200 })
      }
    }

    // Create new patient
    const newPatient = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    patients.push(newPatient)
    writeData(patients)
    return NextResponse.json(newPatient, { status: 201 })
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return NextResponse.json({
      error: 'Failed to create patient',
      message: error.message
    }, { status: 500 })
  }
}
