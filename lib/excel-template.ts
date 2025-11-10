/**
 * Excel Template Generator for Customer Import
 */
import * as XLSX from 'xlsx'

export interface TemplateCustomer {
  name: string
  phone: string
  email: string
  gender: string
}

/**
 * Generate and download Excel template for customer import
 */
export const downloadCustomerTemplate = () => {
  // Sample data rows
  const sampleData: TemplateCustomer[] = [
    {
      name: 'John Doe',
      phone: '+6281234567890',
      email: 'john@example.com',
      gender: 'male'
    },
    {
      name: 'Jane Smith',
      phone: '+6285678901234',
      email: 'jane@example.com',
      gender: 'female'
    },
    {
      name: 'Ahmad Santoso',
      phone: '+6287654321098',
      email: '',
      gender: 'male'
    }
  ]

  // Create workbook
  const wb = XLSX.utils.book_new()

  // Sheet 1: Customer Data with sample rows
  const ws1 = XLSX.utils.json_to_sheet(sampleData)

  // Set column widths
  ws1['!cols'] = [
    { wch: 20 },  // name
    { wch: 18 },  // phone
    { wch: 25 },  // email
    { wch: 12 }   // gender
  ]

  XLSX.utils.book_append_sheet(wb, ws1, 'Customer Data')

  // Sheet 2: Instructions
  const instructions = [
    ['HOW TO USE THIS TEMPLATE'],
    [''],
    ['REQUIRED FIELDS:'],
    ['• name: Customer full name (minimum 2 characters)'],
    ['• phone: Must start with +62 followed by 9-13 digits'],
    ['  Example: +6281234567890'],
    [''],
    ['✨ PHONE NUMBER AUTO-FORMAT:'],
    ['We automatically fix common formats! You can enter:'],
    ['✅ 08123456789   → Auto-converts to +628123456789'],
    ['✅ 8123456789    → Auto-converts to +628123456789'],
    ['✅ 628123456789  → Auto-converts to +628123456789'],
    ['✅ +628123456789 → Already correct!'],
    [''],
    ['WITH FORMATTING (we will clean it):'],
    ['✅ 0812-3456-789  → +628123456789'],
    ['✅ 0812 3456 789  → +628123456789'],
    ['✅ (0812) 345-6789 → +628123456789'],
    [''],
    ['OPTIONAL FIELDS:'],
    ['• email: Valid email format (example@domain.com)'],
    ['• gender: Choose one: male, female, other'],
    [''],
    ['IMPORTANT NOTES:'],
    ['1. Do not change column headers (name, phone, email, gender)'],
    ['2. Delete example rows before uploading'],
    ['3. Maximum 1000 customers per import'],
    ['4. Phone numbers must be unique'],
    ['5. Duplicate phone numbers will be skipped'],
    [''],
    ['COMMON MISTAKES:'],
    ['❌ Phone without +62: 81234567890'],
    ['✅ Correct format: +6281234567890 (or just 081234567890, we will fix it!)'],
    [''],
    ['❌ Invalid email: john@email'],
    ['✅ Correct email: john@email.com'],
    [''],
    ['❌ Invalid gender: L'],
    ['✅ Correct gender: male, female, or other'],
    [''],
    ['STEP BY STEP:'],
    ['1. Fill in your customer data in the "Customer Data" sheet'],
    ['2. Delete the example rows (John Doe, Jane Smith, Ahmad)'],
    ['3. Save the file'],
    ['4. Upload it in the import dialog'],
    ['5. Review the preview before confirming import'],
    [''],
    ['Need help? Contact support or check documentation']
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(instructions)

  // Set column width for instructions
  ws2['!cols'] = [{ wch: 80 }]

  // Style the header
  if (ws2['A1']) {
    ws2['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'left' }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws2, 'Instructions')

  // Generate file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })

  // Download file
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `customer_import_template_${new Date().getTime()}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Parse uploaded Excel file
 */
export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })

        // Get first sheet (Customer Data)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
          raw: false,  // Keep as strings
          defval: ''   // Default value for empty cells
        })

        resolve(jsonData)
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please use the provided template.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}
