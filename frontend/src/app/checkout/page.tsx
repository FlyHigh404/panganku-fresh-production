"use client";
import { useState, useEffect } from "react";
import { Home, MapPin, Package } from "lucide-react";
import DaftarAlamat from "@/components/DaftarAlamat";
import { Alamat } from "@/types/alamat";
import CheckoutNavbar from "@/components/NavCheckout";
import OrderConfirm from "@/components/OrderConfirm";
import { OrderStatus, PaymentMethod } from "@/types/order";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import useOrderSocket from "@/hooks/useOrderSocket";
import AuthCheck from "@/components/AuthCheck";
import { transformOrder } from "@/lib/transformOrder";
import Link from "next/link";

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [openOrderConfirm, setOpenOrderConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.COD
  );
  const [alamatAktif, setAlamatAktif] = useState<Alamat | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [openAlamat, setOpenAlamat] = useState(false);
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);
  const [ongkir, setOngkir] = useState(0);
  const [isEstimating, setIsEstimating] = useState(false);
  
  const diskon = 0;
  const totalAmount = Number(order?.totalAmount) || 0;
  const totalQuantity =
    order?.orderItems?.reduce((total: number, item: any) => {
      return total + item.quantity;
    }, 0) || 0;
  const productTotal =
    order?.orderItems?.reduce(
      (sum: number, item: any) => sum + Number(item.unitPrice) * item.quantity,
      0
    ) || 0;

  const subTotal = productTotal;

  const totalPembayaran = productTotal + ongkir - diskon

  useOrderSocket(order?.id, (status) => {
    if (status === "PROCESSING") {
      setQrisUrl(null);
      setOrder((prev: any) => ({
        ...prev,
        status: "PROCESSING",
        paymentMethod: paymentMethod
      }));

      fetchOrderData();

      setOpenOrderConfirm(true);
    } else if (status === "CANCELED") {
      setQrisUrl(null);
      alert("Pembayaran gagal atau dibatalkan ❌");

      setOrder((prev: any) => ({
        ...prev,
        status: "CANCELED"
      }));
    }
  });

  const fetchOrderData = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart?orderId=${order.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error fetching updated order:", error);
    }
  };

  const estimateShippingCost = async () => {
    if (!alamatAktif?.catatan) return;
  
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/shipping/estimate?addressId=${alamatAktif.id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOngkir(data.shippingCost);
        console.log(`Ongkir: `, ongkir)
        
        setOrder((prev: any) => ({
          ...prev,
          shippingCost: data.shippingCost
        }));
      }
    } catch (error) {
      console.error("Shipping estimation failed:", error);
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const token = localStorage.getItem('token');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const searchParams = new URLSearchParams(window.location.search);
        const orderId = searchParams.get("orderId");
        setLoading(true);
        const [cartResponse, addressResponse] = await Promise.all([
          fetch(`${baseUrl}/app/api/cart${orderId ? `?orderId=${orderId}` : ""}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
          fetch(`${baseUrl}/app/api/profile/address-primary`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
        ]);

        if (!cartResponse.ok || !addressResponse.ok) {
          throw new Error("Failed to fetch checkout data");
        }

        const cartData = await cartResponse.json();
        const addressData = await addressResponse.json();

        setOrder(cartData);
        setAlamatAktif(addressData);
      } catch (error) {
        console.error("Error fetching checkout data:", error);
        setOrder(null);
        setAlamatAktif(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, []);

  useEffect(() => {
    if (alamatAktif?.id) {
      estimateShippingCost();
    }
  }, [alamatAktif?.id]);

  const processCheckout = async () => {
    const token = localStorage.getItem('token');

    if (!alamatAktif?.id) {
      alert("Silakan pilih alamat pengiriman terlebih dahulu");
      return;
    }

    try {
      setProcessingCheckout(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart/checkout?orderId=${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process checkout");
      }

      if (paymentMethod === PaymentMethod.QRIS && result.midtrans?.qrisUrl) {
        setOrder((prev: any) => ({
          ...prev,
          paymentMethod: PaymentMethod.QRIS,
          status: "PENDING"
        }));
        setQrisUrl(result.midtrans.qrisUrl);
        return;
      }

      if (paymentMethod === PaymentMethod.COD) {
        const transformedOrder = transformOrder(result, alamatAktif);
        console.log("Transformed order:", transformedOrder);
        console.log("=== ORDER CONFIRM DEBUG ===");
        console.log("Transformed products:", transformedOrder.products);
        console.log("First product structure:", transformedOrder.products[0]);
        console.log(
          "Product keys:",
          transformedOrder.products[0] &&
          Object.keys(transformedOrder.products[0])
        );
        console.log("=== END DEBUG ===");

        setOrder(transformedOrder);
        setOpenOrderConfirm(true);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat memproses checkout");
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10" style={{ color: '#26A81D' }} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Pesanan Tidak Ditemukan
          </h1>

          <p className="text-gray-600 mb-8">
            Maaf, data pesanan tidak ditemukan atau telah kadaluarsa.
            Silakan mulai pesanan baru dari beranda.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#26A81D' }}
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!alamatAktif) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10" style={{ color: '#26A81D' }} />
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Alamat Belum Ditambahkan
          </h1>

          <p className="text-gray-600 mb-8">
            Anda belum memiliki alamat pengiriman.
            Silakan tambahkan alamat terlebih dahulu untuk melanjutkan checkout.
          </p>

          <div className="space-y-3">
            <Link
              href="/profil/alamat"
              className="inline-flex items-center justify-center gap-2 w-full text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#26A81D' }}
            >
              <MapPin className="w-5 h-5" />
              Tambah Alamat
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
            >
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthCheck role="CUSTOMER">
      <div className="min-h-screen bg-gray-100 max-sm:bg-gray-100 flex flex-col">
        <CheckoutNavbar />

        {/* ======== ISI CHECKOUT ========= */}
        <div className="p-6 max-w-6xl mx-auto flex-1 w-full pb-24 md:pb-6">
          <h1 className="text-lg font-bold mb-3">Checkout Produk</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kolom Kiri */}
            <div className="md:col-span-2 space-y-3">
              {/* Alamat Pengiriman */}
              <div className="bg-white shadow rounded-xl p-4 max-sm:shadow-none max-sm:rounded-none max-sm:border-b border-gray-200 relative overflow-hidden">
                <h2 className="font-bold text-xs text-[#8F8F8F] mb-2">
                  ALAMAT PENGIRIMAN
                </h2>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <p className="font-medium text-xs text-[#8F8F8F]">
                      {alamatAktif.recipientName}
                    </p>
                    {alamatAktif.isPrimary && (
                      <span className="bg-green-100 text-green-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        Utama
                      </span>
                    )}
                  </div>
                  {/* <button
                    className="text-green-600 text-xs font-semibold hover:underline"
                    onClick={() => setOpenAlamat(true)}
                  >
                    Edit
                  </button> */}
                </div>

                <div className="pl-6 mt-1">
                  <p className="font-medium text-xs text-black">
                    {alamatAktif.recipientName}
                    <span className="after:content-['|'] after:mx-1 text-[#8F8F8F]"></span>
                    <span className="text-[#8F8F8F]">
                      {alamatAktif.phoneNumber}
                    </span>
                  </p>
                  <p className="text-[11px] text-[#8F8F8F]">
                    {alamatAktif.fullAddress}
                  </p>
                </div>

                {/* Strip Hijau-Oren */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1 md:mb-0 rounded-b-xl"
                  style={{
                    backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      #F97316 0 18px,     
                      white 18px 20px,    
                      #22C55E 20px 38px,  
                      white 38px 40px     
                    )
                  `,
                  }}
                />
              </div>

              {/* Daftar Produk */}
              {order?.orderItems?.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className="bg-white shadow rounded-xl p-3 max-sm:shadow-none max-sm:rounded-none border-gray-200"
                >
                  <h3 className="text-xs font-semibold mb-2">
                    Pesanan {idx + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        item.product?.imageUrl?.[0] ||
                        "/placeholder-product.png"
                      }
                      alt={item.product?.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-xs">
                        {item.product?.name}
                      </p>
                      <p className="text-green-600 text-[10px]">
                        qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-xs">
                      {item.quantity} x Rp
                      {Number(item.unitPrice).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}

              {/* Metode Pembayaran - Mobile */}
              <div className="md:hidden bg-white p-3 mt-3">
                <h2 className="font-semibold text-sm mb-2">
                  Metode Pembayaran
                </h2>
                <div className="text-xs space-y-3">
                  <label className="flex items-center justify-between cursor-pointer p-2 max-sm:border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <img
                        src="/qris.svg"
                        alt="QRIS"
                        className="w-6 h-6 object-contain"
                      />
                      <span>QRIS</span>
                    </div>
                    <input
                      type="radio"
                      name="payment-mobile"
                      value={PaymentMethod.QRIS}
                      checked={paymentMethod === PaymentMethod.QRIS}
                      onChange={() => setPaymentMethod(PaymentMethod.QRIS)}
                      className="w-3 h-3 accent-green-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer max-sm:border-b border-gray-200 p-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/cod.svg"
                        alt="COD"
                        className="w-6 h-6 object-contain"
                      />
                      <span>COD</span>
                    </div>
                    <input
                      type="radio"
                      name="payment-mobile"
                      value={PaymentMethod.COD}
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={() => setPaymentMethod(PaymentMethod.COD)}
                      className="w-3 h-3 accent-green-600"
                    />
                  </label>
                </div>
              </div>

              {/* Ringkasan Pembayaran - Mobile */}
              <div className="md:hidden bg-white p-3 mt-3">
                <h2 className="font-semibold text-sm mb-2">
                  Ringkasan Pembayaran
                </h2>

                <div className="pt-1 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Total harga ({totalQuantity} Produk)</span>
                    <span>Rp{subTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Potongan Diskon</span>
                    <span>-Rp{diskon.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    {isEstimating ? (
                      <span className="animate-pulse bg-gray-200 h-4 w-20 rounded"></span>
                    ) : (
                      <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm w-full mt-2">
                  <span>Total Pembayaran</span>
                  <span>Rp{totalPembayaran.toLocaleString("id-ID")}</span>
                </div>

                {/* 5. Tombol konfirmasi - mobile */}
                <div className="md:hidden p-4 mt-3 sticky bottom-0 z-10">
                  <button
                    onClick={processCheckout}
                    disabled={
                      processingCheckout ||
                      !order?.orderItems?.length ||
                      !alamatAktif
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-lg font-semibold w-full disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    {processingCheckout ? "Memproses..." : "Konfirmasi Pesanan"}
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Tombol konfirmasi - mobile */}
            <div className="md:hidden bg-white p-4 mt-3 sticky bottom-0 z-10 border-t border-gray-200 shadow-lg">
              <button
                onClick={processCheckout}
                disabled={
                  processingCheckout ||
                  !order?.orderItems?.length ||
                  !alamatAktif
                }
                className="bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-lg font-semibold w-full disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {processingCheckout ? "Memproses..." : "Konfirmasi Pesanan"}
              </button>
            </div>

            {/* Kolom Kanan - Desktop */}
            <div className="hidden md:block">
              <div className="bg-white shadow rounded-xl p-4 space-y-3 border border-gray-200">
                <h2 className="font-semibold text-sm mb-1">
                  Metode Pembayaran
                </h2>
                <div className="text-xs">
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <div className="flex items-center gap-2">
                      <img
                        src="/qris.svg"
                        alt="QRIS"
                        className="w-6 h-6 object-contain"
                      />
                      <span>QRIS</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value={PaymentMethod.QRIS}
                      checked={paymentMethod === PaymentMethod.QRIS}
                      onChange={() => setPaymentMethod(PaymentMethod.QRIS)}
                      className="w-3 h-3 accent-green-600"
                    />
                  </label>

                  <hr className="border-gray-200 my-2" />

                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <div className="flex items-center gap-2">
                      <img
                        src="/cod.svg"
                        alt="COD"
                        className="w-6 h-6 object-contain"
                      />
                      <span>COD</span>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value={PaymentMethod.COD}
                      checked={paymentMethod === PaymentMethod.COD}
                      onChange={() => setPaymentMethod(PaymentMethod.COD)}
                      className="w-3 h-3 accent-green-600"
                    />
                  </label>
                </div>

                {/* Detail Pembayaran */}
                <div className="pt-2 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Total harga ({totalQuantity} Produk)</span>
                    <span>Rp{subTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Potongan Diskon</span>
                    <span>-Rp{diskon.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span>Rp{ongkir.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-sm w-full">
                  <span>Total Pembayaran</span>
                  <span>Rp{totalPembayaran.toLocaleString("id-ID")}</span>
                </div>
                <button
                  onClick={processCheckout}
                  disabled={
                    processingCheckout ||
                    !order?.orderItems?.length ||
                    !alamatAktif
                  }
                  className="bg-green-600 text-white px-6 h-11 rounded-lg text-medium font-semibold w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processingCheckout ? "Memproses..." : "Konfirmasi"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="hidden md:block">
          <Footer />
        </div>

        {/* Modal Daftar Alamat */}
        <DaftarAlamat
          open={openAlamat}
          setOpen={setOpenAlamat}
          onSelectAlamat={(alamat: Alamat) => {
            setAlamatAktif(alamat);
          }}
        />

        {/* Modal QRIS */}
        {qrisUrl && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Scan QRIS untuk Pembayaran
                </h2>
                <p>{qrisUrl}</p>
                <button
                  onClick={() => setQrisUrl(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-center mb-4">
                <img
                  src={qrisUrl}
                  alt="QRIS"
                  className="w-64 h-64 rounded-lg border border-gray-200 object-contain"
                />
                <h1>{qrisUrl}</h1>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4">
                Scan QR code di atas untuk menyelesaikan pembayaran
              </p>

              <button
                onClick={() => setQrisUrl(null)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Order Confirm Modal - FIXED */}
        {openOrderConfirm && order && (
          <OrderConfirm
            open={openOrderConfirm}
            onClose={() => {
              setOpenOrderConfirm(false);
              if (paymentMethod === PaymentMethod.COD) {
                router.push("/profil/riwayat-transaksi");
              }
            }}
            orderNumber={order.orderNumber || `#INV-${order?.id?.toString().padStart(4, "0")}`}
            status={order.status}
            paymentMethod={order.paymentMethod || paymentMethod}
            products={
              // 🔥 PRIORITASKAN order.products DARI TRANSFORMORDER
              order.products && order.products.length > 0
                ? order.products
                : order?.orderItems?.map((item: any) => ({
                  id: item.productId || item.id,
                  name: item.product?.name || "Produk",
                  qty: item.quantity || 0,
                  price: `Rp${Number(item.unitPrice || 0).toLocaleString(
                    "id-ID"
                  )}`,
                  image:
                    item.product?.imageUrl?.[0] || "/placeholder-product.png",
                })) || []
            }
            total={
              order.total ||
              `Rp${Number(order.totalAmount || totalPembayaran).toLocaleString(
                "id-ID"
              )}`
            }
            address={
              order.address || {
                id: alamatAktif?.id || "",
                nama: alamatAktif?.recipientName || "Nama tidak tersedia",
                telp: alamatAktif?.phoneNumber || "Telepon tidak tersedia",
                alamat: alamatAktif?.fullAddress || "Alamat tidak tersedia",
                utama: alamatAktif?.isPrimary || false,
              }
            }
            contact={
              order.contact ||
              `${alamatAktif?.recipientName || ""} | ${alamatAktif?.phoneNumber || ""
                }`.trim()
            }
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default CheckoutPage;
