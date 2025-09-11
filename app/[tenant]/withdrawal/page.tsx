"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Banknote,
  Building,
  User,
  Hash,
  DollarSign,
  Info
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

  const banks = [
    "BCA", "Mandiri", "BNI", "BRI", "CIMB Niaga", 
    "Danamon", "Permata", "Maybank", "OCBC NISP", "Bank Mega"
  ]

  const handleWithdraw = async () => {
    // Validation
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount < 50000) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is Rp 50,000",
        variant: "destructive"
      })
      return
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      })
      return
    }

    if (!bankName || !accountNumber || !accountName) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all bank account details",
        variant: "destructive"
      })
      return
    }

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
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request is being processed",
      })
      
      setShowWithdrawDialog(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request",
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
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal</h1>
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawal requests</p>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-purple to-pastel-lavender text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Available Balance
                <Wallet className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
              <p className="text-xs mt-2 text-gray-700">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-pink to-pastel-lavender text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Earnings
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs mt-2 text-gray-700">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-pastel-periwinkle to-pastel-blue text-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Total Withdrawn
                <ArrowUpRight className="h-5 w-5 text-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalWithdrawn)}</div>
              <p className="text-xs mt-2 text-gray-700">Successfully withdrawn</p>
            </CardContent>
          </Card>
        </div>

        {/* Withdrawal Action Card */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Withdraw your available balance to your bank account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Minimum withdrawal amount</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(50000)}</p>
              </div>
              <Button 
                onClick={() => setShowWithdrawDialog(true)}
                className="bg-pastel-purple text-gray-800 hover:opacity-90"
                disabled={balance < 50000}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Withdraw Funds
              </Button>
            </div>

            {/* Info Alert */}
            <div className="mt-4 p-4 bg-pastel-blue/20 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Processing Time</p>
                <p>Withdrawal requests are typically processed within 1-2 business days. You'll receive a notification once your withdrawal is approved.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
            <CardDescription>Track your withdrawal requests and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No withdrawal history yet</p>
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
                          Requested: {new Date(withdrawal.requestDate).toLocaleDateString()}
                          {withdrawal.processedDate && ` • Processed: ${new Date(withdrawal.processedDate).toLocaleDateString()}`}
                        </p>
                        {withdrawal.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Reason: {withdrawal.rejectionReason}</p>
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
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount and bank account details for withdrawal
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 mt-2">
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
              <Label htmlFor="bank">Bank Name</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your bank" />
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
              <Label htmlFor="accountNumber">Account Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="accountName"
                  type="text"
                  placeholder="Enter account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                type="text"
                placeholder="Add any notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Summary */}
            {withdrawAmount && (
              <div className="p-4 bg-pastel-lavender/20 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Withdrawal Amount:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(withdrawAmount) || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="font-semibold">{formatCurrency(balance - (parseFloat(withdrawAmount) || 0))}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-pastel-purple text-gray-800 hover:opacity-90"
            >
              {loading ? "Processing..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}