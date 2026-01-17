"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Image from "next/image"
import { Pencil, Loader2, CheckCircle, XCircle, Upload, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthdate: "",
    gender: "",
    profileImage: "",
  })
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const [isFirstEdit, setIsFirstEdit] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const router = useRouter()
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Gagal memuat data profil")
        const data = await response.json()

        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          birthdate: data.birthdate || "",
          gender: data.gender || "",
          profileImage: data.profileImage || data.image || data.picture || "",
        })

        // cek apakah profil ini pertama kali diisi (tidak ada foto dan nomor hp)
        if (!data.phone || !data.image) {
          setIsFirstEdit(true)
        }

        setError(null)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Gagal memuat data profil. Silakan refresh halaman.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      errors.name = "Nama harus diisi"
    } else if (formData.name.trim().length < 3) {
      errors.name = "Nama minimal 3 karakter"
    }

    if (formData.phone.trim() && !/^08\d{8,13}$/.test(formData.phone)) {
      errors.phone = "Format nomor HP tidak valid (08xxxxxxxxxx)"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: "" })
    if (success) setSuccess(false)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      setError("Mohon perbaiki kesalahan pada form")
      return
    }

    setSaveLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const payload: any = {
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate,
        gender: formData.gender,
      };
      
      // Only include image if it has a value
      if (formData.profileImage && formData.profileImage.trim() !== "") {
        payload.image = formData.profileImage;
      }
      
      // console.log("Saving profile with image:", formData.profileImage);
      // console.log("Full payload:", payload);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      // console.log("response: ", response)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Gagal menyimpan profil")
      }

      await response.json()
      setSuccess(true)

      setTimeout(() => router.push("/profil"), 1500)
    } catch (error) {
      // console.error("Error saving profile:", error)
      setError(error instanceof Error ? error.message : "Gagal menyimpan profil. Silakan coba lagi.")
    } finally {
      setSaveLoading(false)
    }
  }

  // Helper function to compress and resize image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.src = event.target?.result as string
        img.onload = () => {
          const MAX_SIZE = 512
          let { width, height } = img

          // compress
          if (width > MAX_SIZE || height > MAX_SIZE) {
            const scale = Math.min(MAX_SIZE / width, MAX_SIZE / height)
            width = Math.round(width * scale)
            height = Math.round(height * scale)
          }
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          //compress the data
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            },
            'image/jpeg',
            0.85 // Quality: 0.85 (85%)
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB")
      e.target.value = ""
      return
    }

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      setError("Format file harus JPEG atau PNG")
      e.target.value = ""
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadLoading(true)
    setError(null)

    const token = localStorage.getItem('token');

    try {
      // Compress and resize image to 512x512
      const compressedFile = await compressImage(file)

      // Check compressed file size
      if (compressedFile.size > 2 * 1024 * 1024) {
        setError("File terlalu besar setelah kompresi. Silakan coba gambar lain.")
        setPreviewImage(null)
        e.target.value = ""
        setUploadLoading(false)
        return
      }

      const uploadData = new FormData()
      uploadData.append("file", compressedFile)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const uploadUrl = `${apiUrl}/app/api/upload`;

      const res = await fetch(uploadUrl, {
        method: "POST", body: uploadData, headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      console.log("🔵 Frontend - Upload response status:", res.status);
      console.log("🔵 Frontend - Upload response ok:", res.ok);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Upload gagal")
      }

      const data = await res.json()
      const uploadedUrl = data.url || ""
      
      setFormData(prev => ({ ...prev, profileImage: uploadedUrl }))
      
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Gagal mengupload gambar. Silakan coba lagi.")
      setPreviewImage(null)
    } finally {
      setUploadLoading(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-[756px] bg-white p-4 md:p-8 rounded-xl shadow">
        <div className="flex flex-col justify-center items-center h-32 gap-3">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <div className="text-gray-500">Memuat data profil...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[756px] bg-white p-4 md:p-8 rounded-xl shadow-md">
      {/* 🔔 Peringatan jika nomor telepon belum diisi */}
      {!formData.phone && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-yellow-800">
            Nomor telepon belum diisi. Silakan lengkapi profil Anda.
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            ×
          </button>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">Profil berhasil disimpan! Mengalihkan...</p>
          </div>
        </div>
      )}

      {/* Upload success */}
      {uploadSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">Foto profil berhasil diupload!</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Bagian Foto */}
        <div className="flex flex-col items-center w-full md:w-[200px]">
          <div className="relative w-[150px] h-[123px] md:w-[200px] md:h-[164px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {uploadLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
            {previewImage ? (
              // Use regular img tag for data URL preview
              <img
                src={previewImage}
                alt="Foto Profil Preview"
                className="object-cover w-full h-full"
              />
            ) : formData.profileImage ? (
              // Use regular img tag for uploaded images to avoid Next.js Image issues
              <img
                src={
                  formData.profileImage.startsWith('http') 
                    ? formData.profileImage 
                    : formData.profileImage.startsWith('/')
                    ? `${process.env.NEXT_PUBLIC_API_URL}${formData.profileImage}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/${formData.profileImage}`
                }
                alt="Foto Profil"
                className="object-cover w-full h-full"
                onError={(e) => {
                  // Fallback to default if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/polar-bear.png"
                }}
                onLoad={() => {
                  // Image loaded successfully, safe to clear preview
                  if (previewImage) {
                    setTimeout(() => setPreviewImage(null), 100)
                  }
                }}
              />
            ) : (
              <Image
                src="/polar-bear.png"
                alt="Foto Profil"
                width={200}
                height={164}
                className="object-cover w-full h-full"
              />
            )}
          </div>

          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="upload"
            disabled={uploadLoading}
          />
          <label
            htmlFor="upload"
            className={`mt-3 flex justify-center items-center gap-2 w-[150px] md:w-[201px] h-[40px] rounded-lg font-medium text-sm md:text-base transition-colors duration-200 ${uploadLoading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[#E6FCF6] text-[#26A81D] hover:bg-green-200 cursor-pointer"
              }`}
          >
            {uploadLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Pilih Foto
              </>
            )}
          </label>

          {/* ⚠️ Jika foto profil kosong dan pertama kali edit */}
          {isFirstEdit && !formData.profileImage && (
            <p className="mt-3 text-xs text-red-600 text-center font-medium">
              Nomor telepon wajib diisi
            </p>
          )}

          <p className="mt-2 text-xs text-gray-500 text-center">
            Ukuran gambar maks. 2MB <br />
            Format: .JPEG, .PNG <br />
          </p>
        </div>

        {/* Bagian Form */}
        <div className="flex-1 pt-3">
          {/* Input Nama */}
          <div className="relative mb-4">
            <label htmlFor="name" className="text-sm text-gray-500 absolute top-2 left-3">
              Nama
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 pt-6 focus:outline-none text-sm md:text-base transition-colors duration-200 ${fieldErrors.name
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-green-600"
                }`}
              placeholder="Masukkan nama lengkap"
            />
            <Pencil size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
          </div>

          {/* Input Nomor HP */}
          <div className="relative mb-4">
            <label htmlFor="phone" className="text-sm text-gray-500 absolute top-2 left-3">
              Nomor HP
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 pt-6 focus:outline-none text-sm md:text-base transition-colors duration-200 ${fieldErrors.phone
                  ? "border-red-500 focus:border-red-600"
                  : "border-gray-300 focus:border-green-600"
                }`}
              placeholder="08xxxxxxxxxx"
            />
            <Pencil size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>
        </div>
      </div>

      {/* Tombol Simpan */}
      <button
        onClick={handleSave}
        disabled={saveLoading || uploadLoading}
        className={`mt-4 md:mt-6 w-full font-bold py-3 px-6 md:px-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm md:text-base transition-all duration-200 flex items-center justify-center gap-2 ${saveLoading || uploadLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#26A81D] text-white hover:bg-green-700"
          }`}
      >
        {saveLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          "Simpan"
        )}
      </button>
    </div>
  )
}