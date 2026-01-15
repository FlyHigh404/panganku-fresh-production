"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RiwayatTransaksiPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profil/riwayat-transaksi/transaksi-diproses");
  }, [router]);

  return null;
}