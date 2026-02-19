"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User, LogOut, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { signOut, useSession } from "next-auth/react";
import NotifikasiCust from "./NotifikasiCust";
import CartCust from "./CartCust";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => setMounted(true), []);

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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    if (mounted) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [mounted]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: "#beranda", label: "Beranda" },
    { href: "#katalog", label: "Katalog" },
    { href: "#about", label: "Tentang Kami" },
    { href: "#testimoni", label: "Testimoni" },
  ];

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith("#")) {
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      router.push(href);
    }
  };

  const handleSignOut = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    logout();
  };

  const showCustomerIcons = user && user?.role !== "ADMIN";

  return (
    <>
      <div className="fixed top-0 right-0 w-full h-20 bg-white -z-10" />

      {/* ---------------- NAVBAR ---------------- */}
      <nav
        className={`fixed top-0 left-0 w-full px-4 sm:px-6 lg:px-8 xl:px-[8%] py-4 flex items-center justify-between z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
          }`}
      >
        {/* Logo */}
        <a
          href="/"
          className="group hover:scale-105 transition-transform duration-300"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("/");
          }}
        >
          <div className="flex items-center">
            <img
              src="/Logo.png"
              alt="Panganku Fresh Logo"
              className="w-22 h-12 sm:w-36 sm:h-16 md:w-42 md:h-20 object-contain"
            />
          </div>
        </a>

        {/* ---------------- DESKTOP NAV ---------------- */}
        <ul className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navItems.map((item) => {
            const isActive = pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`relative transition-all duration-300 font-medium text-base group ${isActive
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                >
                  {item.label}
                  {/* Image underline instead of line */}
                  <div
                    className={`absolute -bottom-2 left-0 w-full transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                      }`}
                  >
                    <img
                      src="/Line 66.png"
                      alt="Underline"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </a>
              </li>
            );
          })}
        </ul>

        {/* ---------------- DESKTOP ICONS ---------------- */}
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {showCustomerIcons && (
                <div className="flex items-center gap-1">
                  <NotifikasiCust notificationCount={notificationCount} />
                  <CartCust />
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative ml-2" ref={dropdownRef}>
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
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden xl:block">
                    {user?.name || "User"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""
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
                    {user?.role === "ADMIN" ? (
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          router.push("/admin/dashboard");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Dashboard</span>
                      </button>
                    ) : (
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
                    )}
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
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>

        {/* ---------------- MOBILE BUTTON ---------------- */}
        <div className="flex items-center gap-2 ml-auto lg:hidden">

          {/* Ikon Notifikasi dan Cart */}
          {showCustomerIcons && (
            <div className="flex items-center gap-1">
              <NotifikasiCust notificationCount={notificationCount} />
              <CartCust />
            </div>
          )}

          {/* Button Hamburger Menu */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

        </div>
      </nav>

      {/* ---------------- MOBILE MENU ---------------- */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden overflow-y-auto ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <img src="/Logo.png" alt="Panganku Fresh" className="h-10 object-contain" />
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Profile Section (if logged in) */}
          {user && (
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src={profileImage || user?.image || "/default-avatar.png"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
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
          )}

          {/* Navigation Menu */}
          <nav className="space-y-1 mb-6">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname && (pathname === item.href || pathname.startsWith(item.href + "/"));
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm transition-colors relative ${isActive
                    ? "bg-green-50 text-green-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {(isActive || item.href === pathname) && (
                      <img
                        src="/Line 66.png"
                        alt="Active indicator"
                        className="w-16 h-2 object-contain"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          {user ? (
            <div className="space-y-1 pt-4 border-t border-gray-100">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Akun
              </p>
              {user?.role === "ADMIN" ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/admin/dashboard");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <span>Dashboard</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push("/profil");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <span>Profil Saya</span>
                </button>
              )}

              {/* {showCustomerIcons && (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push("/cart");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                    <span>Keranjang</span>
                    {cartCount > 0 && (
                      <span className="ml-auto bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <div className="w-full">
                    <NotifikasiCust
                      notificationCount={notificationCount}
                      isMobile={true}
                      onClose={() => setIsMobileMenuOpen(false)}
                    />
                    Notifikasi
                  </div>
                </>
              )} */}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <Link
                href="/auth/signin"
                className="block w-full text-center py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium hover:shadow-md transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;