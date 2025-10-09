import fs from 'fs'
import path from 'path'

export function createJsonDB(filename: string) {
  const dataFile = path.join(process.cwd(), 'data', filename)

  function readData() {
    try {
      const data = fs.readFileSync(dataFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  function writeData(data: any[]) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2))
  }

  return { readData, writeData }
}
