"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { format, addDays, subDays, startOfWeek, isToday, isSameDay, startOfDay, isSameMonth, getMonth } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
interface Provider {
  name: string
  address: string
  avatarUrl?: string
}

interface TimeSlot {
  time: string
  available: boolean
  soon?: boolean
}

interface AvailabilitySlot {
  start_time: string
  end_time: string
  is_available: boolean
}

interface AvailabilityGrid {
  start_date: string
  end_date: string
  num_days: number
  slot_interval_minutes: number
  availability_grid: Record<string, AvailabilitySlot[]>
  metadata: {
    service_id: string
    service_name: string
    outlet_id: string
    outlet_name: string
    total_available_slots: number
    service_duration_minutes: number
  }
}

interface BookingDateTimeProps {
  provider: Provider
  selectedStaffId?: string
  existingBookings?: Array<{ bookingDate: string; timeSlot: string; staffId: string }>
  availabilityGrid?: AvailabilityGrid | null
  onSelectDateTime: (date: string, time: string) => void
  onWeekChange?: (weekStart: Date) => void
  isLoading?: boolean
  error?: string
  className?: string
}

// Loading skeleton component
const SlotSkeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-10" />
)

export function BookingDateTime({
  provider,
  selectedStaffId,
  existingBookings = [],
  availabilityGrid,
  onSelectDateTime,
  onWeekChange,
  isLoading = false,
  error,
  className
}: BookingDateTimeProps) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Generate week days
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      days.push({
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd'),
        isToday: isToday(day),
        isPast: day < startOfDay(new Date())
      })
    }
    return days
  }, [weekStart])

  // Fetch time slots from availability grid
  const fetchTimeSlots = useCallback(async (date: string) => {
    if (!selectedStaffId) {
      setSlots([])
      return
    }

    setLoadingSlots(true)

    // Use setTimeout to avoid blocking UI
    const timer = setTimeout(() => {
      try {
        // Get slots from availability grid API data
        let apiSlots: TimeSlot[] = []

        if (availabilityGrid && availabilityGrid.availability_grid[date]) {
          // Convert API slots to component format
          apiSlots = availabilityGrid.availability_grid[date].map(slot => ({
            time: slot.start_time,
            available: slot.is_available
          }))
        }

        // Get current time for today's slots (filter out past times)
        const now = new Date()
        const isToday = date === format(now, 'yyyy-MM-dd')
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        // Filter out past slots for today
        const processedSlots = apiSlots.map(slot => {
          // Check if slot is in the past (only for today)
          let isPast = false
          if (isToday) {
            const [slotHour, slotMinute] = slot.time.split(':').map(Number)
            isPast = slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)
          }

          return {
            ...slot,
            available: slot.available && !isPast
          }
        })

        setSlots(processedSlots)
      } catch (err) {
        console.error('Failed to process slots:', err)
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [selectedStaffId, availabilityGrid])

  // Fetch slots when date or staff changes
  useEffect(() => {
    fetchTimeSlots(selectedDate)
  }, [selectedDate, fetchTimeSlots])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (selectedDate) params.set('date', selectedDate)
    if (selectedTime) params.set('time', selectedTime)

    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }, [selectedDate, selectedTime])

  // Handlers
  const handlePrevWeek = () => {
    const newWeekStart = subDays(weekStart, 7)
    setWeekStart(newWeekStart)
    setSelectedTime("")
    onWeekChange?.(newWeekStart)
  }

  const handleNextWeek = () => {
    const newWeekStart = addDays(weekStart, 7)
    setWeekStart(newWeekStart)
    setSelectedTime("")
    onWeekChange?.(newWeekStart)
  }

  const handleBackToToday = () => {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 })
    setWeekStart(today)
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
    setSelectedTime("")
    onWeekChange?.(today)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    setSelectedTime("")
  }

  const handleSelectTime = (time: string) => {
    setSelectedTime(time)
    onSelectDateTime(selectedDate, time)
  }

  // Check if has selection
  const hasSelection = selectedDate && selectedTime

  return (
    <div className={cn("flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
      {/* Header - Provider Info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <Avatar className="h-12 w-12">
          <AvatarImage src={provider.avatarUrl} alt={provider.name} />
          <AvatarFallback className="bg-[#C8B6FF] text-white font-semibold text-base">
            {provider.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-gray-900 truncate">{provider.name}</h3>
          <p className="text-sm text-gray-500 truncate">{provider.address}</p>
        </div>
      </div>

      {/* Week Strip Navigation */}
      <div className="border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrevWeek}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-gray-900">
              {format(new Date(selectedDate), 'MMMM yyyy')}
            </h4>
            <button
              type="button"
              onClick={handleBackToToday}
              className="text-xs font-medium text-[#C8B6FF] hover:text-[#B8A6EF] transition-colors"
            >
              Today
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            aria-label="Next week"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Week Days Strip - Full Width Grid */}
        <div className="w-full">
          <div className="grid grid-cols-7 w-full">
            {weekDays.map((day, idx) => {
              const isSelected = selectedDate === day.date
              const isDisabled = day.isPast
              const dayDate = new Date(day.date)
              const prevDay = idx > 0 ? new Date(weekDays[idx - 1].date) : null
              const showMonthDivider = prevDay && !isSameMonth(dayDate, prevDay)

              return (
                <div key={day.date} className="relative">
                  {/* Month Divider */}
                  {showMonthDivider && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#C8B6FF] z-20" />
                  )}

                  <button
                    type="button"
                    onClick={() => !isDisabled && handleSelectDate(day.date)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "w-full flex flex-col items-center justify-center py-4 transition-all border-r last:border-r-0",
                      isSelected
                        ? "bg-[#C8B6FF] text-white"
                        : isDisabled
                          ? "bg-white text-gray-300 cursor-not-allowed"
                          : "bg-white hover:bg-gray-50 focus:outline-none active:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium uppercase tracking-wide",
                      isSelected ? "text-white/80" : "text-gray-400"
                    )}>
                      {day.dayName}
                    </span>
                    <span className={cn(
                      "text-xl font-bold leading-none mt-1.5",
                      isSelected ? "text-white" : day.isToday ? "text-[#C8B6FF]" : "text-gray-900"
                    )}>
                      {day.dayNumber}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[250px]">
        {error ? (
          // Error State
          <div className="flex flex-col items-center justify-center h-full py-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-600 mb-3">Failed to load time slots</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchTimeSlots(selectedDate)}
              className="text-xs"
            >
              Try Again
            </Button>
          </div>
        ) : !selectedStaffId ? (
          // No Staff Selected
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
            <Clock className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a staff member first</p>
            <p className="text-xs text-gray-400 mt-1">Time slots will appear here</p>
          </div>
        ) : loadingSlots || isLoading ? (
          // Loading State
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {Array.from({ length: 18 }).map((_, idx) => (
              <div key={idx} className="animate-pulse bg-gray-200 rounded h-12" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full py-6 text-gray-500">
            <Calendar className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs font-medium">No slots for this day</p>
          </div>
        ) : (
          // Time Slots Grid - Full Width Layout
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time
              const isDisabled = !slot.available

              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => slot.available && handleSelectTime(slot.time)}
                  disabled={isDisabled}
                  aria-pressed={isSelected}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-semibold transition-all focus:outline-none",
                    isSelected
                      ? "bg-teal-500 text-white shadow-md"
                      : isDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100"
                  )}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer - Selection Summary */}
      {hasSelection && (
        <div className="border-t border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-teal-600 flex-shrink-0" />
            <span className="font-semibold text-gray-900">
              {format(new Date(selectedDate), 'EEE, MMM d')}
            </span>
            <span className="text-gray-400 mx-1">·</span>
            <Clock className="h-4 w-4 text-teal-600 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{selectedTime}</span>
          </div>
        </div>
      )}
    </div>
  )
}
