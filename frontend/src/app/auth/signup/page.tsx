'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
// 1. Ganti import next-auth dengan AuthContext dan Google OAuth
import { useAuth } from '@/context/AuthContext'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import NavAuth from '@/components/NavAuth'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  // 2. Gunakan fungsi login dari context
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan')
      }

      // 3. Login otomatis setelah signup berhasil menggunakan AuthContext
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const loginData = await loginRes.json();

      if (loginRes.ok) {
        login(loginData.user, loginData.token); // Simpan session
        router.push('/');
      } else {
        router.push('/auth/signin');
      }

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // 4. Handler untuk pendaftaran/masuk lewat Google
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token); // Simpan session ke AuthContext
        router.push('/');
      } else {
        setError(data.error || "Gagal mendaftar dengan Google");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavAuth />
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: `
            radial-gradient(circle at 20% 30%, rgba(144, 238, 144, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(173, 216, 230, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)
          `
          }}
        />
        {/* Background Fruit Images (Tetap Sama) */}
        <div className="absolute -top-25 left-0 pointer-events-none overflow-hidden">
          <img src="/loginLeft.png" alt="Fruits decoration" className="object-cover" style={{ width: '800px' }} />
        </div>
        <div className="absolute -bottom-40 right-0 pointer-events-none overflow-hidden">
          <img src="/loginRight.png" alt="Fruits decoration" className="object-cover" style={{ width: '800px' }} />
        </div>

        <div className="relative z-5 flex items-center justify-center w-full h-full">
          <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-100" style={{ width: '500px', minHeight: 'auto' }}>
            <div className="flex flex-col justify-center h-full space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar ke Panganku Fresh</h1>
                <p className="text-gray-600 text-sm">Bergabunglah untuk belanja kebutuhan segar Anda</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input Fields (Name, Email, Password, Confirm) - Tetap Sama */}
                <div className="relative">
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 transition-all">Nama Lengkap</label>
                </div>

                <div className="relative">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 transition-all">Email atau Nomor HP</label>
                </div>

                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 transition-all">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                  <label className="absolute left-4 top-2 text-xs text-gray-500 transition-all">Konfirmasi Password</label>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-5 rounded-xl transition-colors duration-200 text-base shadow-md disabled:opacity-50">
                  {loading ? 'Mendaftarkan...' : 'Daftar'}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Atau Daftar dengan</span></div>
              </div>

              {/* 5. Ganti Tombol Manual Google dengan GoogleLogin Provider */}
              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Daftar Google Gagal")}
                    theme="outline"
                    width="420"
                    text="signup_with"
                    shape="pill"
                  />
                </GoogleOAuthProvider>
              </div>

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Sudah punya akun?{" "}
                  <Link href="/auth/signin" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}