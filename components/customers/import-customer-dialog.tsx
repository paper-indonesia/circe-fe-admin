"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Sparkles, Loader2, X } from "lucide-react"
import { downloadCustomerTemplate, parseExcelFile } from "@/lib/excel-template"
import { validateAndFormatPhone } from "@/lib/phone-utils"
import { useToast } from "@/hooks/use-toast"

interface ImportRow {
  rowNumber: number
  name: string
  phone: string
  email?: string
  gender?: string
  originalPhone: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface ImportCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
}

export function ImportCustomerDialog({ open, onOpenChange, onImportSuccess }: ImportCustomerDialogProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [previewData, setPreviewData] = useState<ImportRow[]>([])
  const [step, setStep] = useState<'upload' | 'preview'>('upload')

  // Progress tracking
  const [importProgress, setImportProgress] = useState(0)
  const [currentCustomer, setCurrentCustomer] = useState('')
  const [progressStats, setProgressStats] = useState({
    total: 0,
    current: 0,
    success: 0,
    alreadyExists: 0,
    failed: 0
  })

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateName = (name: string): boolean => {
    return name && name.trim().length >= 2
  }

  const validateGender = (gender: string): boolean => {
    if (!gender) return true // Optional field
    const validGenders = ['male', 'female', 'other', 'laki-laki', 'perempuan']
    return validGenders.includes(gender.toLowerCase())
  }

  const validateAndFormatRow = (row: any, rowIndex: number): ImportRow => {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate and format name
    const name = row.name?.toString().trim() || ''
    if (!validateName(name)) {
      errors.push('Name is required (min 2 characters)')
    }

    // Validate and format phone
    const originalPhone = row.phone?.toString() || ''
    const phoneResult = validateAndFormatPhone(originalPhone)

    if (!phoneResult.valid) {
      errors.push(phoneResult.error || 'Invalid phone number')
    } else if (phoneResult.wasFormatted) {
      warnings.push(`Phone auto-formatted from ${originalPhone}`)
    }

    // Validate email
    const email = row.email?.toString().trim() || ''
    if (email && !validateEmail(email)) {
      errors.push('Invalid email format')
    }

    // Validate gender
    const gender = row.gender?.toString().toLowerCase().trim() || ''
    if (gender && !validateGender(gender)) {
      warnings.push('Gender should be: male, female, or other')
    }

    return {
      rowNumber: rowIndex + 1,
      name,
      phone: phoneResult.formatted,
      email,
      gender,
      originalPhone,
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive"
      })
      return
    }

    setFile(selectedFile)
    setParsing(true)

    try {
      const data = await parseExcelFile(selectedFile)

      if (data.length === 0) {
        toast({
          title: "Empty File",
          description: "The Excel file has no data. Please add customer information.",
          variant: "destructive"
        })
        setParsing(false)
        return
      }

      if (data.length > 1000) {
        toast({
          title: "Too Many Rows",
          description: "Maximum 1000 customers per import. Please split your file.",
          variant: "destructive"
        })
        setParsing(false)
        return
      }

      // Validate and format each row
      const validated = data.map((row, index) => validateAndFormatRow(row, index))

      // Drop duplicates based on normalized phone number
      const seenPhones = new Set<string>()
      const uniqueRows: ImportRow[] = []
      let duplicatesRemoved = 0

      for (const row of validated) {
        if (row.isValid && row.phone) {
          if (seenPhones.has(row.phone)) {
            duplicatesRemoved++
            continue // Skip duplicate
          }
          seenPhones.add(row.phone)
        }
        uniqueRows.push(row)
      }

      setPreviewData(uniqueRows)
      setStep('preview')

      const message = duplicatesRemoved > 0
        ? `Found ${validated.length} rows. Removed ${duplicatesRemoved} duplicate phone number${duplicatesRemoved > 1 ? 's' : ''}. ${uniqueRows.length} unique customers ready to review.`
        : `Found ${validated.length} rows. Review below before importing.`

      toast({
        title: "File Parsed Successfully",
        description: message
      })
    } catch (error: any) {
      toast({
        title: "Parse Error",
        description: error.message || "Failed to read Excel file",
        variant: "destructive"
      })
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    const validRows = previewData.filter(row => row.isValid)

    if (validRows.length === 0) {
      toast({
        title: "No Valid Data",
        description: "Please fix all errors before importing",
        variant: "destructive"
      })
      return
    }

    setImporting(true)

    try {
      // Get tenant_id from localStorage
      const tenantStr = localStorage.getItem('tenant')
      if (!tenantStr) {
        throw new Error('Session expired. Please login again.')
      }

      const tenant = JSON.parse(tenantStr)
      const tenantId = tenant.id || tenant._id

      if (!tenantId) {
        throw new Error('Tenant information not found. Please login again.')
      }

      // Prepare data for API
      const customersToImport = validRows.map(row => ({
        first_name: row.name.split(' ')[0] || row.name,
        last_name: row.name.split(' ').slice(1).join(' ') || row.name,
        phone: row.phone,
        tenant_id: tenantId,
        email: row.email || undefined,
        gender: row.gender || undefined
      }))

      // Initialize progress
      const total = customersToImport.length
      setProgressStats({
        total,
        current: 0,
        success: 0,
        alreadyExists: 0,
        failed: 0
      })
      setImportProgress(0)

      // Import customers one by one using /api/customers
      let successCount = 0
      let alreadyExistsCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (let i = 0; i < customersToImport.length; i++) {
        const customer = customersToImport[i]
        const customerName = `${customer.first_name} ${customer.last_name}`

        // Update current customer being processed
        setCurrentCustomer(customerName)

        try {
          const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customer)
          })

          if (!response.ok) {
            const errorData = await response.json()

            // Check if error is "already exists"
            if (errorData.error && errorData.error.includes('already exists')) {
              alreadyExistsCount++
            } else {
              failedCount++
              errors.push(`${customerName}: ${errorData.error || errorData.detail || 'Unknown error'}`)
            }
          } else {
            successCount++
          }
        } catch (error: any) {
          failedCount++
          errors.push(`${customerName}: ${error.message}`)
        }

        // Update progress
        const currentIndex = i + 1
        const progress = Math.round((currentIndex / total) * 100)
        setImportProgress(progress)
        setProgressStats({
          total,
          current: currentIndex,
          success: successCount,
          alreadyExists: alreadyExistsCount,
          failed: failedCount
        })
      }

      // Show detailed report
      const totalProcessed = successCount + alreadyExistsCount + failedCount
      let reportMessage = []

      if (successCount > 0) {
        reportMessage.push(`✅ ${successCount} customer${successCount > 1 ? 's' : ''} added successfully`)
      }

      if (alreadyExistsCount > 0) {
        reportMessage.push(`ℹ️ ${alreadyExistsCount} customer${alreadyExistsCount > 1 ? 's' : ''} already exist${alreadyExistsCount === 1 ? 's' : ''} in database`)
      }

      if (failedCount > 0) {
        reportMessage.push(`❌ ${failedCount} customer${failedCount > 1 ? 's' : ''} failed`)
      }

      toast({
        title: "Import Complete",
        description: reportMessage.join('\n'),
        duration: 8000
      })

      // Show errors if any
      if (errors.length > 0) {
        console.error('Import errors:', errors)
        toast({
          title: "Some Imports Failed",
          description: `First error: ${errors[0]}. Check console for details.`,
          variant: "destructive",
          duration: 8000
        })
      }

      onImportSuccess()
      handleClose()
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setStep('upload')
    setImportProgress(0)
    setCurrentCustomer('')
    setProgressStats({
      total: 0,
      current: 0,
      success: 0,
      alreadyExists: 0,
      failed: 0
    })
    onOpenChange(false)
  }

  const handleDownloadTemplate = () => {
    downloadCustomerTemplate()
    toast({
      title: "Template Downloaded",
      description: "Check your downloads folder for the template file"
    })
  }

  const validCount = previewData.filter(row => row.isValid).length
  const errorCount = previewData.length - validCount
  const autoFormattedCount = previewData.filter(row =>
    row.isValid && row.originalPhone !== row.phone
  ).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Customers from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to bulk import customer data
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            {/* Action Buttons - Side by Side */}
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">Get Started</h3>
                    <p className="text-sm text-gray-600">
                      Download template, fill it with customer data, then upload
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2 bg-white">
                      <Download className="h-4 w-4" />
                      Download Template
                    </Button>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="excel-upload"
                      disabled={parsing}
                    />
                    <label htmlFor="excel-upload" className="w-full sm:w-auto">
                      <Button asChild disabled={parsing} className="gap-2 w-full">
                        <span>
                          {parsing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Parsing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Upload Excel File
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm mt-3 p-2 bg-white rounded border border-green-200">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="text-gray-700 font-medium">{file.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Format Guide - Compact */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  📋 Required Format
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">name</span>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-xs text-gray-600">Full name (min 2 characters)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">phone</span>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">Indonesian number (9-13 digits)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">email</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                      <p className="text-xs text-gray-600">Valid email format</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">gender</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                      <p className="text-xs text-gray-600">male, female, or other</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Import Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{previewData.length}</div>
                    <div className="text-xs text-gray-600">Total Rows</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{validCount}</div>
                    <div className="text-xs text-gray-600">Valid</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">{autoFormattedCount}</div>
                    <div className="text-xs text-gray-600">Auto-formatted</div>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                </div>

                {autoFormattedCount > 0 && (
                  <Alert className="mt-4 bg-blue-50 border-blue-200">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Auto-Format Applied</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      {autoFormattedCount} phone numbers were automatically formatted to +62 format
                    </AlertDescription>
                  </Alert>
                )}

                {errorCount > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Errors Found</AlertTitle>
                    <AlertDescription>
                      {errorCount} rows have errors. Only valid rows will be imported.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Progress Bar - Show during import */}
            {importing && (
              <Card className="border-[#8B5CF6]">
                <CardContent className="pt-6 space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Importing customers... {progressStats.current} / {progressStats.total}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentCustomer}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-[#8B5CF6]">
                      {importProgress}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>

                  {/* Live Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {progressStats.success}
                      </div>
                      <div className="text-xs text-green-700 font-medium">Added</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {progressStats.alreadyExists}
                      </div>
                      <div className="text-xs text-blue-700 font-medium">Exists</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {progressStats.failed}
                      </div>
                      <div className="text-xs text-red-700 font-medium">Failed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead className="w-16">Row</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row) => (
                      <TableRow
                        key={row.rowNumber}
                        className={row.isValid ? 'bg-green-50/30' : 'bg-red-50/30'}
                      >
                        <TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div>{row.name || <span className="text-gray-400">-</span>}</div>
                            {row.errors.some(e => e.includes('Name')) && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm">{row.phone || <span className="text-gray-400">-</span>}</span>
                              {row.originalPhone !== row.phone && row.isValid && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Formatted
                                </Badge>
                              )}
                            </div>
                            {row.originalPhone !== row.phone && (
                              <div className="text-xs text-gray-500">
                                Original: {row.originalPhone}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm">
                          {row.email || <span className="text-gray-400">-</span>}
                        </TableCell>

                        <TableCell className="text-sm capitalize">
                          {row.gender || <span className="text-gray-400">-</span>}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {row.isValid ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Valid
                              </Badge>
                            ) : (
                              <div className="space-y-1">
                                {row.errors.map((err, idx) => (
                                  <Badge key={idx} variant="destructive" className="block text-xs">
                                    {err}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {row.warnings.map((warn, idx) => (
                              <Badge key={idx} variant="secondary" className="block text-xs">
                                ⚠️ {warn}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={() => setStep('upload')} disabled={importing}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setPreviewData([])
                    setStep('upload')
                  }}
                  disabled={importing}
                >
                  Upload Different File
                </Button>

                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || importing}
                  className="gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing {validCount} customers...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Import {validCount} Valid Customers
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
