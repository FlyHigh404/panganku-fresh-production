"use client"

import { useEffect, useRef, useState } from "react"
import CardTesti from "@/components/CardTesti"

  const testimonials = [
  { name: "Chaidar Abdillah", role: "Mahasiswa", testimonial: "Belanja di Panganku Fresh selalu memuaskan. Sayur segar, harga bersahabat, pelayanan cepat dan ramah!", avatar: "/Chaidar.jpg" },
  { name: "Setia Cahya", role: "Mahasiswa", testimonial: "Awalnya ragu belanja online, tapi Panganku Fresh bikin nyaman. Barang cepat datang dan selalu segar!", avatar: "/Setia.jpg" },
  { name: "Sharon Virginia", role: "Mahasiswa", testimonial: "Panganku Fresh jadi penyelamat saya yang sibuk! Semua sayur dan sembako fresh, tinggal pesan, langsung diantar", avatar: "/Sharon.jpg" },
  { name: "Abednego Sinaga", role: "Karyawan", testimonial: "Kualitas sayurannya selalu bagus dan segar. Harganya juga pas di kantong. Mantap banget Panganku Fresh", avatar: "/Abednego.jpg" },
  { name: "Steven Silitonga", role: "Karyawan", testimonial: "Coba sekali langsung ketagihan! Sayurannya fresh, pengiriman cepat, dan pelayanan top!", avatar: "/Steven.jpg" },
  { name: "Ahmad Saddam", role: "Karyawan", testimonial: "Produk selalu segar, kurir sopan, dan pengiriman tepat waktu. Panganku Fresh memang terbaik!", avatar: "/Ahmad.jpg" },
]

export default function TestiSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="testimoni"
      className={`w-full py-16 px-6 font-jakarta relative overflow-hidden bg-gradient-to-b from-green-50/30 to-white 
        transition-all duration-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{
        backgroundImage: 'url("/bgtesti_beranda.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <h3 className="text-green-600 font-semibold text-base sm:text-lg mb-2">
            Testimoni
          </h3>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
            Apa Yang Pengguna Katakan Tentang Kami
          </h2>
        </div>

        {/* Baris pertama (kiri → kanan) */}
        <div className="mb-4 sm:mb-6">
          <div className="marquee-left flex gap-3 sm:gap-4">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={`row1-${i}`}
                className="flex-shrink-0 transition-transform duration-500 hover:scale-105"
              >
                <CardTesti {...t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}