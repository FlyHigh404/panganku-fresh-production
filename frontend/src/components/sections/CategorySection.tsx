"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Category {
  id: number
  image: string
}

const CategoryData: Category[] = [
  { id: 1, image: "/Sayurktg.png" },
  { id: 2, image: "/Buahktg.png" },
  { id: 3, image: "/Proteinktg.png" },
  { id: 4, image: "/Bumbuktg.png" },
  { id: 5, image: "/Olahanktg.png" },
  { id: 6, image: "/Minumanktg.png" },
]

// clone first & last slide
const infiniteData = [CategoryData[CategoryData.length - 1], ...CategoryData, CategoryData[0]]

const CategorySection: React.FC = () => {
  const [current, setCurrent] = useState(1)
  const [enableTransition, setEnableTransition] = useState(true)
  const [cardWidth, setCardWidth] = useState(812.429)
  const [gap, setGap] = useState(20)
  const containerRef = useRef<HTMLDivElement>(null)

  // hitung ulang ukuran card saat resize
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth

      if (screenWidth >= 1200) {
        setCardWidth(812.429)
        setGap(20)
      } else if (screenWidth >= 768) {
        setCardWidth(600)
        setGap(16)
      } else {
        setCardWidth(320)
        setGap(12)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleTransitionEnd = () => {
    if (current === 0) {
      setEnableTransition(false)
      setCurrent(CategoryData.length)
    } else if (current === infiniteData.length - 1) {
      setEnableTransition(false)
      setCurrent(1)
    }
  }

  useEffect(() => {
    if (!enableTransition) {
      requestAnimationFrame(() => setEnableTransition(true))
    }
  }, [enableTransition])

  const prevSlide = () => {
    setEnableTransition(true)
    setCurrent((prev) => prev - 1)
  }

  const nextSlide = () => {
    setEnableTransition(true)
    setCurrent((prev) => prev + 1)
  }

  // auto slide
  useEffect(() => {
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [])

  const cardTotal = cardWidth + gap

  return (
    <section className="relative flex justify-center my-10">
      <div
        ref={containerRef}
        className="relative overflow-hidden flex justify-center items-center w-full h-[auto]"
        style={{ height: `${(cardWidth / 812.429) * 415.179 + 90}px` }} // tinggi proporsional
      >
        {/* Carousel content */}
        <div
          className={`flex ${
            enableTransition
              ? "transition-transform duration-700 ease-in-out"
              : "transition-none"
          }`}
          style={{
            transform: `translateX(calc(50% - ${current * cardTotal}px - ${cardWidth / 2}px))`,
            gap: `${gap}px`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {infiniteData.map((item, index) => {
            const isActive = index === current
            const isPrev = index === current - 1
            const isNext = index === current + 1
            const shouldShow = isActive || isPrev || isNext

            return (
              <div
                key={`${item.id}-${index}`}
                className={`flex-shrink-0 relative transition-all duration-500 ease-in-out rounded-[15px] ${
                  !shouldShow
                    ? "invisible opacity-0 pointer-events-none"
                    : isActive
                    ? "scale-100 opacity-100 z-20"
                    : "scale-90 opacity-50 z-10"
                }`}
                style={{
                  width: `${cardWidth}px`,
                  height: `${(cardWidth / 812.429) * 415.179}px`,
                  background: `url(${item.image}) lightgray 50% / cover no-repeat`,
                }}
              ></div>
            )
          })}
        </div>

        {/* Chevron kiri */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 bg-[#6EC568] hover:bg-[#5bb456] text-white p-2 rounded-full shadow-md transition-colors duration-300 z-30"
          style={{ left: `calc(50% - ${cardWidth / 2 + 35}px)` }}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft />
        </button>

        {/* Chevron kanan */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 -translate-y-1/2 bg-[#6EC568] hover:bg-[#5bb456] text-white p-2 rounded-full shadow-md transition-colors duration-300 z-30"
          style={{ right: `calc(50% - ${cardWidth / 2 + 35}px)` }}
          aria-label="Slide berikutnya"
        >
          <ChevronRight />
        </button>

        {/* Pagination */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {CategoryData.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === current - 1 ? "bg-[#6EC568] w-8" : "bg-gray-300 w-6"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection