"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Sedang proses", href: "/profil/riwayat-transaksi/transaksi-diproses" },
  { label: "Dikirim", href: "/profil/riwayat-transaksi/transaksi-dikirim" },
  { label: "Selesai", href: "/profil/riwayat-transaksi/transaksi-selesai" },
  { label: "Dibatalkan", href: "/profil/riwayat-transaksi/transaksi-dibatalkan" },
];

export default function TabRiwayat() {
  const pathname = usePathname();

  return (
    <div className="flex w-full text-center p-2 md:p-3 mb-4 md:mb-6 -mt-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-2 text-xs md:text-sm font-semibold ${
              isActive
                ? "text-green-600 border-b-2 border-green-600"
                : "text-gray-300 border-b-1 hover:text-gray-400"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}