"use client"
import React, { useEffect, useRef, useState } from "react"

interface DataItem {
  value: number
  suffix: string
  label: string
}

const DataSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [startCount, setStartCount] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const data: DataItem[] = [
    { value: 10, suffix: "Kota+", label: "Tercangkup" },
    { value: 5000, suffix: "+", label: "Pelanggan Puas" },
    { value: 5, suffix: "+", label: "Total Kategori Produk" },
    { value: 10000, suffix: "+", label: "Jumlah Order" },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          setStartCount(true)
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
      className={`bg-cover bg-center py-12 transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-20"}`}
      style={{ backgroundImage: "url('/bgdata_beranda.png')" }}
    >
      <div className="container mx-auto px-4">
        {/* Mobile = 2 kolom, Desktop = 4 kolom */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-1 justify-items-center">
          {data.map((item, idx) => (
            <CountCard
              key={idx}
              value={item.value}
              suffix={item.suffix}
              label={item.label}
              animate={startCount}
              delay={200 * (idx + 1)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface CountCardProps extends DataItem {
  animate: boolean
  delay: number
}

const CountCard: React.FC<CountCardProps> = ({
  value,
  suffix,
  label,
  animate,
  delay,
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animate) return

    let start: number | null = null
    const duration = 2000
    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) requestAnimationFrame(step)
    }

    const timeout = setTimeout(() => {
      requestAnimationFrame(step)
    }, delay)

    return () => clearTimeout(timeout)
  }, [animate, value, delay])

  return (
    <div
      className={`w-[160px] h-[110px] sm:w-[180px] sm:h-[120px] md:w-[224px] md:h-[134px]
                  bg-white/90 border-2 border-green-500 rounded-2xl shadow-md
                  flex flex-col items-center justify-center text-center animate-card-appear`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
        {count.toLocaleString()}
        {suffix}
      </h3>
      <p className="mt-2 text-gray-700 text-xs sm:text-sm md:text-base">{label}</p>
    </div>
  )
}

export default DataSection