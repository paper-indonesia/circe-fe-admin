import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'withdrawals.json')

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
    const withdrawals = readData()
    return NextResponse.json(withdrawals)
  } catch (error) {
    console.error('Error fetching withdrawals:', error)
    return NextResponse.json({ error: 'Failed to fetch withdrawals' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const withdrawals = readData()

    const newWithdrawal = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    withdrawals.push(newWithdrawal)
    writeData(withdrawals)
    return NextResponse.json(newWithdrawal, { status: 201 })
  } catch (error) {
    console.error('Error creating withdrawal:', error)
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 })
  }
}
