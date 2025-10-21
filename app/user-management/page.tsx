"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Shield, UserPlus, Edit, Trash2, Search, Loader2, Mail, User, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"

interface OutletInfo {
  id: string
  name: string
  slug: string
}

interface UserData {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  is_active: boolean
  outlets?: OutletInfo[]
  tenant_id: string
  position?: string
  employment_type?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
  last_login?: string
}

const ROLES = [
  { value: "TENANT_ADMIN", label: "Tenant Admin", color: "from-purple-500 to-pink-500", description: "Full tenant access" },
  { value: "OUTLET_MANAGER", label: "Outlet Manager", color: "from-blue-500 to-cyan-500", description: "Manage outlet operations" },
  { value: "STAFF", label: "Staff", color: "from-green-500 to-emerald-500", description: "Basic staff access" },
]

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "intern", label: "Intern" },
]



export default function UserManagementPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const undoToastDismissRef = useRef<(() => void) | null>(null)

  const [users, setUsers] = useState<UserData[]>([])
  const [outlets, setOutlets] = useState<OutletInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    role: "STAFF",
    position: "",
    employment_type: "full_time",
    outlets: [] as string[],
    is_active: true,
  })

  // Check if user is admin (only after auth is loaded)
  useEffect(() => {
    if (!authLoading) {
      console.log('Auth state:', {
        authLoading,
        user: user ? { id: user.id, email: user.email, role: user.role } : null,
        isAdminResult: user ? isAdmin() : false
      })

      if (!user) {
        console.log('No user found, redirecting to signin')
        router.push('/signin')
      } else {
        const adminCheck = isAdmin()
        console.log('Admin check result:', adminCheck, 'User role:', user.role)
        if (!adminCheck) {
          console.log('User is not admin, redirecting to dashboard')
          router.push('/dashboard')
        }
      }
    }
  }, [authLoading, user, router])

  // Fetch users (only if admin and auth loaded)
  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      fetchUsers()
      fetchOutlets()
    }
  }, [authLoading, user, isAdmin, page, searchTerm, filterRole, filterStatus])

  const fetchOutlets = async () => {
    try {
      const response = await fetch('/api/outlets')
      if (response.ok) {
        const data = await response.json()
        // Handle both paginated and non-paginated responses
        if (data.items) {
          setOutlets(data.items)
        } else {
          setOutlets(data.outlets || data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching outlets:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (filterRole !== 'all') {
        params.append('role', filterRole)
      }

      if (filterStatus !== 'all') {
        params.append('is_active', filterStatus)
      }

      const response = await fetch(`/api/users?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // Handle paginated response
        if (data.items) {
          setUsers(data.items)
          setTotal(data.total)
          setTotalPages(Math.ceil(data.total / 20))
        } else {
          setUsers(data.users || [])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      password: "",
      role: "STAFF",
      position: "",
      employment_type: "full_time",
      outlets: [],
      is_active: true,
    })
  }

  const handleAddUser = async () => {
    try {
      setError("")

      // Validate required fields
      if (!formData.password) {
        setError('Password is required')
        return
      }

      // Validate password requirements
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }

      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumber = /[0-9]/.test(formData.password)
      const hasSpecialChar = /[!@#$%^&*]/.test(formData.password)

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)')
        return
      }

      // Get tenant_id from localStorage
      const tenantData = localStorage.getItem('tenant')
      let tenantId = null
      if (tenantData) {
        try {
          const tenant = JSON.parse(tenantData)
          tenantId = tenant.id
        } catch (e) {
          console.error('Failed to parse tenant:', e)
        }
      }

      if (!tenantId) {
        setError('Tenant information not found. Please sign in again.')
        return
      }

      // Prepare payload sesuai API documentation
      const payload: any = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role.toLowerCase(), // API expects lowercase
        tenant_ids: [tenantId], // Array of tenant IDs
        send_welcome_email: false,
        password: formData.password, // Password is now mandatory
      }

      // Optional fields
      if (formData.phone) payload.phone = formData.phone
      if (formData.position) payload.position = formData.position
      if (formData.employment_type) payload.employment_type = formData.employment_type
      if (formData.outlets.length > 0) payload.outlet_ids = formData.outlets // Use outlet_ids

      console.log('Creating user with payload:', payload)

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess('User created successfully')
        setIsAddDialogOpen(false)
        resetForm()
        setShowPassword(false)
        fetchUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        console.error('Create user error:', data)

        // Handle validation errors (array of error objects)
        if (Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setError(errorMessages)
        } else if (typeof data.error === 'string') {
          setError(data.error)
        } else if (data.detail) {
          setError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        } else {
          setError('Failed to create user')
        }
      }
    } catch (error) {
      console.error('Create user exception:', error)
      setError('Failed to create user')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      setError("")

      // Prepare payload for update (sesuai API documentation)
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
      }

      // Optional fields
      if (formData.phone) payload.phone = formData.phone
      if (formData.position) payload.position = formData.position
      if (formData.employment_type) payload.employment_type = formData.employment_type
      if (formData.role) payload.role = formData.role.toLowerCase() // API expects lowercase
      if (formData.outlets.length > 0) payload.outlet_ids = formData.outlets // Use outlet_ids

      console.log('Updating user:', selectedUser.id, 'with payload:', payload)

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess('User updated successfully')
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        console.error('Update user error:', data)

        // Handle validation errors (array of error objects)
        if (Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setError(errorMessages)
        } else if (typeof data.error === 'string') {
          setError(data.error)
        } else if (data.detail) {
          setError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        } else {
          setError('Failed to update user')
        }
      }
    } catch (error) {
      console.error('Update user exception:', error)
      setError('Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    const deletedUser = { ...selectedUser }

    try {
      setError("")
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Clear existing undo timer if any
        if (undoTimerRef.current) {
          clearTimeout(undoTimerRef.current)
        }
        if (undoToastDismissRef.current) {
          undoToastDismissRef.current()
        }

        // Show undo toast
        const { dismiss } = toast({
          title: "User deleted (soft)",
          description: "Undo within 10 seconds.",
          duration: 10000,
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUndoDeleteUser(deletedUser.id)}
              className="bg-white hover:bg-gray-100"
            >
              Undo
            </Button>
          ),
        })

        undoToastDismissRef.current = dismiss

        // Set timer to finalize deletion after 10 seconds
        undoTimerRef.current = setTimeout(() => {
          undoTimerRef.current = null
          undoToastDismissRef.current = null
        }, 10000)

        setIsDeleteDialogOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
        toast({
          title: "Error",
          description: data.error || 'Failed to delete user',
          variant: "destructive"
        })
      }
    } catch (error) {
      setError('Failed to delete user')
      toast({
        title: "Error",
        description: 'Failed to delete user',
        variant: "destructive"
      })
    }
  }

  const handleUndoDeleteUser = async (userId: string) => {
    try {
      // Call restore API endpoint
      const response = await fetch(`/api/users/${userId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore user')
      }

      // Clear undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
        undoTimerRef.current = null
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
        undoToastDismissRef.current = null
      }

      toast({
        title: "User restored",
        description: "User has been successfully restored.",
      })

      // Refresh users list
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore user",
        variant: "destructive"
      })
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role)
    return (
      <Badge className={`bg-gradient-to-r ${roleConfig?.color || 'from-gray-500 to-slate-500'} text-white border-0`}>
        {roleConfig?.label || role}
      </Badge>
    )
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Don't render if not admin
  if (!user || !isAdmin()) {
    return null
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage users and their permissions</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>View and manage all users in your organization</CardDescription>
            </div>
            {!loading && total > 0 && (
              <Badge variant="secondary" className="text-sm">
                Total: {total} users
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Filter by Role</Label>
                <Select value={filterRole} onValueChange={(value) => { setFilterRole(value); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Filter by Status</Label>
                <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setPage(1); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{user.first_name} {user.last_name}</p>
                          {user.position && (
                            <p className="text-xs text-gray-500">{user.position}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{user.email}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-500">{user.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "success" : "outline"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setFormData({
                                email: user.email,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                phone: user.phone || "",
                                password: "",
                                role: user.role,
                                position: user.position || "",
                                employment_type: user.employment_type || "full_time",
                                outlets: user.outlets?.map(o => o.id) || [],
                                is_active: user.is_active,
                              })
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && users.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          resetForm();
          setShowPassword(false);
          setError("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account for your organization</DialogDescription>
          </DialogHeader>

          {/* Error Alert in Dialog */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                    +62
                  </div>
                  <Input
                    id="phone"
                    placeholder="81xxxxxxxxx"
                    value={formData.phone.startsWith('+62') ? formData.phone.slice(3) : formData.phone}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '')
                      setFormData({ ...formData, phone: input ? `+62${input}` : '' })
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter secure password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-amber-600 font-medium">
                Requirements: Min 8 chars, uppercase, lowercase, number, special character (!@#$%^&*)
              </p>
            </div>

            {/* Role & Employment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Position/Job Title</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Senior Therapist, Receptionist, etc."
              />
            </div>

            {/* Outlets Assignment */}
            <div className="space-y-2">
              <Label>Assign to Outlets (Optional)</Label>
              {outlets.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    No outlets available. Please{' '}
                    <a
                      href="/outlet-management"
                      className="font-semibold underline hover:text-amber-900"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsAddDialogOpen(false)
                        router.push('/outlet-management')
                      }}
                    >
                      create an outlet
                    </a>
                    {' '}first before assigning users.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md bg-gray-50">
                  {outlets.map((outlet) => (
                    <div key={outlet.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`outlet-${outlet.id}`}
                        checked={formData.outlets.includes(outlet.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, outlets: [...formData.outlets, outlet.id] })
                          } else {
                            setFormData({ ...formData, outlets: formData.outlets.filter(id => id !== outlet.id) })
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`outlet-${outlet.id}`} className="text-sm cursor-pointer">
                        {outlet.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Users can be assigned to one or more outlets for access control
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active user (can login)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setError("");
              setShowPassword(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setError("");
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions</DialogDescription>
          </DialogHeader>

          {/* Error Alert in Dialog */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label>Email (Read-only)</Label>
              <Input value={formData.email} disabled className="bg-gray-50" />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_first_name">First Name *</Label>
                <Input
                  id="edit_first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_last_name">Last Name *</Label>
                <Input
                  id="edit_last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                  +62
                </div>
                <Input
                  id="edit_phone"
                  placeholder="81xxxxxxxxx"
                  value={formData.phone.startsWith('+62') ? formData.phone.slice(3) : formData.phone}
                  onChange={(e) => {
                    const input = e.target.value.replace(/\D/g, '')
                    setFormData({ ...formData, phone: input ? `+62${input}` : '' })
                  }}
                />
              </div>
            </div>

            {/* Role & Employment */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_employment_type">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(value) => setFormData({ ...formData, employment_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="edit_position">Position/Job Title</Label>
              <Input
                id="edit_position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Senior Therapist, Receptionist, etc."
              />
            </div>

            {/* Outlets Assignment */}
            <div className="space-y-2">
              <Label>Assign to Outlets (Optional)</Label>
              {outlets.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    No outlets available. Please{' '}
                    <a
                      href="/outlet-management"
                      className="font-semibold underline hover:text-amber-900"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsEditDialogOpen(false)
                        router.push('/outlet-management')
                      }}
                    >
                      create an outlet
                    </a>
                    {' '}first before assigning users.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-md bg-gray-50">
                  {outlets.map((outlet) => (
                    <div key={outlet.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-outlet-${outlet.id}`}
                        checked={formData.outlets.includes(outlet.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, outlets: [...formData.outlets, outlet.id] })
                          } else {
                            setFormData({ ...formData, outlets: formData.outlets.filter(id => id !== outlet.id) })
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`edit-outlet-${outlet.id}`} className="text-sm cursor-pointer">
                        {outlet.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Users can be assigned to one or more outlets for access control
              </p>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit_is_active" className="cursor-pointer">Active user (can login)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setError("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <DeleteEntityDialog
        open={isDeleteDialogOpen && !!selectedUser}
        onOpenChange={setIsDeleteDialogOpen}
        entityType="User"
        entityName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ""}
        entityDetails={[
          { label: "Name", value: selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : "-" },
          { label: "Email", value: selectedUser?.email || "-" },
          { label: "Role", value: selectedUser?.role || "-" },
          { label: "Status", value: selectedUser?.status || "active" },
        ]}
        onConfirmDelete={handleDeleteUser}
        softDeleteImpacts={[
          "User will be marked as deleted and inactive",
          "User will not be able to login",
          "User data will be preserved for audit purposes",
          "User account can be restored within 10 seconds"
        ]}
      />
      </div>
    </>
  )
}
