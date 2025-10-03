"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Percent,
  DollarSign
} from "lucide-react"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type PaymentMethod = "cash" | "card" | "qris"
type PaymentType = "deposit" | "full"
type DepositMode = "percentage" | "fixed"
type QrisState = "idle" | "generating" | "active" | "expired" | "error"
type CardFormState = "pristine" | "editing" | "validating" | "valid" | "invalid"

interface PaymentInformationProps {
  price: number
  fees?: number
  currency?: string
  bookingId?: string
  userId?: string
  onSubmit: (data: PaymentData) => void
  className?: string
}

interface PaymentData {
  method: PaymentMethod
  type: PaymentType
  deposit: {
    mode: DepositMode
    value: number
    amount: number
  } | null
  card: {
    brand: string
    maskedNumber: string
    expiry: string
    cvv: string
  } | null
  qris: {
    token: string
    expiresAt: string
  } | null
  totals: {
    subtotal: number
    fee: number
    grandTotal: number
  }
}

interface CardBrand {
  name: string
  pattern: RegExp
  logo: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CARD_BRANDS: CardBrand[] = [
  { name: "visa", pattern: /^4/, logo: "💳" },
  { name: "mastercard", pattern: /^5[1-5]/, logo: "💳" },
  { name: "amex", pattern: /^3[47]/, logo: "💳" },
  { name: "jcb", pattern: /^35/, logo: "💳" },
]

const QR_TIMEOUT = 15 * 60 // 15 minutes in seconds

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  const chunks = cleaned.match(/.{1,4}/g) || []
  return chunks.join(" ").substring(0, 19)
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length >= 2) {
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
  }
  return cleaned
}

function detectCardBrand(cardNumber: string): CardBrand | null {
  const cleaned = cardNumber.replace(/\D/g, "")
  return CARD_BRANDS.find(brand => brand.pattern.test(cleaned)) || null
}

function luhnCheck(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, "")
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

