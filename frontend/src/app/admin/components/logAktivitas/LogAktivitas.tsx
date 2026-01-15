import React from 'react';

type ActivityLogEntry = {
  time: string;
  activity: string;
  type: string;
};

const activityLogs: ActivityLogEntry[] = [
  { time: '2 Menit lalu', activity: 'Pesanan #INV-0015 dibuat oleh Budi Santoso - Total Rp 350.000', type: 'Update Pesanan' },
  { time: '5 Menit lalu', activity: 'Status Pesanan #INV-0012 diubah menjadi Dikirim', type: 'Update Pesanan' },
  { time: '1 Jam lalu', activity: 'Produk Minyak Goreng Sunco stok bertambah 50 unit', type: 'Update Produk' },
  { time: '4 Jam lalu', activity: 'Kategori Sembako telah berhasil ditambahkan', type: 'Update Kategori' },
  { time: '10 Jam lalu', activity: 'Pembayaran QRIS untuk Pesanan #INV-0010 berhasil diterima', type: 'Update Notifikasi' },
  { time: '1 Hari lalu', activity: 'Produk Beras Ramos 5kg ditambahkan ke katalog', type: 'Update Produk' },
  { time: '1 Hari lalu', activity: 'Pesanan #INV-0010 dikonfirmasi selesai', type: 'Update Pesanan' },
  { time: '1 Hari lalu', activity: 'Stok Telur Ayam 1kg diupdate menjadi 100 unit', type: 'Update Produk' },
];

const getTypeStyle = (type: string): string => {
  switch (type) {
    case 'Update Pesanan':
      return 'bg-green-50 text-green-800 border border-green-200';
    case 'Update Produk':
      return 'bg-orange-50 text-orange-800 border border-orange-200';
    case 'Update Kategori':
      return 'bg-blue-50 text-blue-800 border border-blue-200';
    case 'Update Notifikasi':
      return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    default:
      return 'bg-gray-50 text-gray-800 border border-gray-200';
  }
};

const ActivityLogCard: React.FC = () => {
  return (
     <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden w-full p-6">
      {/* Header */}
      <div className="pb-5 mb-6 border-b border-dashed border-gray-300">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Log Aktivitas Terakhir</h2>
        <p className="text-gray-600 text-sm">Ini adalah daftar aktivitas terbaru.</p>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-4 mb-4 px-2 py-3 bg-gray-50 rounded-lg">
        <div className="md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          WAKTU
        </div>
        <div className="md:col-span-7 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          AKTIVITAS
        </div>
        <div className="md:col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right pr-32">
          TIPE AKTIVITAS
        </div>
      </div>

      {/* Log Entries */}
      <div className="space-y-3">
        {activityLogs.map((log, index) => (
          <React.Fragment key={index}>
            {/* Mobile Layout */}
            <div className="block md:hidden bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500 font-medium">{log.time}</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(log.type)}`}>
                    {log.type}
                  </span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">{log.activity}</p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:px-2 md:py-4 md:items-center hover:bg-gray-50 rounded-xl transition-colors duration-200 border-b border-gray-100 last:border-b-0">
              <div className="md:col-span-2 text-sm text-gray-600 font-medium">
                {log.time}
              </div>
              <div className="md:col-span-7 text-sm text-gray-900">
                {log.activity}
              </div>
              <div className="md:col-span-3 text-center pr-24">
                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeStyle(log.type)}`}>
                  {log.type}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Empty State */}
      {activityLogs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400">
            <p className="text-lg font-medium mb-1">Tidak ada aktivitas</p>
            <p className="text-sm">Log aktivitas akan muncul di sini</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogCard;