import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import type { Metadata } from "next";
import AuthCheck from "@/components/AuthCheck";
import { Search, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Panganku Fresh Admin",
};

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);


  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/profile`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch admin profile");
        const data: AdminProfile = await res.json();
        setAdmin(data);
      } catch (err) {
        console.error("Error fetching admin profile:", err);
      }
    };
    fetchAdminProfile();
  }, []);
  return (
    <AuthCheck role="ADMIN">
      <div className="bg-gray-50 flex font-plusJakartaSans min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <img
              src="/LogoAdmin.png"
              alt="Panganku Fresh Admin Logo"
              className="h-8 object-contain"
            />
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between px-12 py-8 bg-white shadow-sm">
            {/* Right Section - Notification & User Info */}
            <div className="flex items-center ml-210 space-x-6 mr-6">
              {/* User Info */}
              <div className="flex items-center space-x-6">
                <span className="text-base text-gray-600">
                  Hello, <span className="font-semibold text-gray-800"> {admin ? admin.name : "Admin"}</span>
                </span>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-200">
                  <img
                    src={admin?.image || "/panganku-fresh-icon.png"}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Header Bar */}
          <div className="lg:hidden flex items-center justify-end p-4 bg-white shadow-sm">
            {/* Mobile User Info */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">
                Hello, <span className="font-bold text-gray-800"> {admin ? admin.name : "Admin"}</span>
              </span>
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-green-200 flex-shrink-0">
                <img
                  src={admin?.image || "/panganku-fresh-icon.png"}
                  alt="Admin Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 p-3 sm:p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AuthCheck>
  );
}