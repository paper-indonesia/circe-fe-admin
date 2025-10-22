"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, addDays, startOfDay } from "date-fns"
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
  disableNavigation?: boolean
}

export function BookingDateTime({
  provider,
  selectedStaffId,
  availabilityGrid,
  onSelectDateTime,
  onWeekChange,
  isLoading = false,
  error,
  className,
  disableNavigation = false
}: BookingDateTimeProps) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Use weekStart directly from availabilityGrid (controlled by parent)
  const weekStart = useMemo(() => {
    if (availabilityGrid && availabilityGrid.start_date) {
      return startOfDay(new Date(availabilityGrid.start_date))
    }
    // Fallback to today if no grid data
    return startOfDay(new Date())
  }, [availabilityGrid])

  // Generate week days (7 days from weekStart)
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      days.push({
        date: format(day, 'yyyy-MM-dd'),
        dayName: format(day, 'EEE'),
        dayNumber: format(day, 'd'),
        fullDate: day
      })
    }
    return days
  }, [weekStart])

  // Get all unique time slots across all days
  const allTimeSlots = useMemo(() => {
    if (!availabilityGrid) return []

    const timeSlotsSet = new Set<string>()
    Object.values(availabilityGrid.availability_grid).forEach(daySlots => {
      daySlots.forEach(slot => {
        timeSlotsSet.add(slot.start_time)
      })
    })

    return Array.from(timeSlotsSet).sort()
  }, [availabilityGrid])

  // Build grid data structure: { time: { date: { available, slot } } }
  const gridData = useMemo(() => {
    if (!availabilityGrid) return {}

    const grid: Record<string, Record<string, { available: boolean; isPast: boolean }>> = {}
    const now = new Date()
    const currentTime = format(now, 'HH:mm')
    const today = format(now, 'yyyy-MM-dd')

    allTimeSlots.forEach(time => {
      grid[time] = {}
      weekDays.forEach(day => {
        const daySlots = availabilityGrid.availability_grid[day.date] || []
        const slot = daySlots.find(s => s.start_time === time)

        // Check if slot is in the past (only for today)
        const isPast = day.date === today && time < currentTime

        grid[time][day.date] = {
          available: slot ? slot.is_available && !isPast : false,
          isPast
        }
      })
    })

    return grid
  }, [availabilityGrid, allTimeSlots, weekDays])

  // Handler for previous week
  const handlePrevWeek = () => {
    const newWeekStart = addDays(weekStart, -7)
    console.log('[BookingDateTime] Previous button clicked:', {
      currentWeekStart: format(weekStart, 'yyyy-MM-dd'),
      newWeekStart: format(newWeekStart, 'yyyy-MM-dd')
    })
    setSelectedDate("")
    setSelectedTime("")
    onWeekChange?.(newWeekStart)
  }

  // Handler for next week
  const handleNextWeek = () => {
    const newWeekStart = addDays(weekStart, 7)
    console.log('[BookingDateTime] Next button clicked:', {
      currentWeekStart: format(weekStart, 'yyyy-MM-dd'),
      newWeekStart: format(newWeekStart, 'yyyy-MM-dd')
    })
    setSelectedDate("")
    setSelectedTime("")
    onWeekChange?.(newWeekStart)
  }

  // Check if can go back (only if weekStart is after today)
  const canGoBack = useMemo(() => {
    const today = startOfDay(new Date())
    return weekStart > today
  }, [weekStart])

  // Handler for selecting a time slot
  const handleSelectSlot = (date: string, time: string, available: boolean) => {
    if (!available) return

    setSelectedDate(date)
    setSelectedTime(time)
    onSelectDateTime(date, time)
  }

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

      {/* Week Navigation */}
      <div className="border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              disabled={!canGoBack}
              className="h-8 px-2 hover:bg-gray-100 gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous 7 days"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>

            <h4 className="text-sm font-bold text-gray-900 ml-2">
              {format(weekDays[0].fullDate, 'MMM d')} - {format(weekDays[6].fullDate, 'MMM d, yyyy')}
            </h4>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="h-8 px-3 hover:bg-gray-100 gap-1"
            aria-label="Next 7 days"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Availability Grid */}
      <div className="flex-1 overflow-auto p-4">
        {error ? (
          // Error State
          <div className="flex flex-col items-center justify-center h-full py-8">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-600">Failed to load availability</p>
          </div>
        ) : !selectedStaffId ? (
          // No Staff Selected
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
            <Clock className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a staff member first</p>
          </div>
        ) : isLoading ? (
          // Loading State
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-16 h-10 animate-pulse bg-gray-200 rounded" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 h-10 animate-pulse bg-gray-200 rounded" />
                ))}
              </div>
            ))}
          </div>
        ) : allTimeSlots.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center h-full py-8 text-gray-500">
            <Calendar className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No availability found</p>
          </div>
        ) : (
          // Grid Layout
          <div className="min-w-max">
            {/* Header Row - Dates */}
            <div className="flex mb-2 sticky top-0 bg-white z-10 pb-2 border-b">
              <div className="w-20 flex-shrink-0" /> {/* Time column spacer */}
              {weekDays.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 min-w-[80px] px-2 text-center"
                >
                  <div className="text-xs font-medium text-gray-500 uppercase">
                    {day.dayName}
                  </div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {day.dayNumber}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="space-y-1">
              {allTimeSlots.map((time) => (
                <div key={time} className="flex items-center gap-2">
                  {/* Time Label */}
                  <div className="w-20 flex-shrink-0 text-sm font-medium text-gray-600 text-right pr-4">
                    {time}
                  </div>

                  {/* Availability Cells */}
                  {weekDays.map((day) => {
                    const cellData = gridData[time]?.[day.date]
                    const isSelected = selectedDate === day.date && selectedTime === time
                    const isAvailable = cellData?.available || false
                    const isPast = cellData?.isPast || false

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => handleSelectSlot(day.date, time, isAvailable)}
                        disabled={!isAvailable}
                        className={cn(
                          "flex-1 min-w-[80px] h-10 px-2 rounded-lg text-xs font-medium transition-all",
                          isSelected
                            ? "bg-[#C8B6FF] text-white shadow-md ring-2 ring-[#B8A6EF] ring-offset-1"
                            : isAvailable
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300"
                              : isPast
                                ? "bg-gray-50 text-gray-300 cursor-not-allowed opacity-40"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        )}
                      >
                        {isAvailable ? (isSelected ? "Selected" : "Available") : (isPast ? "Past" : "-")}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Selection Summary */}
      {selectedDate && selectedTime && (
        <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-[#C8B6FF] flex-shrink-0" />
            <span className="font-semibold text-gray-900">
              {format(new Date(selectedDate), 'EEE, MMM d, yyyy')}
            </span>
            <span className="text-gray-400 mx-1">·</span>
            <Clock className="h-4 w-4 text-[#C8B6FF] flex-shrink-0" />
            <span className="font-semibold text-gray-900">{selectedTime}</span>
          </div>
        </div>
      )}
    </div>
  )
}
