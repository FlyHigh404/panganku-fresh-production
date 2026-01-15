"use client";
import NavAuth from "@/components/NavAuth";
import Link from "next/link";
// import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react"; // Import Lucide icons
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Pemanggilan manual ke API Login backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/auth/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                login(data.user, data.token); // Simpan ke localstorage
                router.push('/');
            } else {
                setError(data.error || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    }

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
                login(data.user, data.token); // Simpan ke Context
                router.push('/');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Gagal login dengan Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <NavAuth />
            <div className="relative h-screen overflow-hidden flex items-center justify-center -mt-14">
                <div className="absolute inset-0 w-full h-full"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 30%, rgba(144, 238, 144, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(173, 216, 230, 0.3) 0%, transparent 50%),
                            linear-gradient(135deg, #e8f5e8 0%, #f0f8ff 100%)
                        `
                    }}
                />

                {/* Fruit Images (Tetap Sama) */}
                <div className="absolute -top-25 left-0 pointer-events-none overflow-hidden">
                    <img src="/loginLeft.png" alt="Fruits decoration" className="object-cover" style={{ width: '800px' }} />
                </div>
                <div className="absolute -bottom-40 right-0 pointer-events-none overflow-hidden">
                    <img src="/loginRight.png" alt="Fruits decoration" className="object-cover" style={{ width: '800px' }} />
                </div>

                <div className="relative z-10 flex items-center justify-center w-full h-full">
                    <div className="bg-white rounded-xl shadow-lg p-10 border border-gray-100" style={{ width: '500px', minHeight: 'auto' }}>
                        <div className="flex flex-col justify-center h-full space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Log In ke Panganku Fresh</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative">
                                    <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} required
                                        className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                                    <label className="absolute left-4 top-2 text-xs text-gray-500">Email atau Nomor HP</label>
                                </div>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                                        className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900" placeholder="" />
                                    <label className="absolute left-4 top-2 text-xs text-gray-500">Password</label>
                                    <button type="button" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-5 rounded-xl transition-colors text-base shadow-md">
                                    {loading ? 'Masuk...' : 'Log In'}
                                </button>

                                {error && <div className="text-red-500 text-center mt-2">{error}</div>}
                            </form>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Atau Log In dengan</span></div>
                            </div>

                            {/* 4. Implementasi Tombol Google yang Baru */}
                            <div className="flex justify-center">
                                <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setError("Google Login Gagal")}
                                        theme="outline"
                                        width="420"
                                        text="continue_with"
                                        shape="pill"
                                    />
                                </GoogleOAuthProvider>
                            </div>

                            <div className="text-center">
                                <p className="text-gray-600 text-sm">
                                    Belum punya akun? <Link href="/auth/signup" className="text-green-600 font-semibold">Daftar</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;