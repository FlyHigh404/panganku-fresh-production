import Link from "next/link"

export default function CheckoutNavbar() {
  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 top-0">
      <div className="max-w-6xl mx-auto flex items-center px-4 sm:px-8 h-20 sm:h-24">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 flex-shrink-0">
          <img 
            src="/Logo.png" 
            alt="Panganku Fresh Logo" 
            className="w-28 sm:w-48 h-10 sm:h-14 object-contain" 
          />
        </Link>
        
        <div className="block h-8 sm:h-10 w-px bg-gray-300 mx-3 sm:mx-4"></div>

        {/* Judul Checkout */}
        <div className="flex-1 justify-start md:justify-center ml-2 sm:ml-0">
          <h1 className="text-green-600 font-medium text-base sm:text-xl">
            Checkout
          </h1>
        </div>
      </div>
    </nav>
  )
}
