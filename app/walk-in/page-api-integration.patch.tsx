/**
 * PATCH FILE untuk Walk-In API Integration
 *
 * Tambahkan code ini ke walk-in/page.tsx
 */

// ===== 1. ADD IMPORTS =====
// Tambahkan di bagian atas file setelah existing imports
import { searchCustomers, createCustomer, type Customer } from '@/lib/api/walk-in'
import { debounce } from 'lodash' // Install: npm install lodash @types/lodash

// ===== 2. ADD STATE untuk CUSTOMERS =====
// Tambahkan setelah existing state declarations (sekitar line 80-100)
const [customers, setCustomers] = useState<Customer[]>([])
const [loadingCustomers, setLoadingCustomers] = useState(false)
const [customersError, setCustomersError] = useState<string | null>(null)

// ===== 3. REPLACE existingClients useMemo =====
// HAPUS code line 214-224 yang lama:
/*
const existingClients = useMemo(() => {
  return patients.map(p => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    email: p.email || '',
    lastVisit: p.lastVisitAt || 'New client',
    totalVisits: p.totalVisits
  }))
}, [patients])
*/

// GANTI DENGAN:
const existingClients = useMemo(() => {
  return customers.map(c => ({
    id: c.customer_id,
    name: c.name,
    phone: c.phone,
    email: c.email || '',
    lastVisit: c.last_visit ? format(new Date(c.last_visit), 'MMM d, yyyy') : 'New client',
    totalVisits: c.total_appointments
  }))
}, [customers])

// ===== 4. ADD FUNCTION untuk LOAD CUSTOMERS =====
// Tambahkan setelah validateForm function (sekitar line 295)

// Load customers saat dialog dibuka
const loadInitialCustomers = async () => {
  setLoadingCustomers(true)
  setCustomersError(null)
  try {
    // Load first 50 customers
    const results = await searchCustomers('')
    setCustomers(results)
  } catch (error: any) {
    console.error('Error loading customers:', error)
    setCustomersError(error.message)
    toast({
      title: "Error",
      description: "Failed to load customers list",
      variant: "destructive"
    })
  } finally {
    setLoadingCustomers(false)
  }
}

// Debounced search function
const debouncedSearchCustomers = useMemo(
  () => debounce(async (query: string) => {
    if (query.length < 2) {
      // Load initial customers if query is empty
      loadInitialCustomers()
      return
    }

    setLoadingCustomers(true)
    setCustomersError(null)
    try {
      const results = await searchCustomers(query)
      setCustomers(results)
    } catch (error: any) {
      console.error('Error searching customers:', error)
      setCustomersError(error.message)
    } finally {
      setLoadingCustomers(false)
    }
  }, 300),
  []
)

// ===== 5. ADD useEffect untuk LOAD CUSTOMERS =====
// Tambahkan setelah existing useEffects (sekitar line 215)

// Load customers when search dialog is opened
useEffect(() => {
  if (showClientSearch && customers.length === 0) {
    loadInitialCustomers()
  }
}, [showClientSearch])

// ===== 6. UPDATE handleClientSelect =====
// REPLACE function handleClientSelect (sekitar line 452-466)
// DENGAN:

const handleClientSelect = (client: any) => {
  setFormData({
    ...formData,
    name: client.name,
    phone: client.phone,
    email: client.email,
    existingClient: true,
    existingClientId: client.id // Simpan customer_id
  })
  setShowClientSearch(false)
  setSearchQuery("")
  toast({
    title: "Client Selected",
    description: `${client.name} has been selected.`,
  })
}

// ===== 7. UPDATE formData interface =====
// TAMBAHKAN field existingClientId di formData state (sekitar line 105-124)
// Tambahkan:
// existingClientId: "",

// ===== 8. UPDATE confirmBooking function =====
// REPLACE section Create Customer di confirmBooking (sekitar line 315-326)
// DARI:
/*
let patientId = formData.existingClientId
if (!patientId) {
  const newPatient = await apiClient.createPatient({
    name: formData.name,
    phone: formData.phone,
    email: formData.email,
    notes: formData.notes
  })
  patientId = newPatient._id
}
*/

// GANTI DENGAN:
let customerId = formData.existingClientId

