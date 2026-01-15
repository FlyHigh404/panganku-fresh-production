"use client"
import AdminLayout from "@/app/admin/AdminLayout";
import { useState, useEffect } from "react"
import { Search, Bell } from "lucide-react";
import CardPenjualan from "../components/cards/CardPenjualan";
import CardPesanan from "../components/cards/CardPesanan";
import CardPengguna from "../components/cards/CardPengguna";
import Grafik from "@/app/admin/components/grafik/Grafik"
import ActivityLogCard from "@/app/admin/components/logAktivitas/LogAktivitas"

interface DashboardData {
  cards: {
    users: {
      totalUsers: number;
      changePercentage: string;
      changeType: "positive" | "negative";
    };
    products: {
      totalProducts: number;
      changePercentage: string;
      changeType: "positive" | "negative";
    };
    orders: {
      totalOrders: number;
      changePercentage: string;
      changeType: "positive" | "negative";
    };
  };
  salesData: Array<{
    month?: string;
    day?: string;
    year: number;
    sales: number;
  }>;
}

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAktif, setFilterAktif] = useState<'bulan' | 'minggu'>('bulan');

  const fetchDashboardData = async (filter: 'bulan' | 'minggu') => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/dashboard?filter=${filter}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(filterAktif);
  }, [filterAktif]);

  const handleFilterChange = (filter: 'bulan' | 'minggu') => {
    setFilterAktif(filter);
  };

  if (loading) {
    return (
      <AdminLayout>
        <main className="flex-1 bg-gray-50 pt-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </main>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* MAIN CONTENT CONTAINER */}
      <div className="space-y-4 sm:space-y-6">
        {/* CARD OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <CardPenjualan
            totalOrders={dashboardData?.cards.orders.totalOrders}
            changePercentage={dashboardData?.cards.orders.changePercentage}
            changeType={dashboardData?.cards.orders.changeType}
          />
          <CardPesanan
            totalProducts={dashboardData?.cards.products.totalProducts}
            changePercentage={dashboardData?.cards.products.changePercentage}
            changeType={dashboardData?.cards.products.changeType}
          />
          <CardPengguna
            totalUsers={dashboardData?.cards.users.totalUsers}
            changePercentage={dashboardData?.cards.users.changePercentage}
            changeType={dashboardData?.cards.users.changeType}
          />
        </div>

        {/* GRAFIK OVERVIEW */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <Grafik
            salesData={dashboardData?.salesData || []}
            filterAktif={filterAktif}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>
    </AdminLayout>
  );
}