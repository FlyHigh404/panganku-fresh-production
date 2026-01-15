"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import NavAuth from "@/components/NavAuth";
import Footer from "@/components/Footer";

export default function LoginPageAdmin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk ke akun admin");
      }

      if (data.user.role !== "ADMIN") {
        throw new Error("Anda tidak memiliki akses ke halaman ini.");
      }

      login(data.user, data.token); 
      router.push("/admin/dashboard");

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <NavAuth />
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden -mt-16 bg-gradient-to-br from-green-100 via-green-50 to-emerald-100">
        {/* Background Image */}
        <img
          src="/background.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Login Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 relative z-0 border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Log In Admin</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg 
    focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900"
                placeholder=""
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-xs text-gray-500 transition-all 
    peer-focus:text-gray-500"
              >
                Email atau Nomor HP
              </label>
              <p className="text-sm text-gray-400 ml-1 mt-1">
                Contoh: email@pangankufresh.com
              </p>
            </div>
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg 
    focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900"
                placeholder=""
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-xs text-gray-500 transition-all 
  peer-focus:text-gray-500"
              >
                Password
              </label>
              {/* Toggle show/hide password */}
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-5 rounded-xl transition-colors duration-200 text-base shadow-md hover:shadow-lg"
            >
              {loading ? 'Masuk...' : 'Log In'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-center mt-2">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}