if (!customerId) {
  // Create new customer via Circe API
  try {
    const newCustomer = await createCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes
    })
    customerId = newCustomer.customer_id

    toast({
      title: "Customer Created",
      description: `${formData.name} has been added to your customer database.`
    })
  } catch (error: any) {
    console.error('Error creating customer:', error)
    toast({
      title: "Warning",
      description: "Customer creation failed, but booking will continue with entered details.",
      variant: "destructive"
    })
    // Continue booking even if customer creation fails
  }
}

// ===== 9. UPDATE Client Search Input =====
// REPLACE Input di Client Search Dialog (sekitar line 1592-1608)
// DENGAN:

<div className="relative flex-shrink-0">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search by name, phone, or email..."
    value={searchQuery}
    onChange={(e) => {
      const value = e.target.value
      setSearchQuery(value)
      // Trigger debounced search
      debouncedSearchCustomers(value)
    }}
    className="pl-10 pr-10 h-11"
  />
  {searchQuery && (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
      onClick={() => {
        setSearchQuery("")
        loadInitialCustomers() // Reload initial list
      }}
    >
      <X className="h-4 w-4" />
    </Button>
  )}
</div>

// ===== 10. UPDATE Client Search Results with Loading State =====
// REPLACE Results List section (sekitar line 1612-1690)
// DENGAN:

<div className="flex-1 overflow-y-auto pr-2 min-h-0">
  {loadingCustomers ? (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
      <p className="text-sm text-muted-foreground">Searching customers...</p>
    </div>
  ) : customersError ? (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <AlertCircle className="h-12 w-12 mb-3 text-red-500 opacity-50" />
      <p className="text-sm font-medium text-red-600">{customersError}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={loadInitialCustomers}
        className="mt-3"
      >
        Retry
      </Button>
    </div>
  ) : filteredClients.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Users className="h-12 w-12 mb-3 opacity-30" />
      <p className="text-sm font-medium">
        {searchQuery ? "No clients found matching your search" : "No clients found"}
      </p>
      {searchQuery && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchQuery("")
            loadInitialCustomers()
          }}
          className="mt-3"
        >
          Clear Search
        </Button>
      )}
    </div>
  ) : (
    <div className="space-y-4">
      {Object.keys(groupedClients)
        .sort()
        .map((letter) => {
          const isExpanded = expandedGroups.has(letter)
          const clientCount = groupedClients[letter].length

          return (
            <div key={letter} className="space-y-2">
              {/* Alphabet Header - Clickable */}
              <button
                onClick={() => toggleGroup(letter)}
                className="w-full sticky top-0 bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-sm z-10 py-2.5 px-3 rounded-lg border-l-4 border-primary hover:from-primary/20 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-primary">{letter}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {clientCount} {clientCount === 1 ? 'client' : 'clients'}
                    </Badge>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-primary transition-transform duration-300",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}
                  />
                </div>
              </button>

              {/* Clients in this group - Collapsible */}
              {isExpanded && (
                <div className="space-y-2 pl-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  {groupedClients[letter].map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="group p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base text-foreground mb-2 truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-mono">{client.phone}</span>
                            </div>
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {client.lastVisit === 'New client' ? '🆕 New' : `Last: ${client.lastVisit}`}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
    </div>
  )}
</div>

// ===== 11. CLEANUP on unmount =====
// Tambahkan useEffect untuk cleanup debounce
useEffect(() => {
  return () => {
    debouncedSearchCustomers.cancel()
  }
}, [debouncedSearchCustomers])

// ===== DONE! =====
/**
 * Summary perubahan:
 * 1. ✅ Import API functions dari @/lib/api/walk-in
 * 2. ✅ Add state untuk customers, loading, error
 * 3. ✅ Replace existingClients dengan data dari API
 * 4. ✅ Add loadInitialCustomers function
 * 5. ✅ Add debounced search function
 * 6. ✅ Load customers saat dialog dibuka
 * 7. ✅ Update handleClientSelect untuk save customer_id
 * 8. ✅ Update confirmBooking untuk create customer via API
 * 9. ✅ Update search input dengan real-time API call
 * 10. ✅ Add loading & error states di results list
 * 11. ✅ Cleanup debounce on unmount
 *
 * Testing checklist:
 * - [ ] Click "Existing Client" checkbox
 * - [ ] Click "Search Client" button
 * - [ ] Dialog opens and loads customers
 * - [ ] Type to search (debounced)
 * - [ ] Select customer fills form
 * - [ ] Create new customer if not exists
 * - [ ] Error handling works
 */
