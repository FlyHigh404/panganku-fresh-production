"use client"
import AuthCheck from "@/components/AuthCheck"
import Footer from "@/components/Footer"
import NavProfil from "@/components/NavProfil"
import ProfilSide from "@/components/ProfilSide" 
import { ChevronLeft, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation" 
import { useState } from "react"

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <AuthCheck role="CUSTOMER">
      <div className="min-w-screen min-h-screen mx-auto font-jakarta bg-gray-100 flex flex-col">
        {/* NavProfil */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <NavProfil />
        </div>

        {/* Tombol kembali */}
        <div className="px-8 z-[1] pl-12 md:px-16 md:pl-20 mt-8 mb-2 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-3 text-green-600 hover:text-green-700 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center hover:bg-green-50 transition-all duration-200">
                <ChevronLeft size={20} className="text-green-500" />
              </div>
              <span className="text-lg font-medium text-green-600">Kembali</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-green-500 hover:text-green-700"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Overlay mobile*/}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0  bg-opacity-30 z-[100] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        

        {/* Mobile Sidebar */}
        <div 
          className={`
            fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-[101]
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            md:hidden
          `}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 h-full overflow-y-auto">
            <ProfilSide 
              onItemClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>

        {/* Konten utama */}
        <div className={`
          mt-6 mb-24 px-8 pl-12 md:px-16 md:pl-20 pb-20 transition-all duration-300 relative z-[1]
          ${isMobileMenuOpen ? 'blur-sm brightness-90' : 'blur-0 brightness-100'}
        `}>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            {/* Sidebar Desktop */}
            <div className="hidden md:block">
              <ProfilSide />
            </div>

            {/* Halaman utama */}
            <div className="flex-1 w-full">
              {children}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </AuthCheck>
  )
}