// app/profil/riwayat-transaksi/layout.tsx - Layout KHUSUS untuk riwayat transaksi
"use client";

import OrderConfirm from "@/components/OrderConfirm";
import React, { useState } from "react";

export default function RiwayatTransaksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openOrderConfirm, setOpenOrderConfirm] = useState(false);

  console.log("🟡 RiwayatTransaksiLayout mounted");

  const handleShowOrderConfirm = (order: any) => {
    console.log("🟢 RiwayatTransaksiLayout menerima order:", order);
    setSelectedOrder(order);
    setOpenOrderConfirm(true);
  };

  const handleCloseOrderConfirm = () => {
    setOpenOrderConfirm(false);
    setSelectedOrder(null);
  };

  // Clone children dengan prop
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        onShowOrderConfirm: handleShowOrderConfirm,
      } as any);
    }
    return child;
  });

  return (
    <>
      {childrenWithProps}

      {/* OrderConfirm - di level riwayat transaksi */}
      {selectedOrder && (
        <OrderConfirm
          open={openOrderConfirm}
          onClose={handleCloseOrderConfirm}
          orderNumber={selectedOrder.orderNumber} 
          status={selectedOrder.status}
          paymentMethod={selectedOrder.paymentMethod}
          products={selectedOrder.products} 
          total={selectedOrder.total}
          address={selectedOrder.address} 
          contact={selectedOrder.contact} 
        />
      )}
    </>
  );
}