"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// PROVIDER (Komponen Pembungkus)
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    // console.log("Ini token usernya: ", token)
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Mengambil data dari localStorage saat halaman pertama kali dibuka
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User, userToken: string) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);

        // Arahkan user berdasarkan role
        if (userData.role === 'ADMIN') {
            router.push('/admin/dashboard');
        } else {
            router.push('/');
        }
    };

    const logout = () => {
        const isAdmin = user?.role === 'ADMIN';
        const redirectPath = isAdmin ? '/admin-login' : '/';

        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        router.push(redirectPath);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// MEMBUAT HOOK (Cara memanggil data di komponen lain)
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
}