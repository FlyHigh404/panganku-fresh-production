"use client"

import { useEffect, useRef, useState } from "react"
import CardTesti from "@/components/CardTesti"

const testimonials = [
  { name: "Chaidar Abdillah", role: "Mahasiswa", testimonial: "Belanja di Panganku Fresh selalu memuaskan...", avatar: "/Chaidar.jpg" },
  { name: "Setia Cahya", role: "Mahasiswa", testimonial: "Awalnya ragu belanja online...", avatar: "/Setia.jpg" },
  { name: "Sharon Virginia", role: "Mahasiswa", testimonial: "Panganku Fresh jadi penyelamat saya...", avatar: "/Sharon.jpg" },
  { name: "Abednego Sinaga", role: "Karyawan", testimonial: "Kualitas sayurannya selalu bagus...", avatar: "/Abednego.jpg" },
  { name: "Steven Silitonga", role: "Karyawan", testimonial: "Coba sekali langsung ketagihan!...", avatar: "/Steven.jpg" },
  { name: "Ahmad Saddam", role: "Karyawan", testimonial: "Produk selalu segar, kurir sopan...", avatar: "/Ahmad.jpg" },
]

export default function TestiSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // logika drag manual state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

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

  // Logika Drag to Scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2 // Kecepatan scroll manual
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

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
        <div className="text-center mb-10 sm:mb-12">
          <h3 className="text-green-600 font-semibold text-base sm:text-lg mb-2">
            Testimoni
          </h3>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">
            Apa Yang Pengguna Katakan Tentang Kami
          </h2>
        </div>
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          className={`mb-4 sm:mb-6 overflow-x-auto scroll-smooth scrollbar-hide active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="marquee-left flex gap-3 sm:gap-4 w-max">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={`row1-${i}`}
                className="flex-shrink-0 transition-transform duration-500 hover:scale-105 select-none"
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