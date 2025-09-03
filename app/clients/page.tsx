"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/context"
import { format, parseISO, isValid } from "date-fns"
import { useRouter } from "next/navigation"
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  CalendarIcon,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CalendarDays,
  AlertTriangle,
} from "lucide-react"

export default function ClientsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    patients = [],
    bookings = [],
    treatments = [],
    staff = [],
    addPatient,
    updatePatient,
    deletePatient,
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [spendingFilter, setSpendingFilter] = useState("all")
  const [visitCountFilter, setVisitCountFilter] = useState("all")
  const [joinDateFrom, setJoinDateFrom] = useState<Date | undefined>()
  const [joinDateTo, setJoinDateTo] = useState<Date | undefined>()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [clientForm, setClientForm] = useState({ name: "", phone: "", email: "", notes: "" })

  useEffect(() => {
    // Removed load functions since context doesn't expose them
  }, []) // Removed load functions from dependency array to prevent infinite loop

  const clientsWithStats = useMemo(() => {
    return patients.map((patient) => {
      const clientBookings = bookings.filter((b) => b.patientId === patient.id)
      const completedBookings = clientBookings.filter((b) => b.status === "completed")

      const totalSpent = completedBookings.reduce((total, booking) => {
        const treatment = treatments.find((t) => t.id === booking.treatmentId)
        return total + (treatment?.price || 0)
      }, 0)

      const lastVisit =
        patient.lastVisitAt && typeof patient.lastVisitAt === "string"
          ? (() => {
              try {
                const parsed = parseISO(patient.lastVisitAt)
                return isValid(parsed) ? parsed : null
              } catch {
                return null
              }
            })()
          : null

      const daysSinceLastVisit = lastVisit
        ? Math.floor((new Date().getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : null

      let status = "new"
      if (totalSpent > 5000000) status = "vip"
      else if (patient.totalVisits > 3) status = "active"

      return {
        ...patient,
        totalSpent,
        completedBookings: completedBookings.length,
        lastVisitFormatted: lastVisit
          ? daysSinceLastVisit === 0
            ? "Today"
            : daysSinceLastVisit === 1
              ? "Yesterday"
              : daysSinceLastVisit < 7
                ? `${daysSinceLastVisit} days ago`
                : daysSinceLastVisit < 30
                  ? `${Math.floor(daysSinceLastVisit / 7)} weeks ago`
                  : `${Math.floor(daysSinceLastVisit / 30)} months ago`
          : "Never",
        status,
        bookingHistory: clientBookings.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
      }
    })
  }, [patients, bookings, treatments])

  const filteredClients = useMemo(() => {
    return clientsWithStats.filter((client) => {
      const matchesSearch =
        searchQuery === "" ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || client.status === statusFilter

      const matchesSpending = (() => {
        switch (spendingFilter) {
          case "low":
            return client.totalSpent < 1000000
          case "medium":
            return client.totalSpent >= 1000000 && client.totalSpent < 5000000
          case "high":
            return client.totalSpent >= 5000000
          default:
            return true
        }
      })()

      const matchesVisitCount = (() => {
        switch (visitCountFilter) {
          case "new":
            return client.totalVisits <= 1
          case "regular":
            return client.totalVisits > 1 && client.totalVisits <= 5
          case "frequent":
            return client.totalVisits > 5
          default:
            return true
        }
      })()

      const matchesJoinDate = (() => {
        if (!joinDateFrom && !joinDateTo) return true

        const clientJoinDate =
          client.createdAt && typeof client.createdAt === "string"
            ? (() => {
                try {
                  const parsed = parseISO(client.createdAt)
                  return isValid(parsed) ? parsed : null
                } catch {
                  return null
                }
              })()
            : null

        if (!clientJoinDate) return false

        if (joinDateFrom && clientJoinDate < joinDateFrom) return false
        if (joinDateTo && clientJoinDate > joinDateTo) return false

        return true
      })()

      return matchesSearch && matchesStatus && matchesSpending && matchesVisitCount && matchesJoinDate
    })
  }, [clientsWithStats, searchQuery, statusFilter, spendingFilter, visitCountFilter, joinDateFrom, joinDateTo])

  const totalPages = Math.ceil(filteredClients.length / pageSize)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredClients.slice(startIndex, startIndex + pageSize)
  }, [filteredClients, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, spendingFilter, visitCountFilter, joinDateFrom, joinDateTo])

  const handleAddClient = async () => {
    if (!clientForm.name || !clientForm.phone) {
      toast({ title: "Error", description: "Name and phone are required", variant: "destructive" })
      return
    }

    try {
      await addPatient({
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email || undefined,
        notes: clientForm.notes || undefined,
      })

      toast({ title: "Success", description: "Client added successfully" })
      setShowAddDialog(false)
      setClientForm({ name: "", phone: "", email: "", notes: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to add client", variant: "destructive" })
    }
  }

  const handleEditClient = async () => {
    if (!editingClient || !clientForm.name || !clientForm.phone) {
      toast({ title: "Error", description: "Name and phone are required", variant: "destructive" })
      return
    }

    try {
      await updatePatient(editingClient.id, {
        name: clientForm.name,
        phone: clientForm.phone,
        email: clientForm.email || undefined,
        notes: clientForm.notes || undefined,
      })

      toast({ title: "Success", description: "Client updated successfully" })
      setEditingClient(null)
      setShowClientDialog(false)
      setClientForm({ name: "", phone: "", email: "", notes: "" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update client", variant: "destructive" })
    }
  }

  const handleDeleteClient = async (client: any) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return

    try {
      await deletePatient(clientToDelete.id)
      toast({ title: "Success", description: "Client deleted successfully" })
      setSelectedClient(null)
      setShowClientDialog(false)
      setShowDeleteDialog(false)
      setClientToDelete(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete client", variant: "destructive" })
    }
  }

  const openAddDialog = () => {
    setClientForm({ name: "", phone: "", email: "", notes: "" })
    setShowAddDialog(true)
  }

  const openEditDialog = (client: any) => {
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email || "",
      notes: client.notes || "",
    })
    setEditingClient(client)
  }

  const openClientDetails = (client: any) => {
    setSelectedClient(client)
    setShowClientDialog(true)
  }

  const handleNewBooking = (client: any) => {
    router.push(`/calendar?patient=${client.id}`)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSpendingFilter("all")
    setVisitCountFilter("all")
    setJoinDateFrom(undefined)
    setJoinDateTo(undefined)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (statusFilter !== "all") count++
    if (spendingFilter !== "all") count++
    if (visitCountFilter !== "all") count++
    if (joinDateFrom || joinDateTo) count++
    return count
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "vip":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">VIP</Badge>
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            New
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
            <p className="text-muted-foreground">Manage your client database and relationships</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] hover:from-[#E7C6FF] hover:to-[#C8B6FF] text-purple-800 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-pink-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients by name, phone, or email..."
                      className="pl-10 border-pink-200 focus:border-pink-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-pink-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="ml-2 bg-pink-500 text-white text-xs px-1.5 py-0.5">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-pink-700">Spending Level</Label>
                      <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                        <SelectTrigger className="border-pink-200">
                          <SelectValue placeholder="All spending" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All spending</SelectItem>
                          <SelectItem value="low">Low (&lt; Rp 1M)</SelectItem>
                          <SelectItem value="medium">Medium (Rp 1M - 5M)</SelectItem>
                          <SelectItem value="high">High (&gt; Rp 5M)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-pink-700">Visit Frequency</Label>
                      <Select value={visitCountFilter} onValueChange={setVisitCountFilter}>
                        <SelectTrigger className="border-pink-200">
                          <SelectValue placeholder="All visits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All visits</SelectItem>
                          <SelectItem value="new">New (≤ 1 visit)</SelectItem>
                          <SelectItem value="regular">Regular (2-5 visits)</SelectItem>
                          <SelectItem value="frequent">Frequent (&gt; 5 visits)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-pink-700">Join Date Range</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left border-pink-200 bg-transparent"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {joinDateFrom ? format(joinDateFrom, "MMM d") : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateFrom}
                              onSelect={setJoinDateFrom}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left border-pink-200 bg-transparent"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {joinDateTo ? format(joinDateTo, "MMM d") : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateTo}
                              onSelect={setJoinDateTo}
                              disabled={(date) => date > new Date() || (joinDateFrom && date < joinDateFrom)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {getActiveFiltersCount() > 0 && (
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="border-pink-300 text-pink-700 hover:bg-pink-100 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Clients ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ||
                statusFilter !== "all" ||
                spendingFilter !== "all" ||
                visitCountFilter !== "all" ||
                joinDateFrom ||
                joinDateTo
                  ? "No clients match your search criteria"
                  : "No clients found"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Last Visit</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Total Spent</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Visits</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedClients.map((client) => (
                        <tr key={client.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-4 px-2">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email || "No email"}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-muted-foreground">{client.phone}</td>
                          <td className="py-4 px-2 text-sm">{client.lastVisitFormatted}</td>
                          <td className="py-4 px-2 font-medium">Rp {client.totalSpent.toLocaleString("id-ID")}</td>
                          <td className="py-4 px-2 text-sm">{client.totalVisits}</td>
                          <td className="py-4 px-2">{getStatusBadge(client.status)}</td>
                          <td className="py-4 px-2">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => openClientDetails(client)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleNewBooking(client)}>
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Book
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClient(client)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add Client Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Client
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Client name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="+62 812 345 6789"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@email.com"
                  value={clientForm.email}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about the client..."
                  value={clientForm.notes}
                  onChange={(e) => setClientForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddClient} className="flex-1">
                  Add Client
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Client Details Dialog */}
        <Dialog
          open={showClientDialog}
          onOpenChange={() => {
            setShowClientDialog(false)
            setSelectedClient(null)
            setEditingClient(null)
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingClient ? "Edit Client" : "Client Details"}
              </DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                {editingClient ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Name *</Label>
                      <Input
                        id="edit-name"
                        value={clientForm.name}
                        onChange={(e) => setClientForm((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone *</Label>
                      <Input
                        id="edit-phone"
                        value={clientForm.phone}
                        onChange={(e) => setClientForm((prev) => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={clientForm.email}
                        onChange={(e) => setClientForm((prev) => ({ ...prev, email: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-notes">Notes</Label>
                      <Textarea
                        id="edit-notes"
                        value={clientForm.notes}
                        onChange={(e) => setClientForm((prev) => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleEditClient} className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingClient(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                        <div className="flex items-center gap-2 mt-1">{getStatusBadge(selectedClient.status)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedClient)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClient(selectedClient)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.email || "No email provided"}</span>
                            </div>
                          </div>
                        </div>

                        {selectedClient.notes && (
                          <div>
                            <h4 className="font-medium mb-2">Notes</h4>
                            <p className="text-sm text-muted-foreground">{selectedClient.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Statistics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Visits:</span>
                              <span className="font-medium">{selectedClient.totalVisits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Spent:</span>
                              <span className="font-medium">Rp {selectedClient.totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Visit:</span>
                              <span className="font-medium">{selectedClient.lastVisitFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Member Since:</span>
                              <span className="font-medium">
                                {selectedClient.createdAt && typeof selectedClient.createdAt === "string"
                                  ? (() => {
                                      try {
                                        const parsed = parseISO(selectedClient.createdAt)
                                        return isValid(parsed) ? format(parsed, "MMM yyyy") : "Unknown"
                                      } catch {
                                        return "Unknown"
                                      }
                                    })()
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Booking History</h4>
                        <Button size="sm" onClick={() => handleNewBooking(selectedClient)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          New Booking
                        </Button>
                      </div>

                      {selectedClient.bookingHistory.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground">No booking history</div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {selectedClient.bookingHistory.slice(0, 10).map((booking: any) => {
                            const treatment = treatments.find((t) => t.id === booking.treatmentId)
                            const staffMember = staff.find((s) => s.id === booking.staffId)

                            return (
                              <div
                                key={booking.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium text-sm">{treatment?.name || "Unknown Treatment"}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(parseISO(booking.startAt), "MMM d, yyyy HH:mm")} •{" "}
                                    {staffMember?.name || "Unknown Staff"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge
                                    variant={booking.status === "completed" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {booking.status}
                                  </Badge>
                                  {booking.status === "completed" && treatment && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Rp {treatment.price.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Client
              </DialogTitle>
            </DialogHeader>
            {clientToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure you want to delete this client? This action cannot be undone and will also remove:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4">
                    <li>• All booking history ({clientToDelete.bookingHistory?.length || 0} bookings)</li>
                    <li>• Client contact information</li>
                    <li>• All associated data</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                  <h4 className="font-medium text-pink-800 mb-2">Client Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-pink-700">Name:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Phone:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Total Visits:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.totalVisits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Total Spent:</span>
                      <span className="font-medium text-pink-900">
                        Rp {clientToDelete.totalSpent?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Status:</span>
                      <span className="font-medium text-pink-900">{getStatusBadge(clientToDelete.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={confirmDeleteClient} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setClientToDelete(null)
                    }}
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
