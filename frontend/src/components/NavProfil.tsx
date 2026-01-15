import React from "react"
import Link from "next/link"

const NavProfil = () => {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 top-0">
      <div className="flex items-center h-16 md:h-24 px-4 md:px-8 md:pl-16">
        <Link href="/" className="flex items-center gap-2 md:gap-4">
          <img src="/Logo.png" alt="Panganku Fresh Logo" className="w-24 h-8 md:w-48 md:h-14 object-contain" />
        </Link>

        <div className="h-8 md:h-12 w-px bg-gray-300 mx-4 md:mx-8"></div>

        <div className="flex items-center">
          <h1 className="text-green-600 font-medium text-base sm:text-xl">Profil Pengguna</h1>
        </div>
      </div>
    </nav>
  )
}

export default NavProfil