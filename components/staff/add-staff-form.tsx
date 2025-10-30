"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, Phone, Crown, Star, Briefcase, UserPlus, X, Loader2, Calendar as CalendarIcon, DollarSign, Award, Settings } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface AddStaffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newStaffForm: any
  setNewStaffForm: (form: any) => void
  skillInput: string
  setSkillInput: (input: string) => void
  outlets: any[]
  positionTemplates: string[]
  loadingPositions: boolean
  treatments: any[]
  handleAddStaff: () => void
  handleAddSkill: () => void
  handleRemoveSkill: (skill: string) => void
}

export function AddStaffForm({
  open,
  onOpenChange,
  newStaffForm,
  setNewStaffForm,
  skillInput,
  setSkillInput,
  outlets,
  positionTemplates,
  loadingPositions,
  treatments,
  handleAddStaff,
  handleAddSkill,
  handleRemoveSkill,
}: AddStaffFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 bg-gradient-to-r from-[#FCD6F5]/10 to-[#EDE9FE]/10">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-[#6D28D9]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] bg-clip-text text-transparent">
                Add New Staff Member
              </h2>
              <p className="text-sm text-muted-foreground font-normal">Fill in the details to add a new team member</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-xl shadow-sm">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all">
                <div className="flex items-center gap-2 py-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white flex items-center justify-center text-xs font-bold shadow-sm">1</div>
                  <span className="hidden sm:inline font-medium">Basic</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="employment" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all">
                <div className="flex items-center gap-2 py-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white flex items-center justify-center text-xs font-bold shadow-sm">2</div>
                  <span className="hidden sm:inline font-medium">Employment</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all">
                <div className="flex items-center gap-2 py-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-[#10B981] to-[#34D399] text-white flex items-center justify-center text-xs font-bold shadow-sm">3</div>
                  <span className="hidden sm:inline font-medium">Skills</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all">
                <div className="flex items-center gap-2 py-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-[#EC4899] to-[#F472B6] text-white flex items-center justify-center text-xs font-bold shadow-sm">4</div>
                  <span className="hidden sm:inline font-medium">Services</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Information */}
            <TabsContent value="basic" className="space-y-5 mt-0">
              <div className="bg-gradient-to-br from-[#FCD6F5]/20 via-[#EDE9FE]/20 to-[#DDD6FE]/20 p-6 rounded-2xl border-2 border-[#EDE9FE] shadow-sm">
                <h3 className="font-bold text-[#6D28D9] mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={newStaffForm.first_name}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Enter first name"
                        className="h-12 border-2 border-[#E9D5FF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={newStaffForm.last_name}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Enter last name"
                        className="h-12 border-2 border-[#E9D5FF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_name" className="text-sm font-bold text-gray-700">
                      Display Name
                    </Label>
                    <Input
                      id="display_name"
                      value={newStaffForm.display_name}
                      onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Auto-generated from first + last name"
                      className="h-12 border-2 border-[#E9D5FF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 rounded-lg transition-all"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-base">💡</span> Leave empty to auto-generate
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Position <span className="text-red-500">*</span>
                    </Label>
                    {loadingPositions ? (
                      <div className="h-12 flex items-center justify-center border-2 rounded-lg bg-gray-50">
                        <Loader2 className="h-4 w-4 animate-spin text-[#8B5CF6] mr-2" />
                        <span className="text-sm text-gray-500">Loading positions...</span>
                      </div>
                    ) : positionTemplates.length > 0 ? (
                      <Select
                        value={newStaffForm.position}
                        onValueChange={(value) => setNewStaffForm((prev: any) => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger className="h-12 border-2 border-[#E9D5FF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 rounded-lg">
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positionTemplates.map((position) => (
                            <SelectItem key={position} value={position}>
                              {position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="position"
                        value={newStaffForm.position}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, position: value }))}
                        placeholder="e.g., Beauty Therapist, Massage Therapist"
                        className="h-12 border-2 border-[#E9D5FF] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/20 rounded-lg"
                        required
                      />
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-base">{positionTemplates.length > 0 ? "📋" : "✏️"}</span>
                      {positionTemplates.length > 0 ? "Select from your position templates" : "Enter the staff position"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#DCFCE7]/40 via-[#D1FAE5]/40 to-[#A7F3D0]/30 p-6 rounded-2xl border-2 border-green-200 shadow-sm">
                <h3 className="font-bold text-green-800 mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  Contact Information
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Mail className="h-4 w-4 text-green-600" />
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStaffForm.email}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, email: e.target.value }))}
                        placeholder="staff@example.com"
                        className="h-12 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4 text-green-600" />
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={newStaffForm.phone}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+62 812-3456-7890"
                        className="h-12 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-lg"
                        required
                        minLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_handle" className="text-sm font-bold text-gray-700">
                      Instagram Handle
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                      <Input
                        id="instagram_handle"
                        value={newStaffForm.instagram_handle}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, instagram_handle: e.target.value }))}
                        placeholder="username"
                        className="h-12 pl-10 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Employment Details */}
            <TabsContent value="employment" className="space-y-5 mt-0">
              <div className="bg-gradient-to-br from-[#FEF3C7]/40 via-[#FDE68A]/30 to-[#FCD34D]/20 p-6 rounded-2xl border-2 border-orange-200 shadow-sm">
                <h3 className="font-bold text-orange-800 mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-400 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  Employment Details
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employment_type" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Employment Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newStaffForm.employment_type}
                        onValueChange={(value: "full_time" | "part_time" | "contract" | "freelance" | "intern") =>
                          setNewStaffForm((prev: any) => ({ ...prev, employment_type: value }))
                        }
                      >
                        <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee_id" className="text-sm font-bold text-gray-700">
                        Employee ID
                      </Label>
                      <Input
                        id="employee_id"
                        value={newStaffForm.employee_id}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, employee_id: e.target.value }))}
                        placeholder="e.g., EMP001"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hire_date" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Hire Date
                      </Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={newStaffForm.hire_date}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, hire_date: e.target.value }))}
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Birth Date
                      </Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={newStaffForm.birth_date}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, birth_date: e.target.value }))}
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate (Rp)
                      </Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        min="0"
                        value={newStaffForm.hourly_rate || ""}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, hourly_rate: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Optional"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Monthly Salary (Rp)
                      </Label>
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        value={newStaffForm.salary || ""}
                        onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, salary: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Optional"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  {outlets.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="outlet_id" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Outlet <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={newStaffForm.outlet_id}
                        onValueChange={(value) => setNewStaffForm((prev: any) => ({ ...prev, outlet_id: value }))}
                      >
                        <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg">
                          <SelectValue placeholder="Select outlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {outlets.map((outlet) => (
                            <SelectItem key={outlet._id || outlet.id} value={outlet._id || outlet.id}>
                              {outlet.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-bold text-gray-700">
                      Bio / Description
                    </Label>
                    <Textarea
                      id="bio"
                      value={newStaffForm.bio}
                      onChange={(e) => setNewStaffForm((prev: any) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Brief description about this staff member..."
                      className="min-h-[100px] border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="bg-white/60 rounded-xl p-5 border-2 border-orange-100 space-y-4">
                    <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Booking Settings
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="is_bookable"
                          checked={newStaffForm.is_bookable}
                          onCheckedChange={(checked) =>
                            setNewStaffForm((prev: any) => ({ ...prev, is_bookable: checked as boolean }))
                          }
                          className="border-2 border-orange-300 data-[state=checked]:bg-orange-500"
                        />
                        <Label htmlFor="is_bookable" className="text-sm cursor-pointer font-medium">
                          Staff can be booked
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="accepts_online_booking"
                          checked={newStaffForm.accepts_online_booking}
                          onCheckedChange={(checked) =>
                            setNewStaffForm((prev: any) => ({ ...prev, accepts_online_booking: checked as boolean }))
                          }
                          className="border-2 border-orange-300 data-[state=checked]:bg-orange-500"
                        />
                        <Label htmlFor="accepts_online_booking" className="text-sm cursor-pointer font-medium">
                          Accept online bookings
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_advance_booking_days" className="text-sm font-bold text-gray-700">
                          Max advance booking (days)
                        </Label>
                        <Input
                          id="max_advance_booking_days"
                          type="number"
                          min="1"
                          max="365"
                          value={newStaffForm.max_advance_booking_days}
                          onChange={(e) =>
                            setNewStaffForm((prev: any) => ({
                              ...prev,
                              max_advance_booking_days: parseInt(e.target.value) || 30,
                            }))
                          }
                          placeholder="30"
                          className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                        />
                        <p className="text-xs text-muted-foreground">
                          How many days in advance customers can book (default: 30 days)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Skills & Certifications */}
            <TabsContent value="skills" className="space-y-5 mt-0">
              <div className="bg-gradient-to-br from-[#D1FAE5]/50 via-[#A7F3D0]/40 to-[#6EE7B7]/30 p-6 rounded-2xl border-2 border-green-300 shadow-sm">
                <h3 className="font-bold text-green-800 mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500 flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  Skills & Expertise
                </h3>
                <div className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="skills" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Star className="h-4 w-4 text-green-600" />
                      Specialties
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g., Facial Treatment, Body Massage"
                        className="h-12 flex-1 border-2 border-green-300 focus:border-green-600 focus:ring-4 focus:ring-green-600/20 rounded-lg"
                        onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg"
                      >
                        Add
                      </Button>
                    </div>
                    {newStaffForm.skills.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-4 bg-white/60 rounded-xl">
                        {newStaffForm.skills.specialties.map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-sm px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-green-300"
                          >
                            {skill}
                            <button onClick={() => handleRemoveSkill(skill)} className="ml-2 hover:text-red-600">
                              <X className="h-4 w-4" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="certifications" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Award className="h-4 w-4 text-green-600" />
                      Certifications
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a certification"
                        className="h-12 flex-1 border-2 border-green-300 focus:border-green-600 focus:ring-4 focus:ring-green-600/20 rounded-lg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const value = skillInput.trim()
                            if (value && !newStaffForm.skills.certifications.includes(value)) {
                              setNewStaffForm((prev: any) => ({
                                ...prev,
                                skills: {
                                  ...prev.skills,
                                  certifications: [...prev.skills.certifications, value],
                                },
                              }))
                              setSkillInput("")
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const value = skillInput.trim()
                          if (value && !newStaffForm.skills.certifications.includes(value)) {
                            setNewStaffForm((prev: any) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                certifications: [...prev.skills.certifications, value],
                              },
                            }))
                            setSkillInput("")
                          }
                        }}
                        className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg"
                      >
                        Add
                      </Button>
                    </div>
                    {newStaffForm.skills.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-4 bg-white/60 rounded-xl">
                        {newStaffForm.skills.certifications.map((cert: string) => (
                          <Badge
                            key={cert}
                            variant="secondary"
                            className="text-sm px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 hover:from-blue-200 hover:to-cyan-200 border-blue-300"
                          >
                            {cert}
                            <button
                              onClick={() =>
                                setNewStaffForm((prev: any) => ({
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    certifications: prev.skills.certifications.filter((c: string) => c !== cert),
                                  },
                                }))
                              }
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience" className="text-sm font-bold text-gray-700">
                      Years of Experience
                    </Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      value={newStaffForm.skills.years_experience}
                      onChange={(e) => setNewStaffForm((prev: any) => ({
                        ...prev,
                        skills: { ...prev.skills, years_experience: parseInt(e.target.value) || 0 }
                      }))}
                      placeholder="0"
                      className="h-12 border-2 border-green-300 focus:border-green-600 focus:ring-4 focus:ring-green-600/20 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Services Assignment */}
            <TabsContent value="services" className="space-y-5 mt-0">
              <div className="bg-gradient-to-br from-[#FCE7F3]/50 via-[#FBCFE8]/40 to-[#F9A8D4]/30 p-6 rounded-2xl border-2 border-pink-300 shadow-sm">
                <h3 className="font-bold text-pink-800 mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  Assign Services <span className="text-red-500">*</span>
                </h3>
                <div className="bg-white/70 rounded-xl p-5 border-2 border-pink-200">
                  {/* Select All Option */}
                  <div className="flex items-center space-x-3 pb-4 border-b-2 border-pink-200 mb-4 bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg">
                    <Checkbox
                      id="new-service-all"
                      checked={(() => {
                        const activeTreatments = treatments.filter((t) => t.status === "active")
                        return newStaffForm.skills.service_ids.length === activeTreatments.length && activeTreatments.length > 0
                      })()}
                      onCheckedChange={(checked) => {
                        const activeTreatments = treatments.filter((t) => t.status === "active")
                        setNewStaffForm((prev: any) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            service_ids: checked ? activeTreatments.map(t => t.id) : []
                          }
                        }))
                      }}
                      className="h-5 w-5 border-2 border-pink-400 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                    />
                    <label
                      htmlFor="new-service-all"
                      className="text-sm font-bold cursor-pointer leading-none text-pink-800 flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Select All Active Services
                    </label>
                  </div>

                  {/* Individual Services */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {treatments.filter((treatment) => treatment.status === "active").map((treatment) => (
                      <div key={treatment.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-200">
                        <Checkbox
                          id={`new-treatment-${treatment.id}`}
                          checked={newStaffForm.skills.service_ids.includes(treatment.id)}
                          onCheckedChange={(checked) => {
                            setNewStaffForm((prev: any) => {
                              const currentServiceIds = prev.skills.service_ids
                              if (checked) {
                                return {
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    service_ids: [...currentServiceIds, treatment.id],
                                  },
                                }
                              } else {
                                return {
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    service_ids: currentServiceIds.filter((id: string) => id !== treatment.id),
                                  },
                                }
                              }
                            })
                          }}
                          className="h-5 w-5 border-2 border-gray-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                        />
                        <Label htmlFor={`new-treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900 font-semibold">{treatment.name}</span>
                              <Badge variant="outline" className="text-xs border-pink-300 text-pink-700">
                                <Clock className="h-3 w-3 mr-1" />
                                {treatment.durationMin}min
                              </Badge>
                            </div>
                            <span className="text-muted-foreground text-sm font-medium">{formatCurrency(treatment.price || 0)}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2 bg-white/50 p-3 rounded-lg">
                  <span className="text-lg">
                    {newStaffForm.skills.service_ids.length === 0 ? "⚠️" : newStaffForm.skills.service_ids.length === treatments.filter((t) => t.status === "active").length ? "✅" : "📝"}
                  </span>
                  <span className="font-medium">
                    {newStaffForm.skills.service_ids.length === 0
                      ? 'Please select at least 1 active service (required)'
                      : newStaffForm.skills.service_ids.length === treatments.filter((t) => t.status === "active").length
                      ? 'All active services selected'
                      : `${newStaffForm.skills.service_ids.length} service${newStaffForm.skills.service_ids.length > 1 ? 's' : ''} selected`}
                  </span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t-2 border-gray-200 pt-5 px-6 pb-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-100 font-semibold rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStaff}
              className="flex-1 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
