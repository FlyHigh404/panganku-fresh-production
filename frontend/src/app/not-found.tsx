// src/app/not-found.tsx (Alternatif dengan background pattern)
"use client";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  ShoppingCart,
  Package,
  Users,
  UserPlus
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2326A81D' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a
              href="/"
              className="group hover:scale-110 transition-all duration-300 hover:drop-shadow-lg"
            >
              <div className="flex items-center">
                <img
                  src="/Logo.png"
                  alt="Panganku Fresh Logo"
                  className="w-48 h-14 object-contain"
                />
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full text-center">
          {/* Floating Elements */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 -right-20 w-16 h-16 bg-green-100 rounded-full opacity-30 animate-bounce"></div>

          {/* Content Card */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 p-8 md:p-12">
            {/* 404 Illustration */}
            <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto relative">
                {/* Outer Circle */}
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse"></div>

                {/* Middle Circle */}
                <div className="absolute inset-8 bg-red-200 rounded-full animate-pulse delay-300"></div>

                {/* Inner Circle */}
                <div className="absolute inset-16 bg-red-300 rounded-full animate-pulse delay-700"></div>

                {/* 404 Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white drop-shadow-lg">
                    404
                  </span>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Oops! Halaman Hilang
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                Sepertinya halaman yang Anda cari telah tersesat di alam
                digital. Jangan khawatir, kami akan membantu Anda kembali ke
                jalur yang benar.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Home className="w-5 h-5" />
                <span>Beranda</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 transform hover:-translate-y-1"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
            </div>

            {/* Quick Navigation */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Jelajahi TokoKu
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  href="/katalog"
                  className="group p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300"
                >
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">
                    Katalog
                  </span>
                </Link>

                <Link
                  href="/keranjang"
                  className="group p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300"
                >
                  <ShoppingCart className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">
                    Keranjang
                  </span>
                </Link>

                <Link
                  href="/tentang"
                  className="group p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300"
                >
                  <Users className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">
                    Tentang
                  </span>
                </Link>
                <Link
                  href="/auth/signup"
                  className="group p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-300"
                >
                  <UserPlus className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700">
                    Daftar Sekarang
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Butuh bantuan?{" "}
              <Link
                href="/kontak"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Hubungi tim support kami
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} TokoKu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
