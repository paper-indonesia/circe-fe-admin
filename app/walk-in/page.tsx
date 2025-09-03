"use client"

import type React from "react"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserPlus, Clock, CreditCard, Banknote, Smartphone } from "lucide-react"

const treatments = [
  { id: 1, name: "HydraFacial", duration: 50, price: 900000 },
  { id: 2, name: "Chemical Peel", duration: 45, price: 750000 },
  { id: 3, name: "Botox", duration: 30, price: 2500000 },
  { id: 4, name: "Laser Pigmentation", duration: 60, price: 1200000 },
  { id: 5, name: "Microneedling", duration: 60, price: 850000 },
]

const staff = [
  { id: 1, name: "Dr. Sarah", role: "Dermatologist" },
  { id: 2, name: "Nurse Maya", role: "Aesthetic Nurse" },
  { id: 3, name: "Dr. Linda", role: "Dermatologist" },
]

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
]

export default function WalkInPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    treatmentId: "",
    staffId: "",
    timeSlot: "",
    paymentMethod: "",
    paymentType: "deposit",
  })

  const selectedTreatment = treatments.find((t) => t.id.toString() === formData.treatmentId)
  const selectedStaff = staff.find((s) => s.id.toString() === formData.staffId)

  const depositAmount = selectedTreatment ? selectedTreatment.price * 0.5 : 0
  const totalAmount = selectedTreatment ? selectedTreatment.price : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle booking creation
    console.log("Creating booking:", formData)
    alert("Walk-in booking created successfully!")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Walk-in Booking</h1>
          <p className="text-muted-foreground">Create a new booking for walk-in clients</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Client Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+62 812 345 6789"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Allergies</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special notes or allergies..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Treatment & Staff Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Treatment & Staff Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Treatment *</Label>
                      <Select
                        value={formData.treatmentId}
                        onValueChange={(value) => setFormData({ ...formData, treatmentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select treatment" />
                        </SelectTrigger>
                        <SelectContent>
                          {treatments.map((treatment) => (
                            <SelectItem key={treatment.id} value={treatment.id.toString()}>
                              <div className="flex justify-between items-center w-full">
                                <span>{treatment.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  Rp {treatment.price.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Staff Member *</Label>
                      <Select
                        value={formData.staffId}
                        onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staff.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              <div>
                                <div>{member.name}</div>
                                <div className="text-sm text-muted-foreground">{member.role}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Slot *</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Credit/Debit Card
                          </div>
                        </SelectItem>
                        <SelectItem value="qris">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            QRIS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.paymentType === "deposit" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentType: "deposit" })}
                        className="flex-1"
                      >
                        Deposit (50%)
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentType === "full" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentType: "full" })}
                        className="flex-1"
                      >
                        Full Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.name && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Client</Label>
                      <p className="font-medium">{formData.name}</p>
                      {formData.phone && <p className="text-sm text-muted-foreground">{formData.phone}</p>}
                    </div>
                  )}

                  {selectedTreatment && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Treatment</Label>
                      <p className="font-medium">{selectedTreatment.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {selectedTreatment.duration} minutes
                      </div>
                    </div>
                  )}

                  {selectedStaff && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Staff</Label>
                      <p className="font-medium">{selectedStaff.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                    </div>
                  )}

                  {formData.timeSlot && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Time</Label>
                      <p className="font-medium">{formData.timeSlot}</p>
                    </div>
                  )}

                  {selectedTreatment && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Treatment Price</span>
                        <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                      </div>
                      {formData.paymentType === "deposit" && (
                        <div className="flex justify-between items-center mb-2">
                          <span>Deposit (50%)</span>
                          <span>Rp {depositAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                        <span>Total {formData.paymentType === "deposit" ? "Deposit" : "Amount"}</span>
                        <span className="text-primary">
                          Rp{" "}
                          {(formData.paymentType === "deposit" ? depositAmount : totalAmount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !formData.name ||
                      !formData.phone ||
                      !formData.treatmentId ||
                      !formData.staffId ||
                      !formData.timeSlot
                    }
                  >
                    Create Booking
                  </Button>
                </CardContent>
              </Card>

              {/* Optional AI Skin Analysis Widget */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm">Optional: AI Skin Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Offer complimentary skin analysis to enhance treatment recommendations.
                  </p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Start Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
