"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import type { Profile } from "../../types/profile"
import Image from "next/image"

export default function ProfilPage() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setUser(data)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!user) {
    return <div>No profile data available</div>
  }

  return (
    <div className="w-full md:w-[756.65px] rounded-[15px] bg-white mt-6 p-6 md:p-8" style={{ boxShadow: "6px 6px 54px 0 rgba(0, 0, 0, 0.05)" }}>
      {/* Header with Edit button */}
      <div className="flex justify-end mb-6">
        <Link href="/profil/editprofil">
          <button className="text-[#26A81D] font-semibold text-base hover:underline">
            Edit
          </button>
        </Link>
      </div>

      {/* Profile Image and Title */}
      <div className="flex flex-col items-start mb-2 relative">
        {/* Image container with larger negative margin */}
        <div className="mb-4 -mt-28">
          <Image
            src={user.image || "/polar-bear.png"}
            alt="Profile Image"
            width={92}
            height={92}
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <h1 className="text-[#26A81D] font-semibold text-2xl">Profil</h1>
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
        <div>
          <p className="text-[#9CA3AF] text-sm font-normal mb-2">Nama</p>
          <p className="text-[#1F2937] text-base font-medium">{user.name}</p>
        </div>

        <div>
          <p className="text-[#9CA3AF] text-sm font-normal mb-2">Nomor HP</p>
          <p className="text-[#1F2937] text-base font-medium">{user.phone}</p>
        </div>

        <div>
          <p className="text-[#9CA3AF] text-sm font-normal mb-2">Email</p>
          <p className="text-[#1F2937] text-base font-medium">{user.email}</p>
        </div>
      </div>
    </div>
  )
}