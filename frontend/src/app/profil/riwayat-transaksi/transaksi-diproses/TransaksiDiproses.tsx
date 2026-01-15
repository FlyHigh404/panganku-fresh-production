// app/profil/riwayat-transaksi/transaksi-diproses/page.tsx
"use client"
import CardOrder from "@/components/CardOrder";
import TabRiwayat from "@/components/TabRiwayat";
import { transformOrder } from "@/lib/transformOrder";
import { OrderStatus } from "@prisma/client";
import { useEffect, useState } from "react";

interface TransaksiDiprosesPageProps {
  onShowOrderConfirm?: (order: any) => void;
}

export default function TransaksiDiprosesPage({
  onShowOrderConfirm
}: TransaksiDiprosesPageProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [alamatAktif, setAlamatAktif] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const [ordersRes, addressRes] = await Promise.all([
          fetch(`${baseUrl}/app/api/profile/riwayat-transaksi`, {
            cache: "no-store", headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
          fetch(`${baseUrl}/app/api/profile/address-primary`, {
            cache: "no-store", headers: {
              "Authorization": `Bearer ${token}`
            }
          })
        ]);

        if (!ordersRes.ok || !addressRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const ordersData = await ordersRes.json();
        const addressData = await addressRes.json();

        // Filter orders
        const filtered = ordersData.filter((o: any) => o.status === OrderStatus.PROCESSING);
        const transformedOrders = filtered.map((order: any) =>
          transformOrder(order, addressData)
        );

        setOrders(transformedOrders);
        setAlamatAktif(addressData);
      } catch (error) {
        console.error("Error fetching data:", error);
        const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/riwayat-transaksi`, {
          cache: "no-store", headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const ordersData = await ordersRes.json();
        const filtered = ordersData.filter((o: any) => o.status === OrderStatus.PROCESSING);
        const transformedOrders = filtered.map((order: any) => transformOrder(order));
        setOrders(transformedOrders);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowOrderConfirm = (order: any) => {
    if (onShowOrderConfirm) {
      onShowOrderConfirm(order); // Panggil parent function dari layout
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl bg-white p-4 font-jakarta rounded-[15px] shadow-md">
        <TabRiwayat />
        <div className="flex justify-center items-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl bg-white p-4 font-jakarta rounded-[15px] shadow-md">
      <TabRiwayat />

      {orders.length === 0 ? (
        <div className="p-4 text-center">
          <img src="/bgcart.png" alt="Kosong" className="mx-auto w-32 h-32 mb-2" />
          <h2 className="text-md font-semibold text-gray-800 mb-1">Tidak ada transaksi</h2>
          <p className="text-sm text-gray-500">Belum ada pesanan diproses</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {orders.map((order, index) => (
            <div key={order.orderNumber || index}>
              <CardOrder
                index={index}
                orderId={order.id}
                orderNumber={order.orderNumber}
                status={order.status}
                total={order.total}
                products={order.products}
                paymentMethod={order.paymentMethod}
                address={order.address}
                contact={order.contact}
                dateCompleted={order.dateCompleted}
                onShowDetail={() => handleShowOrderConfirm(order)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}