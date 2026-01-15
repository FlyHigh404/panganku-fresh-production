"use client";

import { useState, useEffect, useRef } from "react";
import { User, Settings, LogOut, ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { signOut, useuser } from "next-auth/react";
import NotifikasiCust from "./NotifikasiCust";
import CartCust from "./CartCust";
import { useCart } from "@/context/CartContext"
import Link from "next/link";

const NavSearch = () => {
  const { user, login, logout, token } = useAuth();
  const router = useRouter();

  const [notificationCount, setNotificationCount] = useState(0);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount, fetchCartCount } = useCart();

  useEffect(() => {
    if (user && user?.role !== "ADMIN") {
      fetchCartCount();
    } else {
      setNotificationCount(0);
    }
  }, [user, fetchCartCount]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!user) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile`, {
          credentials: "include", headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          console.warn("Profile fetch failed:", res.status);
          return;
        }
        const data = await res.json();
        if (data?.image) setProfileImage(data.image);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsProfileDropdownOpen(false);
    logout;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/katalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const showIcons = user && user?.role !== "ADMIN";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-20 bg-white shadow z-50 px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 ml-4 md:ml-16">
          <img src="/Logo.png" alt="Logo" className="w-36 h-12 md:w-48 md:h-14 object-contain" />
        </a>

        {/* Search (Desktop only)
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl mx-6 hidden md:block"
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk terbaik di Panganku Fresh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200"
            />
          </div>
        </form> */}

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-6">
          {/* Notifikasi */}
          {showIcons && <NotifikasiCust notificationCount={notificationCount} />}

          {/* Cart */}
          {showIcons && <CartCust />}

          {/* Profile / Login */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-100">
                  <img
                    src={profileImage || user?.image || "/default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
                  {user?.name || "User"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 hidden sm:block ${isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Modern Minimalist Dropdown */}
              <div
                className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 ${isProfileDropdownOpen
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                  }`}
              >
                {/* Profile Info */}
                <div className="px-4 py-3 bg-gradient-to-br from-green-50 to-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={profileImage || user?.image || "/default-avatar.png"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      router.push("/profil");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Profil Saya</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="cursor-pointer font-medium text-sm transition-all duration-300 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6EC568] to-[#26A81D] bg-clip-text text-transparent hover:opacity-80"
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="cursor-pointer bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Search (Mobile only)
      <div className="sticky mt-24 px-4 md:hidden">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200"
            />
          </div>
        </form>
      </div> */}
    </>
  );
};

export default NavSearch;