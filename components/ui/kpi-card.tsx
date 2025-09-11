import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function KpiCard({ title, value, change, changeType = "neutral", icon: Icon }: KpiCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />
      case "negative":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-pastel-purple/20">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className={`p-1 rounded-md ${
              changeType === "positive"
                ? "bg-green-100 text-green-700"
                : changeType === "negative"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}>
              {getTrendIcon()}
            </div>
            <p className={`text-xs font-medium ${
              changeType === "positive"
                ? "text-green-700"
                : changeType === "negative"
                  ? "text-red-700"
                  : "text-gray-600"
            }`}>
              {change}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}