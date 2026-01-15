"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Phone, MapPin, Truck, Clock, CheckCircle, X, AlertCircle, XCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import AdminLayout from "../../AdminLayout"

// TypeScript interfaces
interface OrderItem {
  productId: string
  quantity: number
  unitPrice: string | number
  product?: {
    name: string
    imageUrl?: string[]
  }
}

interface User {
  name?: string
  phone?: string
  image?: string
  Address?: Array<{
    fullAddress: string
  }>
}

interface Order {
  id: string
  status: string
  totalAmount: string | number
  paymentMethod: string
  createdAt: string
  orderItems?: OrderItem[]
  user?: User
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'default' | 'warning' | 'danger' | 'success'
}

interface ModalConfig {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  type: 'default' | 'warning' | 'danger' | 'success'
  onConfirm: () => void
}

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: 'success' | 'error'
}

// Notification Modal Component (Success/Error)
const NotificationModal = ({
  isOpen,
  onClose,
  title,
  message,
  type
}: NotificationModalProps) => {
  if (!isOpen) return null

  const typeStyles = {
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      buttonBg: "bg-green-600 hover:bg-green-700",
    },
    error: {
      icon: X,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
    }
  }

  const style = typeStyles[type]
  const IconComponent = style.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center`}>
            <IconComponent size={32} className={style.iconColor} />
          </div>
        </div>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`w-full px-4 py-3 ${style.buttonBg} text-white font-semibold rounded-xl transition-colors shadow-lg`}
        >
          OK
        </button>
      </div>
    </div>
  )
}

// Modern Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  type = "default"
}: ConfirmationModalProps) => {
  if (!isOpen) return null

  const typeStyles = {
    default: {
      icon: AlertCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmBg: "bg-blue-600 hover:bg-blue-700",
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
      icon: AlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmBg: "bg-red-600 hover:bg-red-700",
    },
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      confirmBg: "bg-green-600 hover:bg-green-700",
    }
  }

  const style = typeStyles[type]
  const IconComponent = style.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-16 h-16 ${style.iconBg} rounded-full flex items-center justify-center`}>
            <IconComponent size={32} className={style.iconColor} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 px-4 py-3 ${style.confirmBg} text-white font-semibold rounded-xl transition-colors shadow-lg`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

const PesananDetailPage = () => {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Ubah updating menjadi object untuk melacak status masing-masing button
  const [updating, setUpdating] = useState<{
    tugaskanKurir: boolean
    selesaikanPesanan: boolean
    batalkanPesanan: boolean
  }>({
    tugaskanKurir: false,
    selesaikanPesanan: false,
    batalkanPesanan: false
  })

  // Modal state
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya, Lanjutkan",
    cancelText: "Batal",
    type: "default",
    onConfirm: () => { }
  })

  // Notification state
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error'
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  })

  const statusConfig: Record<string, { label: string; color: string; icon?: any }> = {
    PROCESSING: {
      label: "SEDANG PROSES",
      color: "bg-[#FFDD62]",
      icon: Clock
    },
    SHIPPED: {
      label: "DIKIRIM KURIR",
      color: "bg-[#FFAA62]",
      icon: Truck
    },
    COMPLETED: {
      label: "PESANAN SELESAI",
      color: "bg-[#26A81D]",
      icon: CheckCircle
    },
    CANCELED: {
      label: "DIBATALKAN",
      color: "bg-red-400",
      icon: XCircle
    },
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
    return numAmount.toLocaleString("id-ID", { style: "currency", currency: "IDR" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " | " + date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    const fetchOrderDetail = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/order/${params.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Gagal fetch data")
        const data = await res.json()
        setOrder(data)
      } catch (error) {
        console.error("Gagal mengambil detail pesanan:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrderDetail()
    }
  }, [params.id])

  const updateOrderStatus = async (newStatus: string, actionType: 'tugaskanKurir' | 'selesaikanPesanan' | 'batalkanPesanan') => {
    const token = localStorage.getItem('token');
    try {
      // Set loading state untuk button yang spesifik
      setUpdating(prev => ({ ...prev, [actionType]: true }))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/order/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Gagal mengupdate status pesanan')
      }

      const updatedOrder = await res.json()
      setOrder(updatedOrder)

      // Show success notification
      setNotification({
        isOpen: true,
        title: "Berhasil!",
        message: `Pesanan berhasil diupdate ke status ${statusConfig[newStatus].label}`,
        type: "success"
      })
    } catch (error) {
      console.error('Error updating order status:', error)

      // Show error notification
      setNotification({
        isOpen: true,
        title: "Gagal!",
        message: "Gagal mengupdate status pesanan. Silakan coba lagi.",
        type: "error"
      })
    } finally {
      // Reset loading state untuk button yang spesifik
      setUpdating(prev => ({ ...prev, [actionType]: false }))
    }
  }

  const openModal = (config: Omit<ModalConfig, 'isOpen'>) => {
    setModalConfig({
      ...config,
      isOpen: true
    })
  }

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }))
  }

  const handleAssignCourier = () => {
    openModal({
      title: "Tugaskan Kurir",
      message: "Apakah Anda yakin ingin menugaskan kurir untuk pesanan ini? Pesanan akan diubah ke status 'Dikirim Kurir'.",
      confirmText: "Ya, Tugaskan Kurir",
      cancelText: "Batal",
      type: "default",
      onConfirm: () => updateOrderStatus('SHIPPED', 'tugaskanKurir')
    })
  }

  const handleCompleteOrder = () => {
    openModal({
      title: "Selesaikan Pesanan",
      message: "Apakah Anda yakin ingin menyelesaikan pesanan ini? Pesanan akan diubah ke status 'Pesanan Selesai'.",
      confirmText: "Ya, Selesaikan",
      cancelText: "Batal",
      type: "success",
      onConfirm: () => updateOrderStatus('COMPLETED', 'selesaikanPesanan')
    })
  }

  const handleCancelOrder = () => {
    openModal({
      title: "Batalkan Pesanan",
      message: "Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan dan pesanan akan diubah ke status 'Dibatalkan'.",
      confirmText: "Ya, Batalkan",
      cancelText: "Tidak",
      type: "danger",
      onConfirm: () => updateOrderStatus('CANCELED', 'batalkanPesanan')
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <main className="flex-1 bg-gray-50 pt-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-500">Memuat data...</p>
            </div>
          </div>
        </main>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <main className="flex-1 bg-gray-50 pt-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-500">Pesanan tidak ditemukan</p>
            </div>
          </div>
        </main>
      </AdminLayout>
    )
  }

  const shippingCost = 20000
  const discount = 0
  const currentStatus = order.status
  const statusInfo = statusConfig[currentStatus] || { label: currentStatus, color: "bg-gray-300" }
  const StatusIcon = statusInfo.icon

  const buttonStates = {
    tugaskanKurir: {
      enabled: currentStatus === "PROCESSING" && !updating.tugaskanKurir,
      loading: updating.tugaskanKurir,
      style: currentStatus === "PROCESSING"
        ? "bg-indigo-50 border-2 border-indigo-500 hover:bg-indigo-100 text-indigo-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    },
    selesaikanPesanan: {
      enabled: currentStatus === "SHIPPED" && !updating.selesaikanPesanan,
      loading: updating.selesaikanPesanan,
      style: currentStatus === "SHIPPED"
        ? "bg-green-50 border-2 border-green-500 hover:bg-green-100 text-green-600"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    },
    batalkanPesanan: {
      enabled: (currentStatus === "PROCESSING" || currentStatus === "SHIPPED") && !updating.batalkanPesanan,
      loading: updating.batalkanPesanan,
      style: (currentStatus === "PROCESSING" || currentStatus === "SHIPPED")
        ? "bg-red-50 border-2 border-red-500 hover:bg-red-100 text-red-500"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  }

  return (
    <AdminLayout>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <main className="flex-1 bg-gray-50 pt-4 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header dengan tombol Kembali */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push("/admin/pesanan")}
              className="w-10 h-10 border-2 border-green-500 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors"
            >
              <ArrowLeft size={18} className="text-green-500" />
            </button>
            <h1 className="text-lg font-medium text-green-600">Kembali</h1>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Detail Pesanan */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pesanan ({order.orderItems?.length || 0})
              </h2>
              <p className="text-base font-medium text-gray-700 mb-6">No Pesanan : {order.id}</p>

              {/* Order Items */}
              <div className="space-y-4">
                {order.orderItems?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product?.imageUrl?.[0] ? (
                        <img
                          src={item.product.imageUrl[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <div className="w-8 h-8 bg-yellow-400 rounded"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm mb-1 leading-tight">
                        {item.product?.name || "Produk"}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">ID : {item.productId}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="text-xs text-gray-500">Qty : x{item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Pembayaran */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Detail pembayaran</h2>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Sub total</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(Number(order.totalAmount) - shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Potongan Diskon</span>
                  <span className="font-medium text-green-600">{formatCurrency(discount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Ongkos kirim</span>
                  <span className="font-medium text-gray-900">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Metode pembayaran</span>
                  <span className="font-medium text-gray-900">{order.paymentMethod}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total pembayaran</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Status dan Customer Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Box Status dan Button Tugaskan Kurir */}
              <div className="bg-white rounded-lg shadow-sm p-6 lg:pt-8 space-y-4">
                {/* Box Status */}
                <div className={`${statusInfo.color} text-center py-6 px-4 rounded-2xl relative`}>
                  <div className="flex items-center justify-center">
                    <span className="font-bold text-xl text-white uppercase">
                      {statusInfo.label}
                    </span>
                  </div>
                  {StatusIcon && (
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                      <div className="w-14 h-14 bg-transparent rounded-full flex items-center justify-center">
                        <StatusIcon size={28} className="text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAssignCourier}
                    disabled={!buttonStates.tugaskanKurir.enabled}
                    className={`w-full font-bold py-4 px-4 rounded-3xl transition-colors ${buttonStates.tugaskanKurir.style}`}
                  >
                    {buttonStates.tugaskanKurir.loading ? 'Menugaskan Kurir...' : 'Tugaskan kurir'}
                  </button>

                  <button
                    onClick={handleCompleteOrder}
                    disabled={!buttonStates.selesaikanPesanan.enabled}
                    className={`w-full font-bold py-4 px-4 rounded-3xl transition-colors ${buttonStates.selesaikanPesanan.style}`}
                  >
                    {buttonStates.selesaikanPesanan.loading ? 'Menyelesaikan...' : 'Selesaikan pesanan'}
                  </button>

                  <button
                    onClick={handleCancelOrder}
                    disabled={!buttonStates.batalkanPesanan.enabled}
                    className={`w-full font-bold py-4 px-4 rounded-3xl transition-colors ${buttonStates.batalkanPesanan.style}`}
                  >
                    {buttonStates.batalkanPesanan.loading ? 'Membatalkan...' : 'Batalkan pesanan'}
                  </button>
                </div>
              </div>

              {/* Detail Pelanggan */}
              <div className="bg-white rounded-lg shadow-sm p-8 relative">
                <div className="absolute top-6 right-6 w-24 h-24 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-4 border-white shadow-md">
                  {order.user?.image ? (
                    <img
                      src={order.user.image}
                      alt={order.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-2xl">
                      {order.user?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="mb-8 pr-28">
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">
                    {order.user?.name || "Tanpa Nama"}
                  </h2>
                  <p className="text-base text-gray-500">Pelanggan</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={20} className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm text-gray-500 mb-1">Telepone</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {order.user?.phone || "Tidak ada nomor"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={20} className="text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm text-gray-500 mb-1">Alamat</p>
                      <p className="font-medium text-gray-900 text-base leading-relaxed">
                        {order.user?.Address?.[0]?.fullAddress || "Alamat tidak tersedia"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  )
}

export default PesananDetailPage