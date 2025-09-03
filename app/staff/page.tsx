"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStaff, useBookings, useTreatments } from "@/lib/context"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, Calendar, Star, Clock, Phone, Mail, Edit, TrendingUp, X, Search, Filter } from "lucide-react"
import { format, isToday, parseISO } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function StaffPage() {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff()
  const { bookings } = useBookings()
  const { treatments } = useTreatments()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [showStaffDialog, setShowStaffDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editStaffForm, setEditStaffForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    skills: [] as string[],
    workingSchedule: {} as Record<string, string[]>, // Changed from workingHours to workingSchedule
    workingDays: [] as string[],
    notes: "",
    assignedTreatments: [] as string[],
  })
  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    skills: [] as string[],
    workingSchedule: {} as Record<string, string[]>, // Changed from workingHours to workingSchedule
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    notes: "",
    assignedTreatments: [] as string[],
  })
  const [skillInput, setSkillInput] = useState("")
  const [editSkillInput, setEditSkillInput] = useState("")
  const [newTimeRange, setNewTimeRange] = useState({ start: "09:00", end: "17:00" })

  const filteredStaff = staff.filter((staffMember) => {
    const matchesSearch =
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staffMember.skills || []).some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && staffMember.isAvailable) ||
      (availabilityFilter === "unavailable" && !staffMember.isAvailable)

    return matchesSearch && matchesRole && matchesAvailability
  })

  const uniqueRoles = Array.from(new Set(staff.map((s) => s.role)))

  const getStaffPerformance = (staffId: string) => {
    const staffBookings = bookings.filter((b) => b.staffId === staffId)
    const todayBookings = staffBookings.filter((b) => isToday(parseISO(b.startAt)))
    const completedBookings = staffBookings.filter((b) => b.status === "completed")
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + 500000 // Placeholder
    }, 0)

    return {
      totalBookings: staffBookings.length,
      todayBookings: todayBookings.length,
      completedBookings: completedBookings.length,
      completionRate: staffBookings.length > 0 ? (completedBookings.length / staffBookings.length) * 100 : 0,
      totalRevenue,
    }
  }

  const getTodaySchedule = (staffId: string) => {
    return bookings
      .filter((b) => b.staffId === staffId && isToday(parseISO(b.startAt)))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  const handleViewSchedule = (staffMember: any) => {
    setSelectedStaff(staffMember)
    setShowScheduleDialog(true)
  }

  const handleViewProfile = (staffMember: any) => {
    setSelectedStaff(staffMember)
    setEditStaffForm({
      name: staffMember.name,
      role: staffMember.role,
      email: staffMember.email || `${staffMember.name.toLowerCase().replace(" ", ".")}@beautyclinic.com`,
      phone: staffMember.phone || `+62 812 345 ${staffMember.id.slice(-4)}`,
      skills: staffMember.skills || [],
      workingSchedule: staffMember.workingSchedule || {},
      workingDays: staffMember.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      notes: staffMember.notes || "",
      assignedTreatments: treatments
        .filter((treatment) => treatment.assignedStaff?.includes(staffMember.id))
        .map((treatment) => treatment.id), // Initialize assignedTreatments from treatments data
    })
    setIsEditMode(false)
    setShowStaffDialog(true)
  }

  const handleUpdateStaff = async () => {
    if (!selectedStaff || !editStaffForm.name.trim() || !editStaffForm.role) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const updatedStaff = {
        ...selectedStaff,
        ...editStaffForm,
      }

      await updateStaff(selectedStaff.id, updatedStaff)

      const updatedTreatments = treatments.map((treatment) => {
        const shouldBeAssigned = editStaffForm.assignedTreatments.includes(treatment.id)
        const currentlyAssigned = treatment.assignedStaff?.includes(selectedStaff.id) || false

        if (shouldBeAssigned && !currentlyAssigned) {
          // Add staff to treatment
          return {
            ...treatment,
            assignedStaff: [...(treatment.assignedStaff || []), selectedStaff.id],
          }
        } else if (!shouldBeAssigned && currentlyAssigned) {
          // Remove staff from treatment
          return {
            ...treatment,
            assignedStaff: (treatment.assignedStaff || []).filter((id) => id !== selectedStaff.id),
          }
        }
        return treatment
      })

      // Update treatments in context (you may need to add updateTreatment function)
      // For now, we'll just update the staff and the treatments will be handled separately

      setSelectedStaff(updatedStaff)
      setIsEditMode(false)
      alert("Staff updated successfully!")
    } catch (error) {
      console.error("Error updating staff:", error)
      alert("Failed to update staff")
    }
  }

  const handleWorkingDayToggle = (day: string, isEdit = false) => {
    if (isEdit) {
      setEditStaffForm((prev) => {
        const newWorkingDays = prev.workingDays.includes(day)
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day]

        const newSchedule = { ...prev.workingSchedule }
        if (!prev.workingDays.includes(day)) {
          // Adding new day, initialize with empty schedule
          newSchedule[day] = []
        } else {
          // Removing day, delete its schedule
          delete newSchedule[day]
        }

        return {
          ...prev,
          workingDays: newWorkingDays,
          workingSchedule: newSchedule,
        }
      })
    } else {
      setNewStaffForm((prev) => {
        const newWorkingDays = prev.workingDays.includes(day)
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day]

        const newSchedule = { ...prev.workingSchedule }
        if (!prev.workingDays.includes(day)) {
          // Adding new day, initialize with empty schedule
          newSchedule[day] = []
        } else {
          // Removing day, delete its schedule
          delete newSchedule[day]
        }

        return {
          ...prev,
          workingDays: newWorkingDays,
          workingSchedule: newSchedule,
        }
      })
    }
  }

  const handleAddTimeRangeForDay = (day: string, isEdit = false) => {
    const timeRange = `${newTimeRange.start}-${newTimeRange.end}`
    if (isEdit) {
      setEditStaffForm((prev) => ({
        ...prev,
        workingSchedule: {
          ...prev.workingSchedule,
          [day]: [...(prev.workingSchedule[day] || []), timeRange].filter(
            (range, index, arr) => arr.indexOf(range) === index,
          ),
        },
      }))
    } else {
      setNewStaffForm((prev) => ({
        ...prev,
        workingSchedule: {
          ...prev.workingSchedule,
          [day]: [...(prev.workingSchedule[day] || []), timeRange].filter(
            (range, index, arr) => arr.indexOf(range) === index,
          ),
        },
      }))
    }
    setNewTimeRange({ start: "09:00", end: "17:00" })
  }

  const handleRemoveTimeRangeForDay = (day: string, timeRange: string, isEdit = false) => {
    if (isEdit) {
      setEditStaffForm((prev) => ({
        ...prev,
        workingSchedule: {
          ...prev.workingSchedule,
          [day]: (prev.workingSchedule[day] || []).filter((range) => range !== timeRange),
        },
      }))
    } else {
      setNewStaffForm((prev) => ({
        ...prev,
        workingSchedule: {
          ...prev.workingSchedule,
          [day]: (prev.workingSchedule[day] || []).filter((range) => range !== timeRange),
        },
      }))
    }
  }

  const handleAddTimeRange = (isEdit = false) => {
    const timeRange = `${newTimeRange.start}-${newTimeRange.end}`
    if (isEdit) {
      if (!editStaffForm.workingHours.includes(timeRange)) {
        setEditStaffForm((prev) => ({
          ...prev,
          workingHours: [...prev.workingHours, timeRange],
        }))
      }
    } else {
      if (!newStaffForm.workingHours.includes(timeRange)) {
        setNewStaffForm((prev) => ({
          ...prev,
          workingHours: [...prev.workingHours, timeRange],
        }))
      }
    }
    setNewTimeRange({ start: "09:00", end: "17:00" })
  }

  const handleRemoveTimeRange = (timeRange: string, isEdit = false) => {
    if (isEdit) {
      setEditStaffForm((prev) => ({
        ...prev,
        workingHours: prev.workingHours.filter((range) => range !== timeRange),
      }))
    } else {
      setNewStaffForm((prev) => ({
        ...prev,
        workingHours: prev.workingHours.filter((range) => range !== timeRange),
      }))
    }
  }

  const handleAddStaff = () => {
    if (!newStaffForm.name || !newStaffForm.role || !newStaffForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newStaff = {
      id: Date.now().toString(),
      name: newStaffForm.name,
      role: newStaffForm.role,
      email: newStaffForm.email,
      phone: newStaffForm.phone,
      skills: newStaffForm.skills,
      workingSchedule: newStaffForm.workingSchedule,
      workingDays: newStaffForm.workingDays,
      notes: newStaffForm.notes,
      rating: 5.0,
      completedAppointments: 0,
      totalRevenue: 0,
      assignedTreatments: newStaffForm.assignedTreatments,
    }

    addStaff(newStaff)
    setNewStaffForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      skills: [],
      workingSchedule: {},
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      notes: "",
      assignedTreatments: [],
    })
    setShowAddStaffDialog(false)
    toast({
      title: "Success",
      description: "Staff member added successfully",
    })
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !newStaffForm.skills.includes(skillInput.trim())) {
      setNewStaffForm((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setNewStaffForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleEditAddSkill = () => {
    if (editSkillInput.trim() && !editStaffForm.skills.includes(editSkillInput.trim())) {
      setEditStaffForm((prev) => ({
        ...prev,
        skills: [...prev.skills, editSkillInput.trim()],
      }))
      setEditSkillInput("")
    }
  }

  const handleEditRemoveSkill = (skillToRemove: string) => {
    setEditStaffForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const openStaffProfile = (staffMember: any) => {
    setSelectedStaff(staffMember)
    setEditStaffForm({
      name: staffMember.name || "",
      role: staffMember.role || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      workingDays: staffMember.workingDays || [],
      workingSchedule: staffMember.workingSchedule || {},
      skills: staffMember.skills || [],
      notes: staffMember.notes || "",
      assignedTreatments: treatments
        .filter((treatment) => treatment.assignedStaff?.includes(staffMember.id))
        .map((treatment) => treatment.id), // Initialize assignedTreatments from treatments data
    })
    setIsEditMode(false)
    setShowStaffDialog(true)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">Manage your team, schedules, and performance</p>
          </div>
          <Button
            onClick={() => setShowAddStaffDialog(true)}
            className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] hover:from-[#E7C6FF] hover:to-[#C8B6FF] text-purple-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        <Card className="border-[#E7C6FF]/30">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name, role, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#E7C6FF] focus:border-[#C8B6FF]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 border-[#E7C6FF]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-40 border-[#E7C6FF]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border border-[#E7C6FF]/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#FFD6FF]/20 to-[#E7C6FF]/20">
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead className="text-center">Today</TableHead>
                <TableHead className="text-center">Success Rate</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staffMember) => {
                const performance = getStaffPerformance(staffMember.id)

                return (
                  <TableRow key={staffMember.id} className="hover:bg-[#FFD6FF]/10 transition-colors">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#E7C6FF]">
                        <img
                          src={`/abstract-geometric-shapes.png?height=40&width=40&query=${staffMember.name} professional beauty therapist headshot portrait`}
                          alt={staffMember.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-muted-foreground">{staffMember.role}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">{staffMember.rating || 4.8}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {staffMember.skills?.slice(0, 2).map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-[#FFD6FF]/50 text-purple-700">
                            {skill}
                          </Badge>
                        ))}
                        {(staffMember.skills?.length || 0) > 2 && (
                          <Badge variant="outline" className="text-xs border-[#E7C6FF] text-purple-600">
                            +{(staffMember.skills?.length || 0) - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] rounded-full">
                        <span className="text-sm font-semibold text-purple-800">{performance.todayBookings}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-br from-[#E7C6FF] to-[#C8B6FF] rounded-full">
                        <span className="text-sm font-semibold text-purple-800">
                          {Math.round(performance.completionRate)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{staffMember.workingHours?.[0] || "09:00-17:00"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{(staffMember.workingDays || ["Mon-Fri"]).slice(0, 3).join(", ")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FFD6FF]/30"
                          onClick={() => handleViewSchedule(staffMember)}
                        >
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FFD6FF]/30"
                          onClick={() => openStaffProfile(staffMember)}
                        >
                          <Edit className="h-4 w-4 text-purple-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No staff members found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Staff Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary">{staff.length}</div>
                <div className="text-sm text-muted-foreground">Total Staff</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {staff.reduce((sum, s) => sum + getStaffPerformance(s.id).todayBookings, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Today's Appointments</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {(staff.reduce((sum, s) => sum + (s.rating || 4.8), 0) / staff.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    staff.reduce((sum, s) => sum + getStaffPerformance(s.id).completionRate, 0) / staff.length,
                  )}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Profile Dialog */}
        <Dialog open={showStaffDialog} onOpenChange={setShowStaffDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {isEditMode ? "Edit Staff Profile" : "Staff Profile"}
              </DialogTitle>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                {!isEditMode ? (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary/20 mx-auto mb-3">
                        <img
                          src={`/abstract-geometric-shapes.png?height=80&width=80&query=${selectedStaff.name} professional beauty therapist headshot portrait smiling`}
                          alt={selectedStaff.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                      <p className="text-muted-foreground">{selectedStaff.role}</p>
                      <div className="flex items-center justify-center gap-1 mt-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{selectedStaff.rating || 4.8}</span>
                        <span className="text-muted-foreground">({Math.floor(Math.random() * 50) + 20} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Contact</Label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedStaff.phone || `+62 812 345 ${selectedStaff.id.slice(-4)}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedStaff.email ||
                                `${selectedStaff.name.toLowerCase().replace(" ", ".")}@beautyclinic.com`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Working Schedule</Label>
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Days:</div>
                            <div className="flex flex-wrap gap-1">
                              {(
                                selectedStaff.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                              ).map((day: string) => (
                                <Badge key={day} variant="outline" className="text-xs border-[#E7C6FF] text-purple-600">
                                  {day.slice(0, 3)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Hours:</div>
                            <div className="space-y-1">
                              {(selectedStaff.workingHours || ["09:00-17:00"]).map((range: string, index: number) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{range}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Specialties</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedStaff.skills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Treatments</Label>
                        <div className="space-y-2 mt-1">
                          {(() => {
                            const staffTreatments = treatments.filter((treatment) =>
                              treatment.assignedStaff?.includes(selectedStaff.id),
                            )

                            if (staffTreatments.length === 0) {
                              return <div className="text-sm text-muted-foreground italic">No treatments assigned</div>
                            }

                            return (
                              <div className="flex flex-wrap gap-1">
                                {staffTreatments.map((treatment) => (
                                  <Badge
                                    key={treatment.id}
                                    variant="outline"
                                    className="text-xs border-[#C8B6FF] text-purple-600 bg-[#FFD6FF]/30"
                                  >
                                    {treatment.name}
                                  </Badge>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {(() => {
                        const performance = getStaffPerformance(selectedStaff.id)
                        return (
                          <div>
                            <Label className="text-sm text-muted-foreground">Performance</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-semibold text-primary">{performance.totalBookings}</div>
                                <div className="text-xs text-muted-foreground">Total Bookings</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-semibold text-green-600">
                                  {Math.round(performance.completionRate)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsEditMode(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => {
                          setShowStaffDialog(false)
                          setShowScheduleDialog(true)
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name" className="text-sm font-medium">
                          Name *
                        </Label>
                        <Input
                          id="edit-name"
                          value={editStaffForm.name}
                          onChange={(e) => setEditStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                          className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-role" className="text-sm font-medium">
                          Role *
                        </Label>
                        <Select
                          value={editStaffForm.role}
                          onValueChange={(value) => setEditStaffForm((prev) => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beauty Therapist">Beauty Therapist</SelectItem>
                            <SelectItem value="Facial Specialist">Facial Specialist</SelectItem>
                            <SelectItem value="Massage Therapist">Massage Therapist</SelectItem>
                            <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                            <SelectItem value="Hair Stylist">Hair Stylist</SelectItem>
                            <SelectItem value="Receptionist">Receptionist</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-email" className="text-sm font-medium">
                          Email *
                        </Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editStaffForm.email}
                          onChange={(e) => setEditStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-phone" className="text-sm font-medium">
                          Phone
                        </Label>
                        <Input
                          id="edit-phone"
                          value={editStaffForm.phone}
                          onChange={(e) => setEditStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                          className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Assigned Treatments</Label>
                      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border border-[#E7C6FF] rounded-lg p-3">
                        {treatments.map((treatment) => (
                          <div key={treatment.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`treatment-${treatment.id}`}
                              checked={editStaffForm.assignedTreatments?.includes(treatment.id) || false}
                              onCheckedChange={(checked) => {
                                setEditStaffForm((prev) => {
                                  const currentTreatments = prev.assignedTreatments || []
                                  if (checked) {
                                    return {
                                      ...prev,
                                      assignedTreatments: [...currentTreatments, treatment.id],
                                    }
                                  } else {
                                    return {
                                      ...prev,
                                      assignedTreatments: currentTreatments.filter((id) => id !== treatment.id),
                                    }
                                  }
                                })
                              }}
                              className="border-[#E7C6FF] data-[state=checked]:bg-[#C8B6FF]"
                            />
                            <Label htmlFor={`treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
                              <div className="flex items-center gap-2">
                                <span>{treatment.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {treatment.duration}min
                                </Badge>
                                <span className="text-muted-foreground">Rp {treatment.price?.toLocaleString()}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Skills & Specialties</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={editSkillInput}
                          onChange={(e) => setEditSkillInput(e.target.value)}
                          placeholder="Add a skill"
                          className="border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                          onKeyPress={(e) => e.key === "Enter" && handleEditAddSkill()}
                        />
                        <Button
                          type="button"
                          onClick={handleEditAddSkill}
                          size="sm"
                          className="bg-[#E7C6FF] hover:bg-[#C8B6FF] text-purple-800"
                        >
                          Add
                        </Button>
                      </div>
                      {editStaffForm.skills && editStaffForm.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {editStaffForm.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs bg-[#FFD6FF] text-purple-800 hover:bg-[#E7C6FF]"
                            >
                              {skill}
                              <button onClick={() => handleEditRemoveSkill(skill)} className="ml-1 hover:text-red-600">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Working Days & Hours</Label>
                      <div className="space-y-4 mt-2">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="border border-[#E7C6FF] rounded-lg p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Checkbox
                                id={`edit-day-${day}`}
                                checked={editStaffForm.workingDays.includes(day)}
                                onCheckedChange={() => handleWorkingDayToggle(day, true)}
                                className="border-[#E7C6FF] data-[state=checked]:bg-[#C8B6FF]"
                              />
                              <Label htmlFor={`edit-day-${day}`} className="text-sm font-medium">
                                {day}
                              </Label>
                            </div>

                            {editStaffForm.workingDays.includes(day) && (
                              <div className="space-y-2 ml-6">
                                {(editStaffForm.workingSchedule[day] || []).map((range, index) => (
                                  <div key={index} className="flex items-center gap-2 p-2 bg-[#FFD6FF]/20 rounded-lg">
                                    <Clock className="h-4 w-4 text-[#C8B6FF]" />
                                    <span className="flex-1 text-sm">{range}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveTimeRangeForDay(day, range, true)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <Select
                                    value={newTimeRange.start}
                                    onValueChange={(value) => setNewTimeRange((prev) => ({ ...prev, start: value }))}
                                  >
                                    <SelectTrigger className="flex-1 border-[#E7C6FF]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, "0")
                                        return (
                                          <SelectItem key={hour} value={`${hour}:00`}>
                                            {hour}:00
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <span className="self-center text-sm text-muted-foreground">to</span>
                                  <Select
                                    value={newTimeRange.end}
                                    onValueChange={(value) => setNewTimeRange((prev) => ({ ...prev, end: value }))}
                                  >
                                    <SelectTrigger className="flex-1 border-[#E7C6FF]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, "0")
                                        return (
                                          <SelectItem key={hour} value={`${hour}:00`}>
                                            {hour}:00
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    type="button"
                                    onClick={() => handleAddTimeRangeForDay(day, true)}
                                    size="sm"
                                    className="bg-[#E7C6FF] hover:bg-[#C8B6FF] text-purple-800"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 border-[#E7C6FF] text-purple-700 hover:bg-[#FFD6FF]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateStaff}
                        className="flex-1 bg-gradient-to-r from-[#E7C6FF] to-[#C8B6FF] hover:from-[#C8B6FF] hover:to-[#B8C0FF] text-purple-800"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Staff Schedule Dialog */}
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedStaff?.name}'s Schedule
              </DialogTitle>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Today's appointments for {selectedStaff.name}</div>

                {(() => {
                  const todaySchedule = getTodaySchedule(selectedStaff.id)

                  if (todaySchedule.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No appointments scheduled for today</p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {todaySchedule.map((booking) => (
                        <div key={booking.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="text-sm font-medium min-w-[60px]">
                            {format(parseISO(booking.startAt), "HH:mm")}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{booking.patientName}</div>
                            <div className="text-sm text-muted-foreground">Treatment Name</div>
                          </div>
                          <Badge
                            className={`text-xs ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowScheduleDialog(false)
                      // Navigate to calendar page with staff filter
                      window.location.href = `/calendar?staff=${selectedStaff?.id}`
                    }}
                  >
                    View Full Calendar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setShowScheduleDialog(false)
                      // Navigate to calendar page with booking dialog open
                      window.location.href = `/calendar?action=book&staff=${selectedStaff?.id}`
                    }}
                  >
                    Add Appointment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Staff Member Dialog */}
        <Dialog open={showAddStaffDialog} onOpenChange={setShowAddStaffDialog}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-[#C8B6FF]" />
                Add New Staff Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role *
                  </Label>
                  <Select
                    value={newStaffForm.role}
                    onValueChange={(value) => setNewStaffForm((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beauty Therapist">Beauty Therapist</SelectItem>
                      <SelectItem value="Facial Specialist">Facial Specialist</SelectItem>
                      <SelectItem value="Massage Therapist">Massage Therapist</SelectItem>
                      <SelectItem value="Nail Technician">Nail Technician</SelectItem>
                      <SelectItem value="Hair Stylist">Hair Stylist</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+62 812 345 6789"
                    className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Working Days & Hours</Label>
                <div className="space-y-4 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="border border-[#E7C6FF] rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`new-day-${day}`}
                          checked={newStaffForm.workingDays.includes(day)}
                          onCheckedChange={() => handleWorkingDayToggle(day, false)}
                          className="border-[#E7C6FF] data-[state=checked]:bg-[#C8B6FF]"
                        />
                        <Label htmlFor={`new-day-${day}`} className="text-sm font-medium">
                          {day}
                        </Label>
                      </div>

                      {newStaffForm.workingDays.includes(day) && (
                        <div className="space-y-2 ml-6">
                          {(newStaffForm.workingSchedule[day] || []).map((range, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-[#FFD6FF]/20 rounded-lg">
                              <Clock className="h-4 w-4 text-[#C8B6FF]" />
                              <span className="flex-1 text-sm">{range}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTimeRangeForDay(day, range, false)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Select
                              value={newTimeRange.start}
                              onValueChange={(value) => setNewTimeRange((prev) => ({ ...prev, start: value }))}
                            >
                              <SelectTrigger className="flex-1 border-[#E7C6FF]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = i.toString().padStart(2, "0")
                                  return (
                                    <SelectItem key={hour} value={`${hour}:00`}>
                                      {hour}:00
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <span className="self-center text-sm text-muted-foreground">to</span>
                            <Select
                              value={newTimeRange.end}
                              onValueChange={(value) => setNewTimeRange((prev) => ({ ...prev, end: value }))}
                            >
                              <SelectTrigger className="flex-1 border-[#E7C6FF]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => {
                                  const hour = i.toString().padStart(2, "0")
                                  return (
                                    <SelectItem key={hour} value={`${hour}:00`}>
                                      {hour}:00
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              onClick={() => handleAddTimeRangeForDay(day, false)}
                              size="sm"
                              className="bg-[#E7C6FF] hover:bg-[#C8B6FF] text-purple-800"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="skills" className="text-sm font-medium">
                  Skills & Specialties
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill"
                    className="border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    size="sm"
                    className="bg-[#E7C6FF] hover:bg-[#C8B6FF] text-purple-800"
                  >
                    Add
                  </Button>
                </div>
                {newStaffForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newStaffForm.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs bg-[#FFD6FF] text-purple-800 hover:bg-[#E7C6FF]"
                      >
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Assign Treatments</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border border-[#E7C6FF] rounded-lg p-3">
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-treatment-${treatment.id}`}
                        checked={newStaffForm.assignedTreatments?.includes(treatment.id) || false}
                        onCheckedChange={(checked) => {
                          setNewStaffForm((prev) => {
                            const currentTreatments = prev.assignedTreatments || []
                            if (checked) {
                              return {
                                ...prev,
                                assignedTreatments: [...currentTreatments, treatment.id],
                              }
                            } else {
                              return {
                                ...prev,
                                assignedTreatments: currentTreatments.filter((id) => id !== treatment.id),
                              }
                            }
                          })
                        }}
                        className="border-[#E7C6FF] data-[state=checked]:bg-[#C8B6FF]"
                      />
                      <Label htmlFor={`new-treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <span>{treatment.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {treatment.duration}min
                          </Badge>
                          <span className="text-muted-foreground">Rp {treatment.price?.toLocaleString()}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newStaffForm.notes}
                  onChange={(e) => setNewStaffForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes about the staff member..."
                  className="mt-1 border-[#E7C6FF] focus:border-[#C8B6FF] focus:ring-[#C8B6FF]"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddStaffDialog(false)}
                  className="flex-1 border-[#E7C6FF] text-purple-700 hover:bg-[#FFD6FF]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddStaff}
                  className="flex-1 bg-gradient-to-r from-[#E7C6FF] to-[#C8B6FF] hover:from-[#C8B6FF] hover:to-[#B8C0FF] text-purple-800 shadow-lg"
                >
                  Add Staff Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
