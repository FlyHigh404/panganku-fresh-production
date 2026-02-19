'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token tidak ditemukan.')
      return
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verifikasi gagal.')
        }
      } catch (err) {
        setStatus('error')
        setMessage('Terjadi kesalahan koneksi.')
      }
    }

    verifyToken()
  }, [token])

  return (
    <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Memverifikasi Akun...</h2>
          <p className="text-gray-500 mt-2">Mohon tunggu sebentar.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Email Terverifikasi!</h2>
          <p className="text-gray-600 mt-2 mb-8">Akun Anda sekarang sudah aktif. Silakan masuk untuk mulai berbelanja.</p>
          <Link href="/auth/signin" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md">
            Masuk Sekarang
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <XCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Verifikasi Gagal</h2>
          <p className="text-red-500 mt-2 mb-6">{message}</p>
          <Link href="/auth/signup" className="text-green-600 font-semibold hover:underline">
            Coba Daftar Lagi
          </Link>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<Loader2 className="animate-spin text-green-500" />}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}