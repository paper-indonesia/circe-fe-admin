"use client"

import { useState } from "react"
import { Wallet, CreditCard, QrCode, Lock, CheckCircle2 } from "lucide-react"

export default function ModernPaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qris'>('card')
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit')
  const [percentageValue, setPercentageValue] = useState('50')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const totalAmount = 350000
  const calculatedAmount = paymentType === 'deposit'
    ? totalAmount * (parseInt(percentageValue) / 100)
    : totalAmount

  // Format card number dengan spasi setiap 4 digit
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substring(0, 19)
  }

  // Format expiry MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    return cleaned
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  // Handle expiry change
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value)
    setExpiry(formatted)
  }

  // Handle CVV change
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3)
    setCvv(value)
  }

  // Handle percentage change
  const handlePercentageChange = (value: string) => {
    const numValue = parseInt(value) || 0
    if (numValue >= 0 && numValue <= 100) {
      setPercentageValue(value)
    }
  }

  // Payment method config
  const paymentMethods = [
    {
      id: 'cash' as const,
      icon: Wallet,
      label: 'Cash',
      description: 'Pay with cash',
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'card' as const,
      icon: CreditCard,
      label: 'Card',
      description: 'Credit or debit card',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      id: 'qris' as const,
      icon: QrCode,
      label: 'QRIS',
      description: 'Scan QR code',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isActive = paymentMethod === method.id

                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                        isActive
                          ? `bg-gradient-to-br ${method.gradient} border-transparent text-white shadow-lg`
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isActive && (
                        <CheckCircle2 className="absolute top-3 right-3 h-6 w-6 text-white" />
                      )}
                      <div className="flex flex-col items-center gap-3">
                        <Icon className={`h-8 w-8 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                        <div className="text-center">
                          <div className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                            {method.label}
                          </div>
                          <div className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {method.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Payment Type Section */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Payment Type</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setPaymentType('deposit')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    paymentType === 'deposit'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-transparent text-white shadow-lg'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-bold text-lg ${paymentType === 'deposit' ? 'text-white' : 'text-gray-800'}`}>
                      Deposit
                    </div>
                    <div className={`text-sm ${paymentType === 'deposit' ? 'text-white/80' : 'text-gray-500'}`}>
                      Pay partial amount
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentType('full')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    paymentType === 'full'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 border-transparent text-white shadow-lg'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-bold text-lg ${paymentType === 'full' ? 'text-white' : 'text-gray-800'}`}>
                      Full Payment
                    </div>
                    <div className={`text-sm ${paymentType === 'full' ? 'text-white/80' : 'text-gray-500'}`}>
                      Pay full amount
                    </div>
                  </div>
                </button>
              </div>

              {/* Deposit Slider */}
              {paymentType === 'deposit' && (
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6 animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-sm font-semibold text-violet-900 mb-3">
                    Deposit Percentage
                  </label>

                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(e.target.value)}
                      className="flex-1 h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(139 92 246) 0%, rgb(147 51 234) ${percentageValue}%, rgb(229 231 235) ${percentageValue}%, rgb(229 231 235) 100%)`
                      }}
                    />

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percentageValue}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                      className="w-20 px-3 py-2 border-2 border-violet-200 rounded-xl text-center font-bold text-violet-900 focus:outline-none focus:border-violet-500"
                    />
                    <span className="text-violet-900 font-bold">%</span>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-violet-700 mb-1">Amount to pay</div>
                    <div className="text-3xl font-bold text-violet-900">
                      {formatCurrency(calculatedAmount)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Information Section */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Card Information</h2>
                </div>

                {/* Card Preview */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 text-white relative overflow-hidden h-48">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>

                  <div className="relative z-10">
                    <div className="mb-8">
                      <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"></div>
                    </div>

                    <div className="mb-6">
                      <div className="text-xl font-mono tracking-wider">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">VALID THRU</div>
                        <div className="font-mono">{expiry || 'MM/YY'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">CVV</div>
                        <div className="font-mono">{cvv ? '•'.repeat(cvv.length) : '•••'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <div className="flex items-center gap-2">
                    {paymentMethod === 'cash' && <Wallet className="h-4 w-4 text-emerald-500" />}
                    {paymentMethod === 'card' && <CreditCard className="h-4 w-4 text-violet-500" />}
                    {paymentMethod === 'qris' && <QrCode className="h-4 w-4 text-blue-500" />}
                    <span className="font-semibold text-gray-800 capitalize">{paymentMethod}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{paymentType}</span>
                </div>

                {paymentType === 'deposit' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Deposit</span>
                    <span className="font-semibold text-gray-800">{percentageValue}%</span>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 rounded-2xl p-6 mb-6">
                <div className="text-sm text-violet-700 mb-2">Amount to Pay</div>
                <div className="text-3xl font-bold text-violet-900">
                  {formatCurrency(calculatedAmount)}
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <Lock className="h-5 w-5" />
                Complete Payment
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                🔒 Secure payment processing
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
