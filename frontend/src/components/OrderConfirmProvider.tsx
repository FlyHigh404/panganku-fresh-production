// components/OrderConfirmProvider.tsx - YANG DIPERBAIKI
"use client";
import { useEffect, useState } from "react";
import OrderConfirm from "./OrderConfirm";

export default function OrderConfirmProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openOrderConfirm, setOpenOrderConfirm] = useState(false);

  useEffect(() => {
    const handleOrderConfirmOpen = (event: CustomEvent) => {
      console.log("🟢 OrderConfirmProvider: Event diterima", event.detail);
      setSelectedOrder(event.detail);
      setOpenOrderConfirm(true);
      
      // Dispatch event untuk memberi tahu layout bahwa modal terbuka
      window.dispatchEvent(new CustomEvent('global:orderConfirmOpen'));
    };

    const handleOrderConfirmClose = () => {
      console.log("🔴 OrderConfirmProvider: Menutup modal");
      setOpenOrderConfirm(false);
      setSelectedOrder(null);
      window.dispatchEvent(new CustomEvent('global:orderConfirmClose'));
    };

    window.addEventListener('orderConfirm:open', handleOrderConfirmOpen as EventListener);
    window.addEventListener('orderConfirm:close', handleOrderConfirmClose);

    return () => {
      window.removeEventListener('orderConfirm:open', handleOrderConfirmOpen as EventListener);
      window.removeEventListener('orderConfirm:close', handleOrderConfirmClose);
    };
  }, []);

  const handleClose = () => {
    setOpenOrderConfirm(false);
    setSelectedOrder(null);
    window.dispatchEvent(new CustomEvent('global:orderConfirmClose'));
  };

  return (
    <>
      {children}
      <OrderConfirm
        open={openOrderConfirm}
        onClose={handleClose}
        orderId={selectedOrder?.id} 
        orderNumber={selectedOrder?.orderNumber || ""}
        status={selectedOrder?.status}
        paymentMethod={selectedOrder?.paymentMethod}
        products={selectedOrder?.products || []}
        total={selectedOrder?.total || ""}
        address={selectedOrder?.address}
        contact={selectedOrder?.contact}
      />
    </>
  );
}