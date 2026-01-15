"use client"
import { useState } from "react"
import type React from "react"
import { Eye, EyeOff } from "lucide-react"

export default function UbahPasswordPage() {
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const toggleShowPassword = (field: "current" | "new" | "confirm") => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.")
      return
    }
    
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(result.message || "Password berhasil diubah.")
      } else {
        setError(result.error || "Terjadi kesalahan saat mengubah password.")
      }
    } catch (error) {
      setError("Terjadi kesalahan dalam koneksi API.")
      console.error("Error changing password:", error)
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white p-6 font-jakarta rounded-[15px] shadow-md">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Ubah Password anda</h1>
        <p className="text-gray-600 text-sm">Masukkan Password baru yang nanti akan anda gunakan untuk Log In</p>
      </div>

      {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg text-sm">{error}</div>}
      {success && <div className="text-green-600 mb-4 p-3 bg-green-50 rounded-lg text-sm">{success}</div>}

      <div className="space-y-4">
        {/* Password Saat Ini */}
        <div className="relative">
          <input
            type={showPassword.current ? "text" : "password"}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl p-3 pb-3 pt-5 focus:border-gray-300 focus:outline-[#26A81D] text-sm bg-gray-50 placeholder-transparent peer"
            placeholder="Password saat ini"
          />
          <label 
            htmlFor="currentPassword"
            className="absolute left-3 top-1.5 text-xs text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-gray-500"
          >
            Password saat ini
          </label>
          <button
            type="button"
            onClick={() => toggleShowPassword("current")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Password Baru */}
        <div className="relative">
          <input
            type={showPassword.new ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl p-3 pb-3 pt-5 focus:border-gray-300 focus:outline-[#26A81D] text-sm bg-gray-50 placeholder-transparent peer"
            placeholder="Password baru"
          />
          <label 
            htmlFor="newPassword"
            className="absolute left-3 top-1.5 text-xs text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-gray-500"
          >
            Password baru
          </label>
          <button
            type="button"
            onClick={() => toggleShowPassword("new")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Konfirmasi Password */}
        <div className="relative">
          <input
            type={showPassword.confirm ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border-2 border-gray-200 rounded-xl p-3 pb-3 pt-5 focus:border-gray-300 focus:outline-[#26A81D] text-sm bg-gray-50 placeholder-transparent peer"
            placeholder="Konfirmasi password"
          />
          <label 
            htmlFor="confirmPassword"
            className="absolute left-3 top-1.5 text-xs text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-gray-500"
          >
            Konfirmasi password
          </label>
          <button
            type="button"
            onClick={() => toggleShowPassword("confirm")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Tombol Konfirmasi */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-green-700 transition-colors duration-200 text-sm"
        >
          Konfirmasi
        </button>
      </div>
    </div>
  )
}