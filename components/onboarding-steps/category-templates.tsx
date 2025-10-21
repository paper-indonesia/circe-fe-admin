"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Layers, Plus, Trash2, Info, CheckCircle2, Sparkles, ChevronDown } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { motion, AnimatePresence } from "framer-motion"

interface CategoryTemplatesStepProps {
  onValidChange: (isValid: boolean) => void
}

interface CategoryTemplate {
  id: string
  name: string
  description?: string
  is_default?: boolean
  is_selected?: boolean
}

export function CategoryTemplatesStep({ onValidChange }: CategoryTemplatesStepProps) {
  const { toast } = useToast()
  const { progress, setServiceCategoryTemplates } = useOperationalOnboarding()

  const [templates, setTemplates] = useState<CategoryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [customCategory, setCustomCategory] = useState("")
  const [showTemplateList, setShowTemplateList] = useState(true)

  // Load templates from API
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch("/api/services/categories/templates")
        if (response.ok) {
          const data = await response.json()

          // If templates exist from API, use them with all selected by default
          if (data.templates && data.templates.length > 0) {
            setTemplates(data.templates.map((t: any) => ({
              ...t,
              is_selected: true
            })))
          } else {
            // Use default templates if none from API
            setTemplates(getDefaultTemplates())
          }
        } else {
          // Fallback to default templates on error
          setTemplates(getDefaultTemplates())
        }
      } catch (error) {
        console.error("Failed to load category templates:", error)
        // Fallback to default templates
        setTemplates(getDefaultTemplates())
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [])

  // Default templates for beauty clinic/salon/spa services
  const getDefaultTemplates = (): CategoryTemplate[] => [
    { id: "1", name: "Facial Treatment", description: "Face care and treatment services", is_default: true, is_selected: true },
    { id: "2", name: "Body Treatment", description: "Body care and spa services", is_default: true, is_selected: true },
    { id: "3", name: "Massage", description: "Various massage services", is_default: true, is_selected: true },
    { id: "4", name: "Hair Treatment", description: "Hair care and styling", is_default: true, is_selected: true },
    { id: "5", name: "Nail Care", description: "Manicure and pedicure services", is_default: true, is_selected: true },
    { id: "6", name: "Waxing", description: "Hair removal services", is_default: true, is_selected: true },
    { id: "7", name: "Skin Treatment", description: "Advanced skin care procedures", is_default: true, is_selected: true },
  ]

  // Update validation - always valid (step is optional)
  useEffect(() => {
    // This step is always valid since it's optional with defaults
    onValidChange(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run only once on mount

  // Save to context whenever templates change
  useEffect(() => {
    if (!loading) {
      const selectedTemplates = templates.filter(t => t.is_selected)
      setServiceCategoryTemplates(selectedTemplates)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates, loading]) // Only depend on templates and loading, not the setter

  const toggleTemplate = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, is_selected: !t.is_selected } : t
    ))
  }

  const addCustomCategory = () => {
    if (!customCategory.trim()) return

    // Check if already exists
    const exists = templates.some(t =>
      t.name.toLowerCase() === customCategory.trim().toLowerCase()
    )

    if (exists) {
      toast({
        title: "Sudah Ada",
        description: "Kategori ini sudah ada dalam daftar",
        variant: "destructive",
      })
      return
    }

    const newTemplate: CategoryTemplate = {
      id: `custom-${Date.now()}`,
      name: customCategory.trim(),
      description: "Custom category",
      is_default: false,
      is_selected: true,
    }

    setTemplates([...templates, newTemplate])
    setCustomCategory("")

    toast({
      title: "Berhasil",
      description: "Kategori kustom berhasil ditambahkan",
    })
  }

  const removeCustomCategory = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id))
    toast({
      title: "Dihapus",
      description: "Kategori kustom berhasil dihapus",
    })
  }

  const handleUseDefaults = () => {
    // Select all default templates
    const updatedTemplates = templates.map(t => ({
      ...t,
      is_selected: t.is_default || false
    }))
    setTemplates(updatedTemplates)

    toast({
      title: "Menggunakan Default",
      description: "Semua kategori default telah dipilih",
    })
  }

  const selectedCount = templates.filter(t => t.is_selected).length

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
        <Card className="p-5 border-blue-200 bg-blue-50 min-h-[130px] flex max-w-full">
          <div className="flex items-start gap-3 min-w-0 w-full">
            <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 mb-2 truncate">Langkah Opsional</h3>
              <p className="text-sm text-blue-700 leading-relaxed break-words">
                Pilih kategori layanan yang akan digunakan. Anda bisa skip dan menggunakan default, atau customize sesuai bisnis Anda.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-purple-200 bg-purple-50 min-h-[130px] flex max-w-full">
          <div className="flex items-start gap-3 min-w-0 w-full">
            <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-purple-900 mb-2 truncate">Kenapa ini berguna</h3>
              <p className="text-sm text-purple-700 leading-relaxed break-words">
                Kategori membantu mengorganisir layanan Anda, mempermudah navigasi pelanggan, dan laporan bisnis lebih terstruktur.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Action */}
      <Alert className="border-green-200 bg-green-50">
        <Sparkles className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 flex items-center justify-between">
          <span>
            {selectedCount} kategori terpilih. Klik tombol di bawah untuk menggunakan semua default dan lanjut.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseDefaults}
            className="ml-4 bg-white hover:bg-green-50 border-green-300 text-green-700"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Gunakan Default
          </Button>
        </AlertDescription>
      </Alert>

      {/* Template Selection */}
      {loading ? (
        <Card className="p-6 rounded-xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-xl max-w-full">
          <button
            onClick={() => setShowTemplateList(!showTemplateList)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-t-xl"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Layers className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">Pilih Kategori Layanan</h3>
              <Badge variant="secondary" className="ml-2 flex-shrink-0">{selectedCount} dipilih</Badge>
            </div>
            <motion.div
              animate={{ rotate: showTemplateList ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 ml-2"
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {showTemplateList && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                    {templates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
                          template.is_selected
                            ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Checkbox
                          id={template.id}
                          checked={template.is_selected}
                          onCheckedChange={() => toggleTemplate(template.id)}
                          className="mt-1 h-5 w-5"
                        />
                        <div className="flex-1 min-w-0">
                          <Label
                            htmlFor={template.id}
                            className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2"
                          >
                            {template.name}
                            {template.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </Label>
                          {template.description && (
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          )}
                        </div>
                        {!template.is_default && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCustomCategory(template.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Add Custom Category */}
      <Card className="p-6 rounded-xl max-w-full overflow-x-hidden">
        <div className="flex items-center gap-3 mb-4 min-w-0">
          <Plus className="h-5 w-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base font-semibold truncate">Tambah Kategori Kustom</h3>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Contoh: Laser Treatment, Medical Spa"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomCategory()
                }
              }}
              className="h-11 rounded-lg"
            />
          </div>
          <Button
            onClick={addCustomCategory}
            disabled={!customCategory.trim()}
            className="h-11"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
        </div>
      </Card>
    </div>
  )
}
