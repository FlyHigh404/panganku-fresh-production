export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pesanan ditunda",
  [OrderStatus.PROCESSING]: "Sedang diproses",
  [OrderStatus.SHIPPED]: "Dikirim",
  [OrderStatus.COMPLETED]: "Selesai",
  [OrderStatus.CANCELED]: "Dibatalkan",
};


export enum PaymentMethod {
  COD = "COD",
  QRIS = "QRIS",
}

export interface OrderProduct {
  id: string;
  name: string;
  price: string | number;
  qty: number;
  image: string;
}
