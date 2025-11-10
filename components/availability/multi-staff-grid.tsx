"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, isSameDay } from "date-fns"
import { Clock, Users, Plus } from "lucide-react"

// Color scheme for availability types
const AVAILABILITY_COLORS = {
  working_hours: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-800",
    label: "Jam Kerja",
    dot: "bg-green-500"
  },
  break: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-800",
    label: "Istirahat",
    dot: "bg-yellow-500"
  },
  blocked: {
    bg: "bg-red-100",
    border: "border-red-500",
    text: "text-red-800",
    label: "Blokir",
    dot: "bg-red-500"
  },
  vacation: {
    bg: "bg-purple-100",
    border: "border-purple-500",
    text: "text-purple-800",
    label: "Cuti",
    dot: "bg-purple-500"
  }
}

interface MultiStaffGridProps {
  staff: any[]
  date: Date
  availabilityData: any[]
  onEntryClick?: (entry: any) => void
  onAddClick?: (staffId: string, time: string) => void
}

export function MultiStaffGrid({
  staff,
  date,
  availabilityData,
  onEntryClick,
  onAddClick
}: MultiStaffGridProps) {
  // Generate time slots from 08:00 to 20:00
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  // Get entries for specific staff and time
  const getEntryForStaffAndTime = (staffId: string, time: string) => {
    return availabilityData.find(entry => {
      if (entry.staff_id !== staffId) return false
      if (!isSameDay(new Date(entry.date), date)) return false

      const entryStart = entry.start_time.substring(0, 5) // HH:MM
      const entryEnd = entry.end_time.substring(0, 5)

      return time >= entryStart && time < entryEnd
    })
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Multi-Staff View - {format(date, 'dd MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid gap-px bg-gray-200 border-b-2 border-gray-300" style={{
              gridTemplateColumns: `120px repeat(${staff.length}, minmax(150px, 1fr))`
            }}>
              <div className="bg-gray-50 p-3 font-semibold sticky left-0 z-10">
                <Clock className="h-4 w-4 inline mr-2" />
                Waktu
              </div>
              {staff.map(s => (
                <div key={s.id} className="bg-gray-50 p-3 font-semibold text-center">
                  <div className="truncate">{s.display_name || s.name}</div>
                  <div className="text-xs text-gray-500 truncate">{s.role || 'Staff'}</div>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="grid gap-px bg-gray-200" style={{
              gridTemplateColumns: `120px repeat(${staff.length}, minmax(150px, 1fr))`
            }}>
              {timeSlots.map(time => (
                <>
                  {/* Time Label */}
                  <div key={`time-${time}`} className="bg-white p-3 font-medium text-sm sticky left-0 z-10 border-r border-gray-200">
                    {time}
                  </div>

                  {/* Staff Cells */}
                  {staff.map(s => {
                    const entry = getEntryForStaffAndTime(s.id, time)
                    const colors = entry ? AVAILABILITY_COLORS[entry.availability_type as keyof typeof AVAILABILITY_COLORS] : null

                    return (
                      <div
                        key={`${time}-${s.id}`}
                        className={cn(
                          "bg-white p-2 min-h-[60px] cursor-pointer hover:bg-gray-50 transition-colors relative group",
                          entry && colors?.bg
                        )}
                        onClick={() => entry ? onEntryClick?.(entry) : onAddClick?.(s.id, time)}
                      >
                        {entry ? (
                          <div className={cn("rounded p-1 text-xs", colors?.border, "border-l-4")}>
                            <div className="flex items-center gap-1 mb-1">
                              <div className={cn("w-2 h-2 rounded-full", colors?.dot)} />
                              <span className={cn("font-medium", colors?.text)}>
                                {colors?.label}
                              </span>
                            </div>
                            <div className="text-gray-600 text-[10px]">
                              {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                            </div>
                            {entry.notes && (
                              <div className="text-gray-500 text-[10px] truncate mt-1">
                                {entry.notes}
                              </div>
                            )}
                            {entry.capacity && entry.capacity > 1 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="h-3 w-3 text-gray-500" />
                                <span className="text-[10px] text-gray-600">
                                  {entry.current_bookings || 0}/{entry.capacity}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex flex-wrap gap-4 text-xs">
            {Object.entries(AVAILABILITY_COLORS).map(([key, colors]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", colors.dot)} />
                <span className="text-gray-700">{colors.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
