// components/OrderConfirm.tsx - FIXED UPDATE STATUS
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { MapPin, CheckCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  OrderStatus,
  OrderStatusLabel,
  PaymentMethod,
  OrderProduct,
} from "@/types/order";

export interface Alamat {
  id: string;
  nama: string;
  telp: string;
  alamat: string;
  utama: boolean;
}

export interface OrderConfirmProps {
  orderId?: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  address: Alamat;
  contact?: string;
  products: OrderProduct[];
  total: string;
  open: boolean;
  onClose: () => void;
}

const OrderConfirm: React.FC<OrderConfirmProps> = ({
  orderId,
  orderNumber,
  status,
  paymentMethod,
  address,
  products,
  total,
  open,
  onClose,
}) => {
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [openFinishPopup, setOpenFinishPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !openFinishPopup) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, openFinishPopup, onClose]);

  // Function untuk update order status
  const updateOrderStatus = async (newStatus: "COMPLETED") => {
    const token = localStorage.getItem('token');

    if (!orderId) {
      console.error("❌ Order ID tidak ditemukan:", {
        orderId,
        orderNumber,
        status
      });
      alert("Order ID tidak ditemukan");
      return;
    }

    try {
      setLoading(true);

      console.log("🔄 OrderConfirm: Updating order status:", {
        orderId,
        newStatus,
        orderNumber,
        endpoint: `/api/profile/order/${orderId}`
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/order/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });

      // Try to get response text first for debugging
      const responseText = await res.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Response tidak valid dari server");
      }

      if (!res.ok) {
        console.error("❌ API Error:", {
          status: res.status,
          statusText: res.statusText,
          message: result?.message,
          error: result?.error
        });
        throw new Error(result?.message || `HTTP ${res.status}: Gagal update status`);
      }

      // Tutup popup dan modal
      setOpenFinishPopup(false);
      onClose();
      setTimeout(() => {
        router.push("/profil/riwayat-transaksi/transaksi-selesai");
        router.refresh(); // Refresh data
      }, 100);

    } catch (err: any) {
      console.error("❌ Update failed:", err);
      alert(err.message || "Terjadi kesalahan saat mengubah status pesanan");
      setOpenFinishPopup(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = () => {
    updateOrderStatus("COMPLETED");
  };

  const getHeaderStyle = () => {
    switch (status) {
      case OrderStatus.SHIPPED:
        return "bg-[linear-gradient(180deg,#FFA04F_0%,#FF8A25_100%)] rounded-t-[15px]";
      case OrderStatus.PROCESSING:
        return "bg-[linear-gradient(180deg,#F0E138_0%,#C3B300_100%)] rounded-t-[15px]";
      case OrderStatus.COMPLETED:
        return "bg-[linear-gradient(145deg,#6EC568_13.92%,#26A81D_87.84%)] rounded-t-[15px]";
      case OrderStatus.CANCELED:
        return "bg-[linear-gradient(145deg,#FFBDBD_13.92%,#E3342F_87.84%)] rounded-t-[15px]";
      default:
        return "bg-gray-300";
    }
  };

  const totalQty = products?.reduce((acc, p) => acc + p.qty, 0) || 0;

  const handleBeliLagi = () => {
    if (products.length > 0) {
      const firstProductId = products[0].id;
      router.push(`/katalog/detail?id=${firstProductId}`);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !openFinishPopup) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[10005] font-jakarta p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-[15px] w-full max-w-md max-h-[90vh] overflow-y-auto relative shadow-2xl">
          {/* ===================== HEADER ===================== */}
          <div
            className={`w-full flex justify-between items-center text-white px-4 sm:px-6 py-3 ${getHeaderStyle()}`}
          >
            <div>
              <h2 className="text-lg font-semibold">
                Pesanan {OrderStatusLabel[status]}
              </h2>
              {status === OrderStatus.SHIPPED ? (
                <p className="text-sm">Pesanan sedang dikirim oleh kurir</p>
              ) : status === OrderStatus.PROCESSING ? (
                <p className="text-sm">Pesanan Anda sedang diproses</p>
              ) : status === OrderStatus.COMPLETED ? (
                <p className="text-sm">Terima kasih telah berbelanja 😊</p>
              ) : status === OrderStatus.CANCELED ? (
                <p className="text-sm">Pesanan telah dibatalkan</p>
              ) : null}
            </div>

            {status === OrderStatus.SHIPPED && (
              <Image
                src="/trukorder.png"
                alt="Truck"
                width={50}
                height={50}
                className="mr-3 sm:mr-6"
              />
            )}
            {status === OrderStatus.PROCESSING && (
              <Image
                src="/jamorder.png"
                alt="Jam"
                width={50}
                height={50}
                className="mr-3 sm:mr-6"
              />
            )}
          </div>

          {/* ===================== BODY ===================== */}
          <div className="p-4 sm:p-6">
            {/* Info Pesanan */}
            <div className="py-2">
              <h3 className="font-bold text-gray-800 text-sm mb-2">
                Informasi Pesanan
              </h3>
              <div className="grid grid-cols-2 text-sm">
                <span>No. Pesanan:</span>
                <span className="text-right font-medium">{orderNumber}</span>
              </div>
              <div className="grid grid-cols-2 text-sm mt-1">
                <span>Metode Pembayaran:</span>
                <span className="text-right font-medium">
                  {paymentMethod}
                </span>
              </div>
            </div>

            {/* Alamat */}
            {address && (
              <div className="py-4 border-t border-gray-200">
                <h2 className="font-bold text-sm text-black mb-3">
                  Alamat Pengiriman
                </h2>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-sm text-black">{address.nama}</p>
                  {address.utama && (
                    <span className="bg-green-100 text-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Utama
                    </span>
                  )}
                </div>
                <div className="pl-7 mt-2">
                  <p className="font-medium text-sm text-black">
                    {address.nama}
                    <span className="mx-2 text-[#8F8F8F]">|</span>
                    <span className="text-[#8F8F8F]">{address.telp}</span>
                  </p>
                  <p className="text-xs text-[#8F8F8F]">{address.alamat}</p>
                </div>
              </div>
            )}

            {/* Produk */}
            <div className="py-4 border-t border-gray-200">
              {((products ?? [])).length > 0 && (showAll ? (products ?? []) : (products ?? []).slice(0, 1)).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2 last:border-none"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-[60px] h-[60px] rounded-md overflow-hidden">
                      <Image
                        src={p.image || "/placeholder-product.png"}
                        alt={p.name}
                        width={60}
                        height={60}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">Qty: x{p.qty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{p.price}</p>
                </div>
              ))}

              {(products ?? []).length > 1 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-green-600 text-sm font-medium mt-2"
                >
                  {showAll ? "Sembunyikan" : "Lihat selengkapnya"}
                </button>
              )}
              <div className="flex justify-end text-xs text-gray-500 mt-2">
                Total {totalQty} produk
              </div>
            </div>

            {/* Total */}
            <div className="py-4 flex justify-end text-sm gap-1">
              <span className="text-black">Total pesanan :</span>
              <span className="font-bold text-black">{total}</span>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-4 border-t border-gray-200">
              {status === OrderStatus.PROCESSING ? (
                <>
                  {pathname.includes("/checkout") ? (
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => router.push("/")}
                        className="flex-1 bg-[#26A81D] hover:bg-green-700 text-white font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 transition-all"
                      >
                        Kembali ke Beranda
                      </button>
                      <button
                        onClick={() => router.push("/profil/riwayat-transaksi")}
                        className="flex-1 bg-green-100 text-green-600 font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 hover:bg-green-200 transition-all disabled:opacity-70"
                      >
                        Riwayat Transaksi
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full bg-[#26A81D] hover:bg-green-700 text-white font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base transition-all"
                    >
                      Kembali
                    </button>
                  )}
                </>
              ) : status === OrderStatus.SHIPPED ? (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setOpenFinishPopup(true)}
                    disabled={loading}
                    className="flex-1 bg-green-100 text-green-600 font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 hover:bg-green-200 transition-all disabled:opacity-70"
                  >
                    Selesaikan Pesanan
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-[#26A81D] hover:bg-green-700 text-white font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 transition-all"
                  >
                    Kembali
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-green-100 text-green-500 font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 hover:bg-green-200 transition-all"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleBeliLagi}
                    className="flex-1 bg-[#26A81D] hover:bg-green-700 text-white font-semibold rounded-lg h-9 sm:h-10 text-xs sm:text-base px-2 sm:px-4 transition-all"
                  >
                    Beli Lagi
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup Selesaikan Pesanan */}
      {openFinishPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[10006] p-3">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 shadow-xl text-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
              Selesaikan pesanan?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin pesanan sudah diterima dan ingin menyelesaikan pesanan ini?
            </p>

            <div className="border border-gray-200 rounded-lg p-3 text-left mb-4">
              <p className="text-sm font-semibold">
                No Pesanan:{" "}
                <span className="text-green-700">#INV {orderNumber}</span>
              </p>
              {products.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Image
                    src={products[0]?.image || "/placeholder.svg"}
                    alt={products[0]?.name || "Produk"}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="text-xs text-gray-800">
                      {products[0]?.name || "Nama produk"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: x{products[0]?.qty}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenFinishPopup(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-lg h-10 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Tidak
              </button>
              <button
                onClick={handleCompleteOrder}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-10 transition disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Iya, Selesaikan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderConfirm;