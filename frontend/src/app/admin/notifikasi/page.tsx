"use client";
import { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Notification {
  id: string;
  createdAt: string;
  message: string;
  user: {
    name: string;
    image: string;
  };
}

const Notifikasi = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/notifications`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <AdminLayout>
      <main className="flex-1 bg-gray-50 pt-3">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:pt-6 sm:pb-0 bg-white">
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tabel notifikasi</h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  Ini adalah daftar notifikasi ke customers
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <img
                        src={notif.user.image}
                        alt={notif.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-xs font-medium text-gray-900 whitespace-nowrap">
                        {notif.user.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider whitespace-nowrap">
                      WAKTU
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider">
                      ISI
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wider whitespace-nowrap">
                      PENERIMA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((notif, index) => (
                    <tr
                      key={notif.id}
                      className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-700 text-sm line-clamp-1">{notif.message}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={notif.user.image}
                            alt={notif.user.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-900 whitespace-nowrap">{notif.user.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {notifications.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 px-6 text-center bg-white">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">Tidak ada notifikasi ditemukan</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {notifications.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, notifications.length)} of{" "}
                  {notifications.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg ${currentPage === page
                          ? "bg-green-500 text-white"
                          : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default Notifikasi;