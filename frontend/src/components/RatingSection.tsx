"use client"
import { Star } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import FormRating from "./FormRating"

interface RatingSectionProps {
  averageRating: number
  totalReviews: number
  ratings: { value: number; count: number }[] 
  product: {
    id: string
    name: string
    image: string
    qty: number
    price: number
  }
  orderNumber: string
}

export default function RatingSection({
  averageRating,
  totalReviews,
  ratings,
  product,
  orderNumber,
}: RatingSectionProps) {
  // const { data: session } = useSession()
  const { user, login, logout, token } = useAuth();
  const [isRatingOpen, setIsRatingOpen] = useState(false)

  const isUserLoggedIn = !!user && user?.role !== "ADMIN"

  const handleWriteReview = () => {
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menulis ulasan")
      return
    }
    if (user?.role === "ADMIN") {
      alert("Akun admin tidak dapat memberikan ulasan")
      return
    }
    setIsRatingOpen(true)
  }

  const getPercentage = (count: number) =>
    totalReviews > 0 ? (count / totalReviews) * 100 : 0

  const sortedRatings = [...ratings].sort((a, b) => b.value - a.value)

  const renderBar = (item: { value: number; count: number }) => {
    const percentage = getPercentage(item.count)
    return (
      <div key={item.value} className="flex items-center gap-2 w-full">
        <div className="flex items-center gap-1 min-w-[30px]">
          <Star className="w-4 h-4 fill-[#26A81D] text-[#26A81D]" />
          <span className="text-xs font-medium text-gray-700">
            {item.value}
          </span>
        </div>
        <div className="flex-1 h-[6px] bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#26A81D] rounded-full transition-[width] duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] p-6 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-black">Rating pembeli</h2>
        <button
          onClick={handleWriteReview}
          disabled={!isUserLoggedIn}
          className={`${
            isUserLoggedIn
              ? "bg-[#26A81D] hover:bg-green-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white font-semibold text-[14px] cursor-pointer tracking-[0.56px] rounded-md w-[140px] h-[38px] flex items-center justify-center transition-colors`}
        >
          Tulis ulasan
        </button>
      </div>

      {/* Body */}
      <div className="flex gap-8 flex-wrap">
        {/* Average rating */}
        <div className="flex items-start gap-4 pb-6">
          <Star className="w-[36px] h-[36px] fill-[#26A81D] text-[#26A81D] flex-shrink-0 mt-1" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-jakarta text-[39px] md:text-[40px] font-bold text-black leading-none">
                {averageRating.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-gray-500 text-lg">/5</span>
            </div>
            <span className="text-gray-500 text-sm mt-[2px]">
              {totalReviews.toLocaleString()} ulasan
            </span>
          </div>
        </div>

        {/* Rating bars */}
        <div className="flex-1">
          {ratings.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="space-y-2">
                {sortedRatings.slice(0, 3).map(renderBar)}
              </div>
              <div className="space-y-2">
                {sortedRatings.slice(3).map(renderBar)}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Belum ada data rating.
            </p>
          )}
        </div>
      </div>

      {/* Modal form rating */}
      <FormRating
        open={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        product={product}
        orderNumber={orderNumber}
      />
    </div>
  )
}
