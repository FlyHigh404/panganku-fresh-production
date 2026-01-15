import React, { useState } from 'react';

interface SalesData {
  month?: string;
  day?: string;
  year: number;
  sales: number;
}

interface GrafikProps {
  salesData: SalesData[];
  filterAktif: 'bulan' | 'minggu';
  onFilterChange: (filter: 'bulan' | 'minggu') => void;
}

const Grafik: React.FC<GrafikProps> = ({ 
  salesData = [], 
  filterAktif, 
  onFilterChange 
}) => {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Cari nilai maksimum untuk skala Y-axis dan kali 2 agar tooltip terlihat
  const actualMaxSales = Math.max(...salesData.map(data => data.sales), 100000);
  const maxSales = actualMaxSales * 2;
  
  // Format angka ke Rupiah
  const formatRupiah = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}Jt`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}Rb`;
    }
    return value.toString();
  };

  // Format angka lengkap untuk tooltip
  const formatRupiahFull = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Generate Y-axis labels berdasarkan max sales
  const generateYAxisLabels = () => {
    const labels = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      labels.push(Math.round((maxSales / steps) * (steps - i)));
    }
    return labels;
  };

  const yAxisLabels = generateYAxisLabels();
  const dataTampil = salesData;
  
  // Hitung min-width berdasarkan jumlah data
  const minChartWidth = dataTampil.length * 60;

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Grafik Penjualan</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterAktif === 'bulan' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onFilterChange('bulan')}
          >
            Bulan
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              filterAktif === 'minggu' 
                ? 'bg-white text-gray-800 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onFilterChange('minggu')}
          >
            Minggu
          </button>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex" style={{ minWidth: `${minChartWidth + 64}px` }}>
          {/* Y-Axis Labels */}
          <div className="w-16 flex-shrink-0 pr-2 bg-white">
            <div className="h-64 md:h-72 flex flex-col justify-between text-right">
              {yAxisLabels.map((label, index) => (
                <div key={`${label}-${index}`} className="text-xs text-gray-500 -mt-2 first:mt-0">
                  {formatRupiah(label)}
                </div>
              ))}
            </div>
          </div>

          {/* Chart Area Wrapper */}
          <div className="flex-1">
            {/* Chart Area */}
            <div className="relative" style={{ minWidth: `${minChartWidth}px` }}>
              {/* Bottom border line only */}
              <div className="absolute bottom-0 left-0 right-0 border-b border-gray-300"></div>

              {/* Bars Container */}
              <div className="h-64 md:h-72 flex items-end justify-around gap-2 px-2 relative z-10">
                {dataTampil.map((data, index) => {
                  const barHeight = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
                  const hasData = data.sales > 0;
                  
                  return (
                    <div
                      key={data.month || data.day || index}
                      className="relative w-12 flex flex-col items-center h-full justify-end group"
                    >
                      {/* Tooltip */}
                      {activeBarIndex === index && (
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg px-3 py-2 shadow-lg whitespace-nowrap z-20 pointer-events-none"
                          style={{ 
                            bottom: hasData ? `calc(${barHeight}% + 12px)` : '12px',
                            minWidth: '180px'
                          }}
                        >
                          <div className="text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              <span className="font-semibold">{data.month || data.day} {data.year}</span>
                            </div>
                            <div className="text-left">
                              Total Penjualan:
                            </div>
                            <div className="font-bold text-sm text-green-400">
                              {formatRupiahFull(data.sales)}
                            </div>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>
                      )}
                      
                      {/* Bar */}
                      <div 
                        className={`w-full rounded-t transition-all cursor-pointer ${
                          hasData 
                            ? 'bg-green-400 hover:bg-green-500' 
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        style={{ 
                          height: hasData ? `${barHeight}%` : '4px',
                          minHeight: '4px'
                        }}
                        onMouseEnter={() => setActiveBarIndex(index)}
                        onMouseLeave={() => setActiveBarIndex(null)}
                        onTouchStart={() => setActiveBarIndex(index)}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-around text-xs text-gray-500 px-2 mt-2" style={{ minWidth: `${minChartWidth}px` }}>
              {dataTampil.map((data, index) => (
                <div key={data.month || data.day || index} className="w-12 text-center">
                  {data.month || data.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grafik;