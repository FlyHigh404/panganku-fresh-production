"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true)
        })
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="w-full py-8 md:py-16 px-4 md:px-6 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/bgabt_beranda.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10 transition-all duration-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
      >
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/IconPanganku.png"
            alt="Panganku Fresh Logo"
            width={200}
            height={200}
            className={`object-contain w-32 h-32 md:w-[200px] md:h-[200px] ${isVisible ? "animate-float-left" : ""
              }`}
          />
        </div>

        {/* Teks Konten */}
        <div className="flex-1">
          <h1
            className="font-jakarta text-2xl md:text-[40px] font-bold text-green-600 text-center md:text-left"
            style={{
              color: "#16a34a",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.10)",
            }}
          >
            Tentang Panganku Fresh
          </h1>

          <p
            className="mt-4 md:mt-6 font-jakarta text-base md:text-[23px] font-light text-center md:text-left"
            style={{
              color: "rgba(20, 20, 20, 0.7)",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.10)",
            }}
          >
            Panganku Fresh hadir oleh para pendiri memiliki visi sama untuk menyediakan sayur/sembako berkualitas dengan harga terjangkau. Kami memulai usaha ini dengan menggabungkan penjualan online dan offline untuk memberikan kemudahan bagi pelanggan. Dengan kerja keras dan dedikasi, Panganku Fresh terus berkembang dan mendapatkan kepercayaan dari pelanggan. Kami berkomitmen untuk selalu memberikan produk terbaik dan pelayanan ramah kepada masyarakat.
          </p>
        </div>
      </div>
    </section>
  )
}