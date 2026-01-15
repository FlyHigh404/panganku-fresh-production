"use client"
import { useState, useEffect } from "react";
import { Search, MapPin, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import AddAddress from "@/components/TambahAlamat";
import EditAddress from "@/components/EditAlamat";

type Address = {
  id: string;
  recipientName: string;
  phoneNumber: string;
  label: string;
  fullAddress: string;
  note?: string;
  isPrimary: boolean;
};

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function ProfileAddressPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addressEdit, setAddressEdit] = useState<Address | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addressList, setAddressList] = useState<Address[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const token = localStorage.getItem('token');

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch addresses");
        const data = await response.json();
        setAddressList(data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        showToast("error", "Gagal memuat daftar alamat. Silakan refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(addressToDelete.id);
    setDeleteConfirmOpen(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address/${addressToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete address");

      setAddressList((prev) => prev.filter((a) => a.id !== addressToDelete.id));
      showToast("success", "Alamat berhasil dihapus");
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast("error", "Gagal menghapus alamat. Silakan coba lagi.");
    } finally {
      setIsDeleting(null);
      setAddressToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!addressEdit) return;

    if (!addressEdit.recipientName.trim()) return showToast("error", "Nama penerima tidak boleh kosong");
    if (!addressEdit.phoneNumber.trim()) return showToast("error", "Nomor telepon tidak boleh kosong");
    if (!addressEdit.fullAddress.trim()) return showToast("error", "Alamat lengkap tidak boleh kosong");

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address/${addressEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(addressEdit),
      });
      if (!response.ok) throw new Error("Failed to update address");

      const updatedAddress: Address = await response.json();
      setAddressList((prev) => prev.map((a) => (a.id === updatedAddress.id ? updatedAddress : a)));
      setEditOpen(false);
      setAddressEdit(null);
      showToast("success", "Alamat berhasil diperbarui");
    } catch (error) {
      console.error("Error updating address:", error);
      showToast("error", "Gagal memperbarui alamat. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAddresses = addressList.filter((item) =>
    item.fullAddress.toLowerCase().includes(search.toLowerCase()) ||
    item.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div
        className="w-full max-w-[756.65px] rounded-[15px] bg-white p-4 md:p-8 font-jakarta relative"
        style={{ boxShadow: "6px 6px 54px 0 rgba(0, 0, 0, 0.05)" }}
      >
        {/* Toast Notifications - Inside the address box */}
        <div className="absolute top-4 right-4 z-50 space-y-2 max-w-xs">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6 -mt-8 md:-mt-16">
          <h1 className="text-black font-bold text-xl md:text-2xl mt-6 md:mt-12">Alamat</h1>
        </div>

        {/* Search + Add */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-4 md:mb-6 gap-3 md:gap-0">
          <div className="relative w-full md:w-87">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, alamat, atau label..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#26A81D]"
              disabled={isLoading}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
          <button
            className="px-4 py-2 rounded-xl w-full md:w-50 h-10 bg-green-500 text-white font-semibold hover:bg-green-700 text-sm md:text-base disabled:opacity-50"
            onClick={() => setAddOpen(true)}
            disabled={isLoading}
          >
            + Tambah
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Memuat daftar alamat...</p>
          </div>
        )}

        {!isLoading && addressList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Image
              src="/AlamatKosong.png"
              alt="Alamat Kosong"
              width={160}
              height={160}
              className="mb-4"
            />
            <h3 className="font-bold text-[14px] text-black font-['Plus Jakarta Sans'] mb-1">
              Belum ada lokasi alamat
            </h3>
            <p className="text-[12px] text-[#6D706E] font-normal font-['Plus Jakarta Sans'] mb-5">
              Tambahkan alamat untuk pengiriman
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && addressList.length > 0 && filteredAddresses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Alamat Tidak Ditemukan
            </h3>
            <p className="text-gray-500 text-sm">
              Tidak ada alamat yang cocok dengan pencarian "{search}"
            </p>
          </div>
        )}

        {/* Address List */}
        {!isLoading && filteredAddresses.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            {filteredAddresses.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`bg-white shadow rounded-xl p-3 md:p-4 cursor-pointer transition border ${selected === item.id
                  ? "border-green-500 shadow-[0_0_16px_rgba(38,168,29,0.32)]"
                  : "border-gray-200"
                  } ${isDeleting === item.id ? "opacity-50" : ""}`}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    <p className="font-medium text-[14px] md:text-[15px] text-[#8F8F8F]">
                      {item.label || "No Label"}
                    </p>
                    {item.isPrimary && (
                      <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        Utama
                      </span>
                    )}
                  </div>
                </div>

                <div className="pl-6 md:pl-8 mt-2">
                  <p className="font-medium text-xs md:text-sm text-black">
                    {item.recipientName}
                    <span className="mx-2 text-[#8F8F8F]">|</span>
                    <span className="text-[#8F8F8F] text-[13px] md:text-[14px]">
                      {item.phoneNumber}
                    </span>
                  </p>
                  <p className="text-[12px] md:text-[13px] text-[#8F8F8F] leading-relaxed">
                    {item.fullAddress}
                  </p>

                  {item.note && (
                    <p className="text-[12px] md:text-[13px] text-gray-500 italic">
                      Catatan: {item.note}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2 text-xs md:text-sm">
                    <button
                      className="text-green-600 hover:text-green-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressEdit(item);
                        setEditOpen(true);
                      }}
                    >
                      Ubah
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddressToDelete(item);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      {isDeleting === item.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        "Hapus"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && addressToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-[10005] p-4">
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm"
            onClick={() => {
              setDeleteConfirmOpen(false);
              setAddressToDelete(null);
            }}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 md:p-8 relative animate-scale-in z-[10002]">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                Hapus Alamat?
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-2">
                Apakah Anda yakin ingin menghapus alamat ini?
              </p>
              <div className="w-full bg-gray-50 rounded-lg p-3 mb-6 text-left">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {addressToDelete.label}
                  {addressToDelete.isPrimary && (
                    <span className="ml-2 bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      Utama
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-600">
                  {addressToDelete.recipientName} • {addressToDelete.phoneNumber}
                </p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {addressToDelete.fullAddress}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setAddressToDelete(null);
                  }}
                >
                  Batal
                </button>
                <button
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {editOpen && addressEdit && (
        <EditAddress
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            setAddressEdit(null);
          }}
          address={addressEdit}
          onSave={(updatedAddress: Address) => {
            setAddressList((prev) => prev.map((a) => (a.id === updatedAddress.id ? updatedAddress : a)));
            setEditOpen(false);
            setAddressEdit(null);
            showToast("success", "Alamat berhasil diperbarui");
          }}
          existingAddresses={addressList}
        />
      )}

      {/* Add Address Modal */}
      <AddAddress
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(newAddress: Address) => {
          setAddressList([...addressList, newAddress]);
          showToast("success", "Alamat baru berhasil ditambahkan");
        }}
      />

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }

        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </>
  );
}