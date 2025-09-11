"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, cn } from "@/lib/utils"
import { 
  Wallet, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  User,
  Hash,
  Info,
  AlertTriangle
} from "lucide-react"

interface WithdrawalHistory {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestDate: string
  processedDate?: string
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  notes?: string
  rejectionReason?: string
}

export default function WithdrawalPage({ params }: { params: { tenant: string } }) {
  const { toast } = useToast()
  const [balance, setBalance] = useState(2500000) // Example balance
  const [totalEarnings, setTotalEarnings] = useState(15000000)
  const [totalWithdrawn, setTotalWithdrawn] = useState(12500000)
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([
    {
      id: "1",
      amount: 1000000,
      status: "completed",
      requestDate: "2024-01-15",
      processedDate: "2024-01-16",
      bankAccount: {
        bankName: "BCA",
        accountNumber: "1234567890",
        accountName: "John Doe"
      }
    },
    {
      id: "2",
      amount: 500000,
      status: "pending",
      requestDate: "2024-01-20",
      bankAccount: {
        bankName: "Mandiri",
        accountNumber: "9876543210",
        accountName: "John Doe"
      }
    }
  ])
  
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [amountError, setAmountError] = useState("")

  const banks = [
    "BCA", "Mandiri", "BNI", "BRI", "CIMB Niaga", 
    "Danamon", "Permata", "Maybank", "OCBC NISP", "Bank Mega"
  ]

  const validateAndProceed = () => {
    // Reset error
    setAmountError("")
    
    // Validation
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || isNaN(amount)) {
      setAmountError("Masukkan jumlah penarikan yang valid")
      return
    }
    
    if (amount < 50000) {
      setAmountError(`Jumlah minimum penarikan adalah ${formatCurrency(50000)}`)
      return
    }

    if (amount > balance) {
      setAmountError(`Saldo tidak mencukupi. Saldo tersedia: ${formatCurrency(balance)}`)
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast({
        title: "Informasi Tidak Lengkap",
        description: "Harap lengkapi semua detail rekening bank",
        variant: "destructive"
      })
      return
    }

    // If all validations pass, show confirmation dialog
    setShowConfirmDialog(true)
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    
    setLoading(true)
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Add to history
      const newWithdrawal: WithdrawalHistory = {
        id: Date.now().toString(),
        amount,
        status: "pending",
        requestDate: new Date().toISOString().split('T')[0],
        bankAccount: {
          bankName,
          accountNumber,
          accountName
        },
        notes
      }
      
      setWithdrawalHistory([newWithdrawal, ...withdrawalHistory])
      setBalance(balance - amount)
      
      toast({
        title: "Permintaan Penarikan Berhasil",
        description: "Permintaan penarikan Anda sedang diproses",
      })
      
      setShowWithdrawDialog(false)
      setShowConfirmDialog(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengirim permintaan penarikan",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setWithdrawAmount("")
    setBankName("")
    setAccountNumber("")
    setAccountName("")
    setNotes("")
    setAmountError("")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-0"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800 border-0"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-0"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const quickAmounts = [100000, 250000, 500000, 1000000]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penarikan Saldo</h1>
          <p className="text-gray-600 mt-1">Kelola penghasilan dan permintaan penarikan Anda</p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-purple to-pastel-lavender text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Saldo Tersedia
                <Wallet className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs mt-2 text-gray-700">Siap untuk ditarik</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-pink to-pastel-lavender text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Penghasilan
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs mt-2 text-gray-700">Penghasilan seumur hidup</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-periwinkle to-pastel-blue text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Penarikan
                <ArrowUpRight className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalWithdrawn)}</div>
              <p className="text-xs mt-2 text-gray-700">Berhasil ditarik</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Action Card */}
        <Card>
          <CardHeader>
            <CardTitle>Ajukan Penarikan</CardTitle>
            <CardDescription>Tarik saldo tersedia Anda ke rekening bank</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Jumlah penarikan minimum</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(50000)}</p>
              </div>
              <Button 
                onClick={() => setShowWithdrawDialog(true)}
                className="bg-pastel-purple text-gray-800 hover:opacity-90"
                disabled={balance < 50000}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Tarik Dana
              </Button>
            </div>

            {/* Info Alert */}
            <div className="mt-4 p-4 bg-pastel-blue/20 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Waktu Pemrosesan</p>
                <p>Permintaan penarikan biasanya diproses dalam 1-2 hari kerja. Anda akan menerima notifikasi setelah penarikan Anda disetujui.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Penarikan</CardTitle>
            <CardDescription>Lacak permintaan penarikan dan transaksi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Belum ada riwayat penarikan</p>
                </div>
              ) : (
                withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-white rounded-lg">
                        {withdrawal.status === 'completed' ? (
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        ) : withdrawal.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                          {getStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {withdrawal.bankAccount.bankName} - {withdrawal.bankAccount.accountNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          Diminta: {new Date(withdrawal.requestDate).toLocaleDateString('id-ID')}
                          {withdrawal.processedDate && ` • Diproses: ${new Date(withdrawal.processedDate).toLocaleDateString('id-ID')}`}
                        </p>
                        {withdrawal.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Alasan: {withdrawal.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Penarikan</DialogTitle>
            <DialogDescription>
              Masukkan jumlah dan detail rekening bank untuk penarikan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Penarikan</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">IDR</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value)
                    setAmountError("")
                  }}
                  className={cn(
                    "pl-12",
                    amountError && "border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              {amountError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {amountError}
                </p>
              )}
              <div className="flex gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(amount.toString())}
                    className="flex-1 text-xs"
                  >
                    {formatCurrency(amount).replace('Rp ', '')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Bank Selection */}
            <div className="space-y-2">
              <Label htmlFor="bank">Nama Bank</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank Anda" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Masukkan nomor rekening"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="accountName"
                  type="text"
                  placeholder="Masukkan nama pemilik rekening"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Tambahkan catatan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Summary */}
            {withdrawAmount && (
              <div className="p-4 bg-pastel-lavender/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah Penarikan:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(withdrawAmount) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sisa Saldo:</span>
                  <span className="font-semibold">{formatCurrency(balance - (parseFloat(withdrawAmount) || 0))}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowWithdrawDialog(false)
              setAmountError("")
            }}>
              Batal
            </Button>
            <Button 
              onClick={validateAndProceed}
              disabled={loading}
              className="bg-pastel-purple text-gray-800 hover:opacity-90"
            >
              Lanjutkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Konfirmasi Penarikan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <p className="font-semibold text-gray-900">Pastikan data untuk transaksi ini sudah BENAR:</p>
              
              <div className="space-y-2 pl-4">
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 min-w-[120px]">Nama Rekening:</span>
                  <span className="font-medium text-gray-900">{accountName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 min-w-[120px]">Bank:</span>
                  <span className="font-medium text-gray-900">{bankName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 min-w-[120px]">Nomor Rekening:</span>
                  <span className="font-medium text-gray-900">{accountNumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-600 min-w-[120px]">Jumlah:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(parseFloat(withdrawAmount) || 0)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="font-semibold">Perhatian:</p>
                  <p>
                    Dengan melanjutkan, kamu dianggap menyetujui transaksi ini & saldomu akan terpotong otomatis.
                  </p>
                  <p className="font-medium">
                    Jika ada kekeliruan data dalam pengiriman dana, sepenuhnya itu akan menjadi tanggung jawab pengguna.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Periksa Kembali
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-pastel-purple text-gray-800 hover:opacity-90"
            >
              {loading ? "Memproses..." : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}