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
import { Users, Mail, Phone, Crown, Star, Briefcase, Edit, X, Loader2, Calendar as CalendarIcon, DollarSign, Award, Settings, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface EditStaffFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editStaffForm: any
  setEditStaffForm: (form: any) => void
  editSkillInput: string
  setEditSkillInput: (input: string) => void
  outlets: any[]
  positionTemplates: string[]
  loadingPositions: boolean
  treatments: any[]
  handleUpdateStaff: () => void
  handleEditAddSkill: () => void
  handleEditRemoveSkill: (skill: string) => void
}

export function EditStaffForm({
  open,
  onOpenChange,
  editStaffForm,
  setEditStaffForm,
  editSkillInput,
  setEditSkillInput,
  outlets,
  positionTemplates,
  loadingPositions,
  treatments,
  handleUpdateStaff,
  handleEditAddSkill,
  handleEditRemoveSkill,
}: EditStaffFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 bg-gradient-to-r from-[#DBEAFE]/50 to-[#BFDBFE]/50">
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Edit Staff Member
              </h2>
              <p className="text-sm text-muted-foreground font-normal">Update staff member information</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 px-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gradient-to-r from-gray-100 to-gray-50 p-1.5 rounded-xl shadow-sm">
              <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all">
                <div className="flex items-center gap-2 py-1">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">1</div>
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
              <div className="bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-sky-50/50 p-6 rounded-2xl border-2 border-blue-200 shadow-sm">
                <h3 className="font-bold text-blue-800 mb-5 flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_first_name" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit_first_name"
                        value={editStaffForm.first_name}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Enter first name"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_last_name" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit_last_name"
                        value={editStaffForm.last_name}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Enter last name"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_display_name" className="text-sm font-bold text-gray-700">
                      Display Name
                    </Label>
                    <Input
                      id="edit_display_name"
                      value={editStaffForm.display_name}
                      onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Auto-generated from first + last name"
                      className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg transition-all"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-base">💡</span> Leave empty to auto-generate
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_position" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      Position <span className="text-red-500">*</span>
                    </Label>
                    {loadingPositions ? (
                      <div className="h-12 flex items-center justify-center border-2 rounded-lg bg-gray-50">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                        <span className="text-sm text-gray-500">Loading positions...</span>
                      </div>
                    ) : positionTemplates.length > 0 ? (
                      <Select
                        value={editStaffForm.position}
                        onValueChange={(value) => setEditStaffForm((prev: any) => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg">
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
                        id="edit_position"
                        value={editStaffForm.position}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, position: e.target.value }))}
                        placeholder="e.g., Beauty Therapist, Massage Therapist"
                        className="h-12 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-lg"
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
                      <Label htmlFor="edit_email" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Mail className="h-4 w-4 text-green-600" />
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit_email"
                        type="email"
                        value={editStaffForm.email}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, email: e.target.value }))}
                        placeholder="staff@example.com"
                        className="h-12 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_phone" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <Phone className="h-4 w-4 text-green-600" />
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit_phone"
                        type="tel"
                        value={editStaffForm.phone}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+62 812-3456-7890"
                        className="h-12 border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 rounded-lg"
                        required
                        minLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_instagram_handle" className="text-sm font-bold text-gray-700">
                      Instagram Handle
                    </Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                      <Input
                        id="edit_instagram_handle"
                        value={editStaffForm.instagram_handle}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, instagram_handle: e.target.value }))}
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
                      <Label htmlFor="edit_employment_type" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Employment Type <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={editStaffForm.employment_type}
                        onValueChange={(value: "full_time" | "part_time" | "contract" | "freelance" | "intern") =>
                          setEditStaffForm((prev: any) => ({ ...prev, employment_type: value }))
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
                      <Label htmlFor="edit_employee_id" className="text-sm font-bold text-gray-700">
                        Employee ID
                      </Label>
                      <Input
                        id="edit_employee_id"
                        value={editStaffForm.employee_id}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, employee_id: e.target.value }))}
                        placeholder="e.g., EMP001"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_hire_date" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Hire Date
                      </Label>
                      <Input
                        id="edit_hire_date"
                        type="date"
                        value={editStaffForm.hire_date}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, hire_date: e.target.value }))}
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_birth_date" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Birth Date
                      </Label>
                      <Input
                        id="edit_birth_date"
                        type="date"
                        value={editStaffForm.birth_date}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, birth_date: e.target.value }))}
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit_hourly_rate" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Hourly Rate (Rp)
                      </Label>
                      <Input
                        id="edit_hourly_rate"
                        type="number"
                        min="0"
                        value={editStaffForm.hourly_rate || ""}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, hourly_rate: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Optional"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_salary" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Monthly Salary (Rp)
                      </Label>
                      <Input
                        id="edit_salary"
                        type="number"
                        min="0"
                        value={editStaffForm.salary || ""}
                        onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, salary: e.target.value ? parseFloat(e.target.value) : null }))}
                        placeholder="Optional"
                        className="h-12 border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 rounded-lg"
                      />
                    </div>
                  </div>

                  {outlets.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="edit_outlet_id" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                        Outlet <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={editStaffForm.outlet_id}
                        onValueChange={(value) => setEditStaffForm((prev: any) => ({ ...prev, outlet_id: value }))}
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
                    <Label htmlFor="edit_bio" className="text-sm font-bold text-gray-700">
                      Bio / Description
                    </Label>
                    <Textarea
                      id="edit_bio"
                      value={editStaffForm.bio}
                      onChange={(e) => setEditStaffForm((prev: any) => ({ ...prev, bio: e.target.value }))}
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
                          id="edit_is_bookable"
                          checked={editStaffForm.is_bookable}
                          onCheckedChange={(checked) =>
                            setEditStaffForm((prev: any) => ({ ...prev, is_bookable: checked as boolean }))
                          }
                          className="border-2 border-orange-300 data-[state=checked]:bg-orange-500"
                        />
                        <Label htmlFor="edit_is_bookable" className="text-sm cursor-pointer font-medium">
                          Staff can be booked
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="edit_accepts_online_booking"
                          checked={editStaffForm.accepts_online_booking}
                          onCheckedChange={(checked) =>
                            setEditStaffForm((prev: any) => ({ ...prev, accepts_online_booking: checked as boolean }))
                          }
                          className="border-2 border-orange-300 data-[state=checked]:bg-orange-500"
                        />
                        <Label htmlFor="edit_accepts_online_booking" className="text-sm cursor-pointer font-medium">
                          Accept online bookings
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_max_advance_booking_days" className="text-sm font-bold text-gray-700">
                          Max advance booking (days)
                        </Label>
                        <Input
                          id="edit_max_advance_booking_days"
                          type="number"
                          min="1"
                          max="365"
                          value={editStaffForm.max_advance_booking_days}
                          onChange={(e) =>
                            setEditStaffForm((prev: any) => ({
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
                    <Label htmlFor="edit_skills" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Star className="h-4 w-4 text-green-600" />
                      Specialties
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={editSkillInput}
                        onChange={(e) => setEditSkillInput(e.target.value)}
                        placeholder="e.g., Facial Treatment, Body Massage"
                        className="h-12 flex-1 border-2 border-green-300 focus:border-green-600 focus:ring-4 focus:ring-green-600/20 rounded-lg"
                        onKeyPress={(e) => e.key === "Enter" && handleEditAddSkill()}
                      />
                      <Button
                        type="button"
                        onClick={handleEditAddSkill}
                        className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg"
                      >
                        Add
                      </Button>
                    </div>
                    {editStaffForm.skills?.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-4 bg-white/60 rounded-xl">
                        {editStaffForm.skills.specialties.map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-sm px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 hover:from-green-200 hover:to-emerald-200 border-green-300"
                          >
                            {skill}
                            <button onClick={() => handleEditRemoveSkill(skill)} className="ml-2 hover:text-red-600">
                              <X className="h-4 w-4" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="edit_certifications" className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <Award className="h-4 w-4 text-green-600" />
                      Certifications
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={editSkillInput}
                        onChange={(e) => setEditSkillInput(e.target.value)}
                        placeholder="Add a certification"
                        className="h-12 flex-1 border-2 border-green-300 focus:border-green-600 focus:ring-4 focus:ring-green-600/20 rounded-lg"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            const value = editSkillInput.trim()
                            if (value && !editStaffForm.skills?.certifications?.includes(value)) {
                              setEditStaffForm((prev: any) => ({
                                ...prev,
                                skills: {
                                  ...prev.skills,
                                  certifications: [...(prev.skills?.certifications || []), value],
                                },
                              }))
                              setEditSkillInput("")
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const value = editSkillInput.trim()
                          if (value && !editStaffForm.skills?.certifications?.includes(value)) {
                            setEditStaffForm((prev: any) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                certifications: [...(prev.skills?.certifications || []), value],
                              },
                            }))
                            setEditSkillInput("")
                          }
                        }}
                        className="h-12 px-6 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg"
                      >
                        Add
                      </Button>
                    </div>
                    {editStaffForm.skills?.certifications?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-4 bg-white/60 rounded-xl">
                        {editStaffForm.skills.certifications.map((cert: string) => (
                          <Badge
                            key={cert}
                            variant="secondary"
                            className="text-sm px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 hover:from-blue-200 hover:to-cyan-200 border-blue-300"
                          >
                            {cert}
                            <button
                              onClick={() =>
                                setEditStaffForm((prev: any) => ({
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    certifications: (prev.skills?.certifications || []).filter((c: string) => c !== cert),
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
                    <Label htmlFor="edit_years_experience" className="text-sm font-bold text-gray-700">
                      Years of Experience
                    </Label>
                    <Input
                      id="edit_years_experience"
                      type="number"
                      min="0"
                      value={editStaffForm.skills?.years_experience || 0}
                      onChange={(e) => setEditStaffForm((prev: any) => ({
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
                      id="edit-service-all"
                      checked={editStaffForm.skills?.service_ids?.length === treatments.length && treatments.length > 0}
                      onCheckedChange={(checked) => {
                        setEditStaffForm((prev: any) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            service_ids: checked ? treatments.map(t => t.id) : []
                          }
                        }))
                      }}
                      className="h-5 w-5 border-2 border-pink-400 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                    />
                    <label
                      htmlFor="edit-service-all"
                      className="text-sm font-bold cursor-pointer leading-none text-pink-800 flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Select All Services
                    </label>
                  </div>

                  {/* Individual Services */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {treatments.map((treatment) => (
                      <div key={treatment.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-pink-50 transition-colors border border-transparent hover:border-pink-200">
                        <Checkbox
                          id={`edit-treatment-${treatment.id}`}
                          checked={editStaffForm.skills?.service_ids?.includes(treatment.id)}
                          onCheckedChange={(checked) => {
                            setEditStaffForm((prev: any) => {
                              const currentServiceIds = prev.skills?.service_ids || []
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
                        <Label htmlFor={`edit-treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
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
                    {!editStaffForm.skills?.service_ids || editStaffForm.skills.service_ids.length === 0 ? "⚠️" : editStaffForm.skills.service_ids.length === treatments.length ? "✅" : "📝"}
                  </span>
                  <span className="font-medium">
                    {!editStaffForm.skills?.service_ids || editStaffForm.skills.service_ids.length === 0
                      ? 'Please select at least 1 service (required)'
                      : editStaffForm.skills.service_ids.length === treatments.length
                      ? 'All services selected'
                      : `${editStaffForm.skills.service_ids.length} service${editStaffForm.skills.service_ids.length > 1 ? 's' : ''} selected`}
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
              onClick={handleUpdateStaff}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-lg"
            >
              <Edit className="h-5 w-5 mr-2" />
              Update Staff Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
