"use client"
import React, { useState, useEffect } from "react"
import InputBox from "@/components/InputBox"
import { User, Smartphone, Home, MapPin, ClipboardList } from "lucide-react"
import { useToast, Toast } from "@/components/Toast"

type Address = {
  id: string
  userId?: string
  recipientName: string
  phoneNumber: string
  label: string
  fullAddress: string
  note?: string
  isPrimary: boolean
}

interface AddAddressProps {
  id?: string
  isOpen: boolean
  onClose: () => void
  onSave: (address: Address) => void
}

const Checkbox = ({
  label,
  checked,
  onChange,
  children,
}: {
  label?: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
}) => (
  <label className="flex items-start gap-2 cursor-pointer text-xs sm:text-sm">
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 rounded border border-[#8F8F8F] bg-transparent focus:ring-green-500 text-green-600 mt-0.5"
      checked={checked}
      onChange={onChange}
    />
    <span className="flex-1 text-gray-700 font-normal leading-snug">
      {label}
      {children}
    </span>
  </label>
)

const AddAddress: React.FC<AddAddressProps> = ({ isOpen, onClose, onSave }) => {
  const [recipientName, setRecipientName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [labelAddress, setLabelAddress] = useState("")
  const [fullAddress, setFullAddress] = useState("")
  const [note, setNote] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [agree, setAgree] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setPhoneNumber(numericValue)
  }

  if (!isOpen) return null

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!recipientName || !phoneNumber || !fullAddress || !agree) {
      showToast("Mohon isi semua field yang wajib diisi dan setujui syarat & ketentuan.", "warning")
      return
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      recipientName,
      phoneNumber,
      label: labelAddress,
      fullAddress,
      note: note || undefined,
      isPrimary,
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newAddress),
      })

      const data = await response.json()

      if (response.ok) {
        onSave(newAddress)
        setRecipientName("")
        setPhoneNumber("")
        setLabelAddress("")
        setFullAddress("")
        setNote("")
        setIsPrimary(false)
        setAgree(false)
        onClose()
        showToast("Alamat berhasil disimpan!", "success")
      } else {
        showToast(data.message || "Gagal menyimpan alamat.", "error")
      }
    } catch (error) {
      console.error(error)
      showToast("Terjadi kesalahan saat menyimpan alamat.", "error")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm z-[10002] font-jakarta px-3 sm:px-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full sm:w-[650px] max-h-[90vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl p-4 sm:p-6 relative shadow-2xl z-[10001]">
        <div className="relative flex items-center border-b border-gray-200 pb-2 sm:pb-3 mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center w-full">
            Tambah Alamat
          </h2>
          <button
            className="absolute right-0 text-gray-500 hover:text-gray-700 text-lg sm:text-xl transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 sm:space-y-4 max-h-[calc(90vh-180px)] sm:max-h-[calc(85vh-180px)] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
          <p className="font-semibold text-gray-800 text-sm sm:text-base">Isi detail alamat</p>
          <InputBox
            label="Nama Penerima"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Masukkan nama penerima"
            icon={<User size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Nomor Telepon"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder="08xxxxxxxxxx"
            icon={<Smartphone size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Label Alamat"
            value={labelAddress}
            onChange={(e) => setLabelAddress(e.target.value)}
            placeholder="misalnya Rumah, Kantor"
            icon={<Home size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Alamat Lengkap"
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap"
            icon={<MapPin size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Catatan untuk Kurir (Opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="misalnya Warna rumah, landmark, instruksi khusus"
            icon={<ClipboardList size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />

          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <Checkbox
              label="Jadikan alamat utama"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            <Checkbox
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            >
              <span className="text-xs sm:text-sm">
                Saya menyetujui{" "}
                <a href="#" className="text-green-600 font-semibold hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a href="#" className="text-green-600 font-semibold hover:underline">
                  Kebijakan Privasi
                </a>{" "}
                untuk manajemen alamat di Panganku Fresh
              </span>
            </Checkbox>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base disabled:bg-gray-400 transition-colors"
            onClick={handleSave}
            disabled={!agree}
          >
            Simpan
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}

export default AddAddress