"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"
import { TNCSections } from "@/components/tnc-sections"

interface TermsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-purple-700 px-8 py-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-1">
                Terms & Conditions
              </DialogTitle>
              <p className="text-white/90 text-sm">
                Syarat & Ketentuan Penggunaan Platform Reserva
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Metadata */}
          <div className="relative mt-4 flex items-center gap-4 text-xs text-white/80">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              Effective: January 2025
            </span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              Version 1.0
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="h-full overflow-y-auto px-8 py-6">
            <TNCSections />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-white px-8 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90 text-white px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
