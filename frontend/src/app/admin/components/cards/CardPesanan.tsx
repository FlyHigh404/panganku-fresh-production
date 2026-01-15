import { Package, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle,CardBadge } from "@/app/admin/components/cards/Cards"

interface PesananCardProps {
  totalProducts?: number
  changePercentage?: string
  changeType?: "positive" | "negative"
}

export default function PesananCard({
  totalProducts = 1234,
  changePercentage = "+12%",
  changeType = "positive",
}: PesananCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
        <CardBadge className="bg-yellow-100">
          <Package className="w-8 h-8 text-yellow-600" />
        </CardBadge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{totalProducts.toLocaleString()}</div>
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
