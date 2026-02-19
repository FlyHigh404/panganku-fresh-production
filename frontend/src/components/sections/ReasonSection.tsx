"use client"
import type React from "react"

const reasons = [
  { icon: "/monstera.png", title: "Fresh", desc: "Langsung dari petani lokal, kesegaran dan kualitas terjamin" },
  { icon: "/heart-tick.png", title: "Sehat", desc: "Pilihan produk terbaik untuk gaya hidup sehat Anda dan keluarga" },
  { icon: "/medal-star.png", title: "Produk Berkualitas", desc: "Kami hanya menyediakan produk pilihan dengan mutu terbaik dan terjamin" },
  { icon: "/truckwhy.png", title: "Pengiriman Cepat", desc: "Layanan cepat dan aman, produk sampai di tangan Anda dalam kondisi terbaik" },
  { icon: "/boxwhy.png", title: "Ribuan Produk", desc: "Temukan semua kebutuhan pokok Anda dalam satu tempat" },
  { icon: "/Vectorwhy.png", title: "Harga Terjangkau", desc: "Harga kompetitif dan terjangkau untuk kebutuhan pokok harian Anda" },
]

const ReasonSection: React.FC = () => {
  return (
    <section className="relative py-12 md:py-16 bg-white">
      <div className="container mx-auto px-2 text-center">
        {/* Judul */}
        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-green-600 mb-10 md:mb-12">
          Mengapa Berbelanja di Panganku Fresh ?
        </h2>

        
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 scale-90 sm:scale-95 md:scale-100">
          {/* Kiri */}
          <div className="flex flex-col space-y-6 w-1/3 pr-1 md:pr-12">
            {reasons.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className={`text-left animate-fade-float-left ${
                  idx === 0
                    ? "ml-4 md:ml-20 mt-0"
                    : idx === 1
                    ? "ml-2 md:ml-8 mt-6 md:mt-12"
                    : "ml-4 md:ml-20 mt-8 md:mt-20"
                }`}
                style={{ animationDelay: `${200 * (idx + 1)}ms` }}
              >
                <h3 className="text-green-600 font-medium text-[14px] md:text-lg flex items-center justify-start gap-2">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-5 h-5 md:w-7 md:h-7 object-contain"
                  />
                  {item.title}
                </h3>
                <p className="text-gray-600 text-[12px] md:text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tengah */}
          <div className="relative w-1/3 flex justify-center items-end md:scale-110 md:z-20">
            <img
              src="/LogoWhy.png"
              alt="Logo Why"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] sm:w-[200px] md:w-[360px] z-0"
            />
            <img
              src="/buahwhy.png"
              alt="Buah Why"
              className="relative z-10 w-[160px] sm:w-[220px] md:w-[380px] animate-float-left mt-18 md:mt-45"
            />
          </div>

          {/* Kanan */}
          <div className="flex flex-col space-y-6 w-1/3 pl-1 md:pl-12">
            {reasons.slice(3).map((item, idx) => (
              <div
                key={idx}
                className={`text-right animate-fade-float-right ${
                  idx === 0
                    ? "mr-4 md:mr-20 mt-0"
                    : idx === 1
                    ? "mr-2 md:mr-8 mt-6 md:mt-12"
                    : "mr-4 md:mr-20 mt-8 md:mt-20"
                }`}
                style={{ animationDelay: `${200 * (idx + 1)}ms` }}
              >
                <h3 className="text-green-600 font-medium text-[14px] md:text-lg flex items-center justify-end gap-2">
                  {item.title}
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-5 h-5 md:w-7 md:h-7 object-contain"
                  />
                </h3>
                <p className="text-gray-600 text-[12px] md:text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReasonSection