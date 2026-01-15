// components/KategoriSide.tsx
"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp, Star, SlidersHorizontal } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface KategoriSideProps {
  categories: Category[]
  onSelectCategory: (categoryId: string) => void
  onApplyFilters?: (filters: any) => void 
}

export default function KategoriSide({
  categories,
  onSelectCategory,
  onApplyFilters,
}: KategoriSideProps) {
  const [openKategori, setOpenKategori] = useState(true)
  const [openHarga, setOpenHarga] = useState(true)
  const [openRating, setOpenRating] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId) 
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    setSelectedCategories(newCategories)
    onSelectCategory(categoryId)
  }

  const handleRatingToggle = (rating: number) => {
    const newRatings = selectedRatings.includes(rating) 
      ? selectedRatings.filter((r) => r !== rating)
      : [...selectedRatings, rating]
    
    setSelectedRatings(newRatings)
  }

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      const filters = {
        categories: selectedCategories,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        ratings: selectedRatings,
      }
      onApplyFilters(filters)
    }
  }

  const formatPrice = (value: string) => {
    return value.replace(/\D/g, "")
  }

  const displayPrice = (value: string) => {
    if (!value) return ""
    return parseInt(value).toLocaleString("id-ID")
  }

  const isInvalidPriceRange = minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)

  return (
    <div className="w-64 bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Filter Kategori */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setOpenKategori(!openKategori)}
          className="flex items-center justify-between w-full font-medium text-gray-700"
        >
          <span className="flex items-center gap-4">
            <SlidersHorizontal className="w-4 h-4" />
            Filter Kategori
          </span>
          {openKategori ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {openKategori && (
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            {categories.map((cat) => (
              <li key={cat.id} className="cursor-pointer flex items-center justify-between transition-colors">
                <span>{cat.name}</span>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="
                    w-5 h-5 
                    appearance-none
                    rounded-md
                    border border-black
                    cursor-pointer
                    transition-all
                    checked:bg-[#6EC568]
                    checked:border-[#6EC568]
                    relative
                    after:content-['✓']
                    after:absolute
                    after:text-white
                    after:text-sm
                    after:font-bold
                    after:top-[0px]
                    after:left-[4px]
                  "
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Batas Harga */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setOpenHarga(!openHarga)}
          className="flex items-center justify-between w-full font-medium text-gray-700"
        >
          <span>Batas Harga</span>
          {openHarga ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openHarga && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="text"
                placeholder="Minimum"
                value={displayPrice(minPrice)}
                onChange={(e) => setMinPrice(formatPrice(e.target.value))}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="text"
                placeholder="Maksimal"
                value={displayPrice(maxPrice)}
                onChange={(e) => setMaxPrice(formatPrice(e.target.value))}
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            {minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice) && (
              <p className="text-red-500 text-xs mt-1">Harga minimum tidak boleh lebih besar dari maksimal</p>
            )}
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="border-b border-gray-200 pb-4">
        <button
          onClick={() => setOpenRating(!openRating)}
          className="flex items-center justify-between w-full font-medium text-gray-700"
        >
          <span>Rating</span>
          {openRating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {openRating && (
          <div className="mt-3 space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`rating-${rating}`}
                  checked={selectedRatings.includes(rating)}
                  onChange={() => handleRatingToggle(rating)}
                  className="
                    w-5 h-5 
                    appearance-none
                    rounded-md
                    border border-black
                    cursor-pointer
                    transition-all
                    checked:bg-[#6EC568]
                    checked:border-[#6EC568]
                    relative
                    after:content-['✓']
                    after:absolute
                    after:text-white
                    after:text-sm
                    after:font-bold
                    after:top-[0px]
                    after:left-[4px]
                  "
                />
                <label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm cursor-pointer">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {rating} ke atas
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Button */}
      <button 
        onClick={handleApplyFilters}
        disabled={!!isInvalidPriceRange} 
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 cursor-pointer text-white font-medium py-2 px-4 rounded-full transition-colors duration-300"
      >
        Terapkan Filter
      </button>
    </div>
  )
}