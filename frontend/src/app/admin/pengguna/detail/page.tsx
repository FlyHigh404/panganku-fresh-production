"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronDown, Filter, Truck, Package, Calendar, CreditCard } from "lucide-react"
import AdminLayout from "../../AdminLayout"

interface Product {
  id: string
  name: string
  description: string
  price: string
  stock: number
  imageUrl: string[]
  categoryId: string
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: string
  product: Product
}

interface Order {
  id: string
  userId: string
  totalAmount: string
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

interface CustomerDetail {
  id: string
  name: string
  email: string
  image: string | null
  phone: string | null
  address: string
  role: string
  createdAt: string
  updatedAt: string
  orders: Order[]
}

const PenggunaDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerDetail = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/customers/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customer detail')
        }
        const data = await response.json()
        setCustomer(data)
      } catch (error) {
        console.error('Error fetching customer detail:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCustomerDetail()
    }
  }, [params.id])

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
      COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "Pesanan selesai" },
      PROCESSING: { bg: "bg-blue-100", text: "text-blue-700", label: "Sedang diproses" },
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu pembayaran" },
      CANCELED: { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" },
    }
    const statusInfo = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status }
    return (
      <div className={`${statusInfo.bg} px-3 py-1 rounded-full`}>
        <span className={`text-xs font-medium ${statusInfo.text}`}>{statusInfo.label}</span>
      </div>
    )
  }

  const getStatusMessage = (status: string) => {
    const messageMap: { [key: string]: string } = {
      COMPLETED: "Pesanan telah tiba dan diterima customer",
      PROCESSING: "Pesanan sedang dalam proses pengiriman",
      PENDING: "Menunggu konfirmasi pembayaran",
      CANCELED: "Pesanan telah dibatalkan",
    }
    return messageMap[status] || "Status tidak diketahui"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}-${month}-${year} | ${hours}:${minutes}`
  }

  const formatCurrency = (amount: string) => {
    const num = parseInt(amount)
    return `Rp${num.toLocaleString('id-ID')}`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading customer data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Customer not found</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-green-500 hover:text-green-700"
            >
              Go back
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-green-500 hover:text-green-700 transition-colors"
          >
            <div className="w-7 md:w-8 h-7 md:h-8 rounded-full border-2 border-green-400 flex items-center justify-center mr-2 md:mr-3">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-base md:text-lg font-medium text-green-500">Kembali</span>
          </button>
        </div>

        {/* Main Container */}
        <div className="bg-white mx-3 md:mx-6 rounded-t-lg">
          {/* User Info Section */}
          <div className="px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-2">Riwayat pesanan</h2>
                <div className="flex items-center space-x-3">
                  {customer.image ? (
                    <img
                      src={customer.image}
                      alt={customer.name}
                      className="w-12 md:w-10 h-12 md:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 md:w-10 h-12 md:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700">
                        {getInitials(customer.name)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-base md:text-lg font-medium text-gray-900">{customer.name}</span>
                    {customer.phone && (
                      <p className="text-xs md:text-sm text-gray-500">{customer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            {customer.orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg font-medium">Tidak ada riwayat pesanan</p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {customer.orders.map((order) => (
                  <div key={order.id} className="rounded-lg overflow-hidden border border-gray-200 md:border-b md:border-x-0 md:border-t-0 md:rounded-none pb-4 md:pb-6">
                    {/* Order Header */}
                    <div className="px-3 md:px-0 py-3 md:py-4 flex justify-between items-center bg-gray-50 md:bg-transparent">
                      <div>
                        <span className="text-xs md:text-sm text-gray-600">No Pesanan : </span>
                        <span className="text-xs md:text-sm font-semibold text-blue-600">#{order.id.slice(0, 8)}</span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Order Items */}
                    <div className="px-3 md:px-0 space-y-3 md:space-y-4 mt-3 md:mt-0">
                      {order.orderItems.map((item, index) => (
                        <div key={item.id} className={`flex items-center gap-3 md:gap-4 py-2 ${index < order.orderItems.length - 1 ? 'border-b border-gray-100 md:border-b-0' : ''}`}>
                          <div className="w-14 md:w-12 h-14 md:h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {item.product.imageUrl && item.product.imageUrl.length > 0 ? (
                              <img
                                src={item.product.imageUrl[0]}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-yellow-100 flex items-center justify-center">
                                <span className="text-xs font-semibold text-gray-700">
                                  {getInitials(item.product.name)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-5">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Qty: x{item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="px-3 md:px-0 py-3 md:py-4 mt-4 md:mt-6 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none">
                      <div className="flex items-center gap-2 mb-3 p-2 md:p-0 bg-green-50 md:bg-transparent rounded md:rounded-none">
                        <Truck className="text-green-500" />
                        <span className="text-xs text-green-500">
                          {getStatusMessage(order.status)}
                        </span>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 md:gap-0">
                        <div>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Metode Pembayaran: {order.paymentMethod}
                          </p>
                        </div>
                        <div className="text-left md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Total pesanan :</p>
                          <p className="text-lg md:text-xl font-bold text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default PenggunaDetailPage