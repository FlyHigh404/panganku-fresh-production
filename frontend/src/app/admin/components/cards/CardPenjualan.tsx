import { TrendingUp, ChartLine } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardBadge } from "@/app/admin/components/cards/Cards"

interface PenjualanCardProps {
  totalOrders?: number
  changePercentage?: string
  changeType?: "positive" | "negative"
}

export default function PenjualanCard({
  totalOrders = 856,
  changePercentage = "+8%",
  changeType = "positive",
}: PenjualanCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
       <CardBadge className="bg-green-100">
          <ChartLine className="w-8 h-8 text-green-600" />
        </CardBadge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()}</div>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className={`w-3 h-3 ${changeType === "positive" ? "text-green-500" : "text-red-500"}`} />
          <span className={`text-xs font-medium ${changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
            {changePercentage}
          </span>
          <span className="text-xs text-gray-500">dari bulan lalu</span>
        </div>
      </CardContent>
    </Card>
  )
}
