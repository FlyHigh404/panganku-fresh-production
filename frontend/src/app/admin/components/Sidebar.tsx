"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, List, FileText, Users, BarChart2, Settings, LogOut, X, ShoppingBag, User, ArrowLeftFromLine } from "lucide-react"
// import { signOut } from "next-auth/react"
import { useAuth } from "@/context/AuthContext"

// Menu items array dengan icon yang disesuaikan
const menuItems = [
  { name: "Dashboard", icon: Home, path: "/admin/dashboard" },
  { name: "Managemen Produk", icon: ShoppingBag, path: "/admin/produk" },
  { name: "Managemen Kategori", icon: List, path: "/admin/kategori" },
  { name: "Managemen Pesanan", icon: FileText, path: "/admin/pesanan" },
  { name: "Managemen Pengguna", icon: User, path: "/admin/pengguna" },
  { name: "Managemen Notifikasi", icon: BarChart2, path: "/admin/notifikasi" },
  { name: "Halaman Customer", icon: ArrowLeftFromLine, path: "/" },
  { name: "Pengaturan", icon: Settings, path: "/admin/pengaturan" },
]

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  style?: React.CSSProperties;
}

export default function Sidebar({ isOpen = false, onClose, onToggle, style }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth();
  const handleSignOut = () => {
    logout();
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex min-h-screen w-64 bg-white shadow-md flex-col z-50 relative" style={style}>
        {/* Logo & Judul */}
        <div className="flex items-center gap-3 p-6">
          <div className="flex items-center">
            <img
              src="/LogoAdmin.png"
              alt="Panganku Fresh Admin Logo"
              className="w-48 h-14 object-contain"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex flex-col p-4 gap-2 flex-1 relative">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path)
            const Icon = item.icon

            return (
              <div key={item.name} className="relative">
                {isActive && (
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-green-600 rounded-r-full" />
                )}
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${isActive
                    ? "bg-green-100 text-green-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-green-700" : "text-gray-600"}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </div>
            )
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-red-50 text-red-600 font-medium hover:bg-red-100 mt-auto"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={style}>
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-4">
          <img
            src="/LogoAdmin.png"
            alt="Panganku Fresh Admin Logo"
            className="h-10 object-contain"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col p-4 gap-2 flex-1 relative">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path)
            const Icon = item.icon

            return (
              <div key={item.name} className="relative">
                {isActive && (
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-green-600 rounded-r-full" />
                )}
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${isActive
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-green-700" : "text-gray-600"}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </div>
            )
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all bg-red-50 text-red-600 font-medium hover:bg-red-100 mt-8"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </>
  )
}