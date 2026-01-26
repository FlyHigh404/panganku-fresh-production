"use client";
import { Truck, XCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Alamat } from "@/types/alamat";
import FormRating from "@/components/FormRating";
import { OrderStatus, PaymentMethod, OrderProduct } from "@/types/order";

interface CardOrderProps {
  index: number;
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  total: string;
  products: OrderProduct[];
  paymentMethod: PaymentMethod;
  address: Alamat;
  contact: string;
  dateCompleted?: string;
  onShowDetail?: () => void;
}

const CardOrder: React.FC<CardOrderProps> = ({
  index,
  orderId,
  orderNumber,
  status,
  total,
  products,
  paymentMethod,
  address,
  contact,
  dateCompleted,
  onShowDetail,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [openCancelPopup, setOpenCancelPopup] = useState(false);
  const [openFinishPopup, setOpenFinishPopup] = useState(false);
  const [openRating, setOpenRating] = useState<null | OrderProduct>(null);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const updateOrderStatus = async (newStatus: "CANCELED" | "COMPLETED") => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);

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
        console.log("📡 Parsed response:", result);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        console.log("📡 Response was:", responseText.substring(0, 200));
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

      console.log("✅ Update success:", result);

      const updated = newStatus === "CANCELED" ? OrderStatus.CANCELED : OrderStatus.COMPLETED;
      setCurrentStatus(updated);

      // Tutup popup sebelum redirect
      setOpenCancelPopup(false);
      setOpenFinishPopup(false);

      // Redirect setelah update berhasil
      setTimeout(() => {
        if (updated === OrderStatus.CANCELED) {
          router.push("/profil/riwayat-transaksi/transaksi-dibatalkan");
        } else if (updated === OrderStatus.COMPLETED) {
          router.push("/profil/riwayat-transaksi/transaksi-selesai");
        }
      }, 100);

    } catch (err: any) {
      console.error("❌ Update failed:", err);
      alert(err.message || "Terjadi kesalahan saat mengubah status pesanan");
      setOpenCancelPopup(false);
      setOpenFinishPopup(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => updateOrderStatus("CANCELED");
  const handleCompleteOrder = () => updateOrderStatus("COMPLETED");
  const handleShowDetail = () => {
    console.log("🟢 CardOrder: Dispatching orderConfirm:open");
    
    window.dispatchEvent(new CustomEvent('orderConfirm:open', { 
      detail: {
        orderId,
        orderNumber,
        status,
        total,
        products,
        paymentMethod,
        address,
        contact,
        dateCompleted
      }
    }));
    
    if (onShowDetail) {
      onShowDetail();
    }
  };

  const renderStatus = () => {
    switch (currentStatus) {
      case OrderStatus.PROCESSING:
        return (
          <div className="px-2 sm:px-3 py-[2px] sm:py-1 rounded-[8px] text-[9px] sm:text-[12px] font-semibold bg-[#FFFBD1] text-[#CA8A04]">
            Sedang diproses
          </div>
        );
      case OrderStatus.SHIPPED:
        return (
          <div className="px-2 sm:px-3 py-[2px] sm:py-1 rounded-[8px] text-[9px] sm:text-[12px] font-semibold bg-[#FFE9D6] text-[#EA580C]">
            Dikirim
          </div>
        );
      case OrderStatus.COMPLETED:
        return (
          <div className="px-2 sm:px-3 py-[2px] sm:py-1 rounded-[8px] text-[9px] sm:text-[12px] font-semibold bg-[#DEF7EC] text-[#047857]">
            Pesanan selesai
          </div>
        );
      case OrderStatus.CANCELED:
        return (
          <div className="px-2 sm:px-3 py-[2px] sm:py-1 rounded-[8px] text-[9px] sm:text-[12px] font-semibold bg-[#FFE6E6] text-[#DC2626]">
            Dibatalkan
          </div>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (currentStatus) {
      case OrderStatus.PROCESSING:
        return (
          <div className="mt-3 flex justify-end gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenCancelPopup(true);
              }}
              className="rounded-[10px] sm:rounded-[13px] bg-red-100 text-red-500 px-3 sm:px-4 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-red-200 transition-all"
            >
              Batalkan pesanan
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShowDetail();
              }}
              className="rounded-[10px] sm:rounded-[13px] bg-green-600 text-white px-3 sm:px-4 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-700 transition-all"
            >
              Lihat detail
            </button>
          </div>
        );
      case OrderStatus.SHIPPED:
        return (
          <div className="mt-3 flex justify-end gap-2 sm:gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenFinishPopup(true);
              }}
              disabled={loading}
              className="rounded-[10px] sm:rounded-[13px] bg-green-100 text-green-600 px-3 sm:px-4 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-200 transition-all disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Selesaikan pesanan"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShowDetail();
              }}
              className="rounded-[10px] sm:rounded-[13px] bg-green-600 text-white px-3 sm:px-4 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-700 transition-all"
            >
              Lihat detail
            </button>
          </div>
        );
      case OrderStatus.CANCELED:
        return (
          <div className="mt-3 text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/katalog/detail?id=${products[0]?.id}`);
              }}
              className="rounded-[10px] sm:rounded-[13px] bg-green-600 text-white px-3 sm:px-4 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-700 transition-all"
            >
              Beli lagi
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case OrderStatus.PROCESSING:
        return "Pesanan anda sedang kami siapkan";
      case OrderStatus.SHIPPED:
        return "Pesanan sedang diantar oleh kurir";
      case OrderStatus.COMPLETED:
        return "Pesanan telah tiba dan diterima customer";
      case OrderStatus.CANCELED:
        return "Pesanan dibatalkan oleh Anda";
      default:
        return "";
    }
  };

  return (
    <>
      <div
        className={`border border-gray-300 p-3 sm:p-5 rounded-2xl relative transition-all duration-300 group font-jakarta
          ${currentStatus === OrderStatus.CANCELED ? "opacity-95" : ""}
          hover:border-green-500 hover:shadow-sm text-[12px] sm:text-[14px]`}
        style={{ animationDelay: `${700 + index * 200}ms` }}
      >
        {/* Header nomor pesanan & status */}
        <div className="flex flex-wrap items-center justify-between mb-3 sm:mb-4">
        <div className="text-[10px] sm:text-[14px] font-bold text-[#1B1F1B]">
          No Pesanan : <span className="text-black">#INV {orderNumber}</span>
        </div>
        {renderStatus()}
      </div>

        {/* Produk */}
        <div className="space-y-2 sm:space-y-3">
          {products.length > 0 ? (
            products.map((product: OrderProduct) => (
              <div key={product.id} className="flex items-center gap-2 sm:gap-3">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="h-[50px] w-[50px] sm:h-[58px] sm:w-[58px] rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="text-[12px] sm:text-[13px] font-medium text-black">
                    {product.name}
                  </div>
                  <div className="mt-1 text-[11px] sm:text-[12px] text-gray-500">
                    Qty: x{product.qty}
                  </div>
                </div>

                {currentStatus === OrderStatus.COMPLETED ? (
                  <div className="flex flex-row gap-2 items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRating(product);
                      }}
                      className="rounded-lg border border-green-600 text-green-600 px-3 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-50 transition-all"
                    >
                      Beri rating
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/katalog/detail?id=${product.id}`);
                      }}
                      className="rounded-lg bg-green-600 text-white px-3 py-1 text-[11px] sm:text-[12px] font-semibold hover:bg-green-700 transition-all"
                    >
                      Beli lagi
                    </button>
                  </div>
                ) : (
                  <div className="text-[13px] sm:text-[14px] font-medium text-black">
                    {product.price}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              Tidak ada produk
            </div>
          )}
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Status pengiriman & total */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[12px] sm:text-[13px]">
          <div className="flex items-center gap-2">
            {currentStatus !== OrderStatus.CANCELED && (
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            )}
            <span className="text-green-600">{getStatusMessage()}</span>
          </div>
          <div className="text-[13px] sm:text-[14px] font-bold text-black mt-1 sm:mt-0">
            Total pesanan : {total}
          </div>
        </div>

        {renderButtons()}
      </div>

      {/* Popup Pembatalan */}
      {openCancelPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-3">
          <div className="bg-white w-full max-w-sm rounded-xl p-5 shadow-xl text-center">
            <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
              Batalkan pesanan?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin ingin membatalkan pesanan ini?
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
                onClick={() => setOpenCancelPopup(false)}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold rounded-lg h-10 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Tidak
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg h-10 transition disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Iya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Selesaikan Pesanan */}
      {openFinishPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-3">
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

      {/* Form Rating */}
      {openRating && (
        <FormRating
          open={!!openRating}
          onClose={() => setOpenRating(null)}
          orderNumber={orderNumber}
          product={openRating}
        />
      )}
    </>
  );
};

export default CardOrder;