function validateExpiry(expiry: string): { valid: boolean; message?: string } {
  const [month, year] = expiry.split("/").map(v => parseInt(v))

  if (!month || !year) {
    return { valid: false, message: "Format MM/YY diperlukan" }
  }

  if (month < 1 || month > 12) {
    return { valid: false, message: "Bulan harus 01-12" }
  }

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: "Bulan/tahun sudah lewat" }
  }

  return { valid: true }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PaymentInformation({
  price,
  fees = 0,
  currency = "IDR",
  bookingId,
  userId,
  onSubmit,
  className
}: PaymentInformationProps) {
  const [hasInteracted, setHasInteracted] = useState(false)
  // State Management
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [type, setType] = useState<PaymentType>("deposit")
  const [depositMode, setDepositMode] = useState<DepositMode>("percentage")
  const [depositPercentage, setDepositPercentage] = useState(50)
  const [depositFixed, setDepositFixed] = useState(0)

  // Card State
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardFormState, setCardFormState] = useState<CardFormState>("pristine")
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({})

  // QRIS State
  const [qrisState, setQrisState] = useState<QrisState>("idle")
  const [qrisToken, setQrisToken] = useState("")
  const [qrisExpiry, setQrisExpiry] = useState("")
  const [qrisCountdown, setQrisCountdown] = useState(QR_TIMEOUT)

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const depositAmount = useMemo(() => {
    if (type === "full") return price

    if (depositMode === "percentage") {
      return price * (depositPercentage / 100)
    } else {
      return Math.min(depositFixed, price)
    }
  }, [type, depositMode, depositPercentage, depositFixed, price])

  const grandTotal = useMemo(() => {
    const subtotal = type === "deposit" ? depositAmount : price
    return subtotal + fees
  }, [type, depositAmount, price, fees])

  const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber])

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateCard = () => {
    const newErrors: Record<string, string> = {}
    const cleaned = cardNumber.replace(/\D/g, "")

    if (cleaned.length < 13 || cleaned.length > 19) {
      newErrors.cardNumber = "Nomor kartu tidak valid (13-19 digit)"
    } else if (!luhnCheck(cleaned)) {
      newErrors.cardNumber = "Nomor kartu tidak valid (cek digit)"
    }

    const expiryValidation = validateExpiry(cardExpiry)
    if (!expiryValidation.valid) {
      newErrors.cardExpiry = expiryValidation.message || "Expiry tidak valid"
    }

    const cvvLength = cardBrand?.name === "amex" ? 4 : 3
    if (cardCvv.length !== cvvLength) {
      newErrors.cardCvv = `CVV harus ${cvvLength} digit`
    }

    setCardErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDeposit = () => {
    const newErrors: Record<string, string> = {}

    if (depositMode === "percentage") {
      if (depositPercentage < 1 || depositPercentage > 100) {
        newErrors.deposit = "Persentase harus 1-100%"
      }
    } else {
      if (depositFixed <= 0) {
        newErrors.deposit = "Nominal harus lebih dari 0"
      } else if (depositFixed > price) {
        newErrors.deposit = "Tidak boleh melebihi harga layanan"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============================================================================
  // QRIS HANDLERS
  // ============================================================================

  const generateQris = async () => {
    setQrisState("generating")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const token = `QR${Date.now()}`
      const expiresAt = new Date(Date.now() + QR_TIMEOUT * 1000).toISOString()

      setQrisToken(token)
      setQrisExpiry(expiresAt)
      setQrisState("active")
      setQrisCountdown(QR_TIMEOUT)
    } catch (error) {
      setQrisState("error")
    }
  }

  const refreshQris = () => {
    setQrisState("idle")
    setQrisToken("")
    setQrisExpiry("")
    generateQris()
  }

  // ============================================================================
  // COUNTDOWN TIMER
  // ============================================================================

  useEffect(() => {
    if (qrisState !== "active" || qrisCountdown <= 0) return

    const timer = setInterval(() => {
      setQrisCountdown(prev => {
        if (prev <= 1) {
          setQrisState("expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [qrisState, qrisCountdown])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // ============================================================================
  // SUBMIT HANDLER
  // ============================================================================

  const handleSubmit = () => {
    setHasInteracted(true)

    // Validate based on method
    if (method === "card" && !validateCard()) {
      return
    }

    if (type === "deposit" && !validateDeposit()) {
      return
    }

    const paymentData: PaymentData = {
      method,
      type,
      deposit: type === "deposit" ? {
        mode: depositMode,
        value: depositMode === "percentage" ? depositPercentage : depositFixed,
        amount: depositAmount
      } : null,
      card: method === "card" ? {
        brand: cardBrand?.name || "unknown",
        maskedNumber: cardNumber.slice(-4).padStart(cardNumber.length, "•"),
        expiry: cardExpiry,
        cvv: cardCvv
      } : null,
      qris: method === "qris" && qrisState === "active" ? {
        token: qrisToken,
        expiresAt: qrisExpiry
      } : null,
      totals: {
        subtotal: type === "deposit" ? depositAmount : price,
        fee: fees,
        grandTotal
      }
    }

    onSubmit(paymentData)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1fr,380px]", className)}>
      {/* Left Column - Main Controls */}
      <div className="space-y-6">
        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metode Pembayaran *</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role="tablist"
              aria-label="Payment method selection"
              className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg"
            >
              <button
                role="tab"
                aria-selected={method === "cash"}
                aria-controls="payment-panel"
                onClick={() => setMethod("cash")}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-4 rounded-md transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  method === "cash"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                <Banknote className="h-5 w-5" />
                <span className="text-sm font-medium">Cash</span>
              </button>

              <button
                role="tab"
                aria-selected={method === "card"}
                aria-controls="payment-panel"
                onClick={() => setMethod("card")}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-4 rounded-md transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  method === "card"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">Card</span>
              </button>

              <button
                role="tab"
                aria-selected={method === "qris"}
                aria-controls="payment-panel"
                onClick={() => setMethod("qris")}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-4 rounded-md transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  method === "qris"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-sm font-medium">QRIS</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipe Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              role="tablist"
              aria-label="Payment type selection"
              className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg"
            >
              <button
                role="tab"
                aria-selected={type === "deposit"}
                onClick={() => setType("deposit")}
                className={cn(
                  "py-3 px-4 rounded-md text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  type === "deposit"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                Bayar sebagian sekarang
              </button>

              <button
                role="tab"
                aria-selected={type === "full"}
                onClick={() => setType("full")}
                className={cn(
                  "py-3 px-4 rounded-md text-sm font-medium transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  type === "full"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                Bayar lunas
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Configuration */}
        {type === "deposit" && (
          <Card className="animate-in slide-in-from-top-2 fade-in duration-200">
            <CardHeader>
              <CardTitle className="text-base">Nilai Deposit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setDepositMode("percentage")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    depositMode === "percentage"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  <Percent className="h-4 w-4" />
                  Persentase
                </button>

                <button
                  onClick={() => setDepositMode("fixed")}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    depositMode === "fixed"
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  <DollarSign className="h-4 w-4" />
                  Nominal Tetap
                </button>
              </div>

              {depositMode === "percentage" ? (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Persentase (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="percentage"
                      type="number"
                      min="1"
                      max="100"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-8">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {depositPercentage}% dari {formatCurrency(price)} = <span className="font-semibold text-foreground">{formatCurrency(depositAmount)}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fixed-amount">Nominal Tetap (Rp)</Label>
                  <Input
                    id="fixed-amount"
                    type="number"
                    min="0"
                    max={price}
                    value={depositFixed}
                    onChange={(e) => setDepositFixed(Math.min(price, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="Masukkan nominal"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maksimal: <span className="font-semibold">{formatCurrency(price)}</span>
                  </p>
                </div>
              )}

              {errors.deposit && (
                <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.deposit}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dynamic Panel based on Method */}
        <div id="payment-panel" className="animate-in slide-in-from-top-2 fade-in duration-200">
          {method === "card" && <CardDetailsPanel />}
          {method === "qris" && <QrisPanel />}
          {method === "cash" && <CashNotePanel />}
        </div>
      </div>

      {/* Right Column - Summary (Sticky) */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <Card className="border-2">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-base">Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Layanan</span>
                <span className="font-medium">{formatCurrency(price)}</span>
              </div>

              {type === "deposit" && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Deposit {depositMode === "percentage" ? `(${depositPercentage}%)` : "(Tetap)"}
                  </span>
                  <span className="font-medium">{formatCurrency(depositAmount)}</span>
                </div>
              )}

              {fees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Biaya Admin</span>
                  <span className="font-medium">{formatCurrency(fees)}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Pembayaran</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (method === "qris" && qrisState !== "active")}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran"}
            </Button>

            {method === "card" && cardFormState === "valid" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Kartu valid</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  function CardDetailsPanel() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Kartu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Nomor Kartu *</Label>
            <div className="relative">
              <Input
                id="card-number"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={formatCardNumber(cardNumber)}
                onChange={(e) => {
                  setCardNumber(e.target.value)
                  setCardFormState("editing")
                }}
                onBlur={validateCard}
                placeholder="1234 5678 9012 3456"
                className={cardErrors.cardNumber ? "border-destructive" : ""}
              />
              {cardBrand && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">
                  {cardBrand.logo}
                </div>
              )}
            </div>
            {cardErrors.cardNumber && (
              <p role="alert" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {cardErrors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="card-expiry">Berlaku Hingga *</Label>
              <Input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={formatExpiry(cardExpiry)}
                onChange={(e) => {
                  setCardExpiry(e.target.value)
                  setCardFormState("editing")
                }}
                onBlur={validateCard}
                placeholder="MM/YY"
                className={cardErrors.cardExpiry ? "border-destructive" : ""}
              />
              {cardErrors.cardExpiry && (
                <p role="alert" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {cardErrors.cardExpiry}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-cvv">CVV *</Label>
              <Input
                id="card-cvv"
                type="text"
                inputMode="numeric"
                maxLength={cardBrand?.name === "amex" ? 4 : 3}
                value={cardCvv}
                onChange={(e) => {
                  setCardCvv(e.target.value.replace(/\D/g, ""))
                  setCardFormState("editing")
                }}
                onBlur={validateCard}
                placeholder={cardBrand?.name === "amex" ? "1234" : "123"}
                className={cardErrors.cardCvv ? "border-destructive" : ""}
              />
              {cardErrors.cardCvv && (
                <p role="alert" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {cardErrors.cardCvv}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function QrisPanel() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pembayaran QRIS</CardTitle>
        </CardHeader>
        <CardContent>
          {qrisState === "idle" && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate kode QR untuk pembayaran
                </p>
                <Button onClick={generateQris} variant="outline">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
            </div>
          )}

          {qrisState === "generating" && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Generating QR Code...</p>
            </div>
          )}

          {qrisState === "active" && (
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">QR Code</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Waktu tersisa</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {formatCountdown(qrisCountdown)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Scan QR code dengan aplikasi mobile banking atau e-wallet Anda
              </p>
            </div>
          )}

          {qrisState === "expired" && (
            <div className="text-center py-8 space-y-4" role="status" aria-live="polite">
              <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-destructive mb-4">
                  Kode QR kedaluwarsa, refresh untuk membuat baru
                </p>
                <Button onClick={refreshQris} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh QR Code
                </Button>
              </div>
            </div>
          )}

          {qrisState === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-destructive mb-4">
                  Gagal generate QR Code
                </p>
                <Button onClick={refreshQris} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  function CashNotePanel() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pembayaran Tunai</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Banknote className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Siapkan uang tunai
              </p>
              <p className="text-xs text-blue-700">
                Pastikan Anda membawa uang tunai sebesar {formatCurrency(grandTotal)} untuk pembayaran
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
}
