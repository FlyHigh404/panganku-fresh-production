"use client"
import { useState, useEffect } from "react"
import AdminLayout from "../AdminLayout"
import { Upload, Eye, EyeOff } from "lucide-react"

const Pengaturan = () => {
    const [activeTab, setActiveTab] = useState("kelola-akun")
    const [loading, setLoading] = useState(true)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        profileImage: "",
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/profile`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch profile")

                const data = await res.json()
                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    profileImage: data.image || "",
                })
            } catch (err) {
                console.error("Error fetching profile:", err)
                setError("Gagal memuat data profil")
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const token = localStorage.getItem('token');

        // Validate file size
        if (file.size > 1024 * 1024) {
            setError("Ukuran file maksimal 1MB")
            e.target.value = ""
            return
        }

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
            setError("Format file harus JPEG atau PNG")
            e.target.value = ""
            return
        }

        const uploadData = new FormData()
        uploadData.append("file", file)

        setUploadLoading(true)
        setError(null)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/upload`, {
                method: "POST",
                body: uploadData,
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || "Upload gagal")
            }

            const data = await res.json()

            // Update profile image via API
            const updateRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ image: data.url }),
            })

            if (!updateRes.ok) throw new Error("Failed to update profile")

            setFormData(prev => ({
                ...prev,
                profileImage: data.url || "",
            }))

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err) {
            console.error("Upload error:", err)
            setError(err instanceof Error ? err.message : "Gagal mengupload gambar. Silakan coba lagi.")
        } finally {
            setUploadLoading(false)
            e.target.value = ""
        }
    }

    const resetSettings = () => {
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
        setError(null)
        setSuccess(false)
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        const token = localStorage.getItem('token');
        e.preventDefault()
        setError(null)
        setSuccess(false)

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setError("Semua field harus diisi")
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError("Password baru minimal 6 karakter")
            return
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("Konfirmasi password tidak cocok")
            return
        }

        setPasswordLoading(true)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/profile/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengubah password")
            }

            setSuccess(true)
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })

            setTimeout(() => {
                setSuccess(false)
            }, 3000)
        } catch (err) {
            console.error("Password update error:", err)
            setError(err instanceof Error ? err.message : "Gagal mengubah password. Silakan coba lagi.")
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout>
                <main className="flex-1 bg-gray-50 pt-6">
                    <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
                        <div className="text-gray-500">Memuat...</div>
                    </div>
                </main>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <main className="flex-1 bg-gray-50 pt-6">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <div className="flex justify-center gap-4 sm:gap-52">
                            <button
                                onClick={() => setActiveTab("kelola-akun")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "kelola-akun"
                                    ? "text-green-600 border-green-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                Kelola akun
                            </button>
                            <button
                                onClick={() => setActiveTab("pengaturan-dashboard")}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "pengaturan-dashboard"
                                    ? "text-green-600 border-green-600"
                                    : "text-gray-500 border-transparent hover:text-gray-700"
                                    }`}
                            >
                                Ganti Password
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                                Gambar profil berhasil diperbarui!
                            </div>
                        )}

                        {activeTab === "kelola-akun" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Picture Section */}
                                <div className="lg:col-span-1">
                                    <div className="bg-green-50 rounded-xl p-6 text-center">
                                        <div className="w-48 h-48 mx-auto mb-4 rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
                                            {formData.profileImage ? (
                                                <img
                                                    src={formData.profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-white text-5xl font-bold">
                                                    {formData.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <label className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors border border-green-200 flex items-center gap-2 mx-auto cursor-pointer w-fit">
                                            <Upload size={16} />
                                            {uploadLoading ? "Mengupload..." : "Pilih Foto"}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                disabled={uploadLoading}
                                            />
                                        </label>
                                        <div className="mt-3 text-sm text-gray-500">
                                            <p>Ukuran gambar: maks. 1 MB</p>
                                            <p>Format gambar: .JPEG, .PNG</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="lg:col-span-2 space-y-6 pt-10">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.name}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 bg-gray-50 text-gray-600 cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={formData.email}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 bg-gray-50 text-gray-600 cursor-not-allowed focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-semibold">Info:</span> Nama dan email tidak dapat diubah. Hubungi administrator sistem jika perlu melakukan perubahan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "pengaturan-dashboard" && (
                            <div className="max-w-2xl mx-auto">
                                <form onSubmit={handlePasswordChange} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Lama
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    currentPassword: e.target.value
                                                }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent"
                                                placeholder="Masukkan password lama"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    newPassword: e.target.value
                                                }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent"
                                                placeholder="Masukkan password baru (min. 6 karakter)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Konfirmasi Password Baru
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData(prev => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value
                                                }))}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent"
                                                placeholder="Konfirmasi password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {passwordLoading ? "Menyimpan..." : "Simpan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </AdminLayout>
    )
}

export default Pengaturan