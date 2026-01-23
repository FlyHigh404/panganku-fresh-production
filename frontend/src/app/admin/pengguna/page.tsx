"use client"
import { useState, useEffect } from "react"
import AdminLayout from "../AdminLayout"
import { Filter, ChevronDown } from "lucide-react"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import { useRouter } from "next/navigation"

interface Address {
  id: string
  userId: string
  recipientName: string
  phoneNumber: string
  label: string
  fullAddress: string
  note: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  userId: string
  totalAmount: string
  status: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

interface Customer {
  id: string
  name: string
  email: string
  emailVerified: string | null
  image: string | null
  phone: string | null
  address: string | null
  role: string
  password: string
  createdAt: string
  updatedAt: string
  orders: Order[]
  Address: Address[]
}

const Pengguna = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch customers data from API
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/customers`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        const data = await response.json()
        setCustomers(data)
      } catch (error) {
        console.error('Error fetching customers:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load customers data.',
          icon: 'error',
          customClass: {
            popup: 'rounded-xl',
            confirmButton: 'rounded-lg px-4 py-2',
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.Address.some((addr) =>
        addr.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )

    return matchesSearch
  })

  const handlePreviewCustomer = (customer: { id: string }) => {
    router.push(`/admin/pengguna/detail/?id=${customer.id}`)
  }

  // Helper function to get primary address or first address
  const getCustomerAddress = (customer: Customer): string => {
    if (!customer.Address || customer.Address.length === 0) {
      return customer.address || 'Alamat tidak tersedia'
    }
    const primaryAddress = customer.Address.find((addr) => addr.isPrimary)
    const address = primaryAddress || customer.Address[0]
    return address.fullAddress || 'Alamat tidak tersedia'
  }

  // Helper function to get phone number
  const getCustomerPhone = (customer: Customer): string => {
    if (customer.phone) return customer.phone
    if (customer.Address && customer.Address.length > 0) {
      const primaryAddress = customer.Address.find((addr) => addr.isPrimary)
      return primaryAddress?.phoneNumber || customer.Address[0]?.phoneNumber || '-'
    }
    return '-'
  }

  if (loading) {
    return (
      <AdminLayout>
        <main className="flex-1 bg-gray-50 pt-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading customers...</p>
            </div>
          </div>
        </main>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <main className="flex-1 bg-gray-50 pt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:pt-6 sm:pb-0 bg-white">
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tabel customers</h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Ini adalah daftar data customers</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="block lg:hidden space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <img
                          src={customer.image || "/placeholder.svg"}
                          alt={customer.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{customer.name}</h3>
                          <p className="text-gray-600 text-xs">{getCustomerPhone(customer)}</p>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs line-clamp-2">{getCustomerAddress(customer)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => handlePreviewCustomer(customer)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="View"
                      >
                        <img src="/receipt-item.png" alt="View" className="" width="30" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">Tidak ada customer ditemukan</p>
                  <p className="text-sm mt-1">Coba ubah kata kunci pencarian Anda</p>
                </div>
              )}
            </div>

            <div className="hidden lg:block overflow-x-auto rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      PELANGGAN
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      ALAMAT
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      NO TELPON
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      TINDAKAN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.image || "/placeholder.svg"}
                            alt={customer.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-gray-900 text-sm font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 max-w-xs">
                        <span className="text-gray-600 text-sm line-clamp-2">{getCustomerAddress(customer)}</span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-gray-900 text-sm font-medium">{getCustomerPhone(customer)}</span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handlePreviewCustomer(customer)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 cursor-pointer"
                            title="View"
                          >
                            <img src="/receipt-item.png" alt="View" className="" width="30" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 px-6 text-center bg-white">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">Tidak ada customer ditemukan</p>
                          <p className="text-sm mt-1">Coba ubah kata kunci pencarian Anda</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  )
}

export default Pengguna