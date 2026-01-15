"use client"
import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alamat } from "@/types/alamat"

interface DaftarAlamatProps {
  open: boolean
  setOpen: (val: boolean) => void
  onSelectAlamat?: (alamat: Alamat) => void
  showJadikanUtama?: boolean // Tambahkan prop ini
}

const normalizeAlamat = (item: any): Alamat => ({
  id: String(item.id),
  label: item.label || item.judul || "Alamat",
  nama: item.nama || item.recipientName || "",
  telp: item.telp || item.phoneNumber || "",
  alamat: item.alamat || item.fullAddress || "",
  catatan: item.catatan || item.note || "",
  utama: item.utama || item.isPrimary || false,
  recipientName: item.recipientName || item.nama || "",
  phoneNumber: item.phoneNumber || item.telp || "",
  fullAddress: item.fullAddress || item.alamat || "",
  isPrimary: item.isPrimary || item.utama || false,
})

export default function DaftarAlamat({
  open,
  setOpen,
  onSelectAlamat,
  showJadikanUtama = false, // Default false
}: DaftarAlamatProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | number | null>(null)
  const [alamatList, setAlamatList] = useState<Alamat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data dari API
  useEffect(() => {
    if (open) {
      fetchAlamat()
    }
  }, [open])

  const fetchAlamat = async () => {
    const token = localStorage.getItem('token');
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error("Gagal mengambil data alamat")
      }
      const data = await response.json()

      // Transform API response menggunakan helper function
      const transformedData: Alamat[] = data.map((item: any) => normalizeAlamat(item))

      setAlamatList(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      console.error("Error fetching alamat:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const handleDelete = async (id: string | number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Gagal menghapus alamat")
      }

      setAlamatList(alamatList.filter((a) => a.id !== id))
    } catch (err) {
      console.error("Error deleting alamat:", err)
      alert("Gagal menghapus alamat")
    }
  }

  const handleSaveEdit = async () => {
    // Redirect ke halaman edit alamat
    router.push("/profil/alamat")
  }

  const setSebagaiUtama = async (id: string | number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address/${id}/set-primary`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Gagal mengatur alamat utama")
      }

      setAlamatList((prev) =>
        prev.map((a) => ({
          ...a,
          utama: a.id === id,
        }))
      )
    } catch (err) {
      console.error("Error setting primary address:", err)
      alert("Gagal mengatur alamat utama")
    }
  }

  return (
    <>
      {/* Modal Daftar Alamat */}
      <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-[95%] sm:w-[650px] max-h-[85vh] overflow-y-auto p-4 sm:p-6 relative">
          {/* Tombol close */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg sm:text-xl"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          <h2 className="text-base sm:text-lg font-bold font-jakarta text-black mb-4 text-center">
            Daftar Alamat
          </h2>

          <hr className="border-gray-200 my-2 sm:my-3" />

          {/* Tambah Alamat */}
          <div className="w-full flex justify-center mb-4">
            <button
              className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl w-full bg-green-100 text-green-600 text-sm sm:text-base font-semibold hover:bg-green-200"
              onClick={() => router.push("/profil/alamat")}
            >
              + Tambah Alamat
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Memuat alamat...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                className="mt-2 text-green-600 hover:underline"
                onClick={fetchAlamat}
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* List Alamat */}
          {!loading && !error && (
            <div className="space-y-3 sm:space-y-4">
              {alamatList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada alamat tersimpan</p>
                </div>
              ) : (
                alamatList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition border ${selected === item.id
                      ? "border-green-500 shadow-[0_0_10px_rgba(38,168,29,0.2)]"
                      : "border-gray-200"
                      }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        <p className="font-medium text-sm sm:text-[15px] font-jakarta text-[#8F8F8F]">
                          {item.label}
                        </p>
                        {(item.utama || item.isPrimary) && (
                          <span className="bg-green-100 text-green-600 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full">
                            Utama
                          </span>
                        )}
                      </div>
                      {/* Tambahkan kondisi showJadikanUtama */}
                      {!(item.utama || item.isPrimary) && showJadikanUtama && (
                        <button
                          className="text-[11px] sm:text-xs text-green-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSebagaiUtama(item.id)
                          }}
                        >
                          Jadikan Utama
                        </button>
                      )}
                    </div>

                    <div className="pl-6 sm:pl-8 mt-1 sm:mt-2">
                      <p className="font-medium text-xs sm:text-sm font-jakarta text-black">
                        {item.recipientName || item.nama}
                        <span className="after:content-['|'] after:mx-1 sm:after:mx-2 text-[#8F8F8F]"></span>
                        <span className="font-medium text-[12px] sm:text-[14px] font-jakarta text-[#8F8F8F]">
                          {item.phoneNumber || item.telp}
                        </span>
                      </p>
                      <p className="font-normal text-[11px] sm:text-[13px] font-jakarta text-[#8F8F8F]">
                        {item.fullAddress || item.alamat}
                      </p>
                      {(item.catatan) && (
                        <p className="font-normal text-[11px] sm:text-[12px] font-jakarta text-gray-400 mt-1">
                          Catatan: {item.catatan}
                        </p>
                      )}

                      <div className="flex gap-2 mt-1 sm:mt-2 text-[11px] sm:text-sm">
                        <button
                          className="text-green-600 hover:text-green-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push("/profil/alamat")
                          }}
                        >
                          Ubah
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                          className="text-gray-500 hover:text-red-600 font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Konfirmasi Pilih Alamat */}
          <div className="mt-5 flex justify-center">
            <button
              className="w-full bg-green-600 text-white px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selected}
              onClick={() => {
                const alamatTerpilih = alamatList.find((a) => a.id === selected)
                if (alamatTerpilih && onSelectAlamat) {
                  onSelectAlamat(alamatTerpilih)
                }
                setOpen(false)
              }}
            >
              Pilih alamat
            </button>
          </div>
        </div>
      </div>
    </>
  )
}