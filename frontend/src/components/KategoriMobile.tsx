"use client";
import { X, Star } from "lucide-react";
import { useState } from "react";

interface KategoriMobileProps {
  categories: { id: string; name: string }[];
  selectedCategories: string[];
  onClose: () => void;
  onChangeCategories: (selected: string[]) => void;
  onReset: () => void;
  onApplyFilters?: (filters: any) => void;
  onResetAll?: () => void;
}

export default function KategoriMobile({
  categories,
  selectedCategories,
  onClose,
  onChangeCategories,
  onReset,
  onApplyFilters,
  onResetAll,
}: KategoriMobileProps) {
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const formatPrice = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const displayPrice = (value: string) => {
    if (!value) return "";
    return parseInt(value).toLocaleString("id-ID");
  };

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onChangeCategories(selectedCategories.filter((c) => c !== id));
    } else {
      onChangeCategories([...selectedCategories, id]);
    }
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = selectedRatings.includes(rating) 
      ? selectedRatings.filter((r) => r !== rating)
      : [...selectedRatings, rating];
    
    setSelectedRatings(newRatings);
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      const filters = {
        categories: selectedCategories,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        ratings: selectedRatings,
      };
      onApplyFilters(filters);
    }
    onClose();
  };

  const handleResetAll = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      onReset();
      setSelectedRatings([]);
      setMinPrice("");
      setMaxPrice("");
    }
    onClose();
  };

  const isInvalidPriceRange = minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:hidden z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90%] overflow-y-auto shadow-lg">
        {/* Header*/}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Filter</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rating*/}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Rating</h3>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`mobile-rating-${rating}`}
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
                <label 
                  htmlFor={`mobile-rating-${rating}`} 
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {rating} ke atas
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Batas Harga */}
        <div className="mb-6">
          <h3 className="text-base font-medium mb-3">Batas Harga</h3>
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="text"
                placeholder="Minimum"
                value={displayPrice(minPrice)}
                onChange={(e) => setMinPrice(formatPrice(e.target.value))}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">Rp</span>
              <input
                type="text"
                placeholder="Maksimal"
                value={displayPrice(maxPrice)}
                onChange={(e) => setMaxPrice(formatPrice(e.target.value))}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            
            {/* Error message */}
            {minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice) && (
              <p className="text-red-500 text-xs mt-1">Harga minimum tidak boleh lebih besar dari maksimal</p>
            )}
          </div>
        </div>

        {/* Kategori*/}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-medium">Kategori</h3>
            <button className="text-green-600 text-sm font-medium">
              Lihat Semua
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg border ${
                    active
                      ? "bg-green-50 border-green-500 text-green-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleResetAll}
            className="flex-1 py-3 rounded-xl border border-green-200 bg-green-50 text-green-600 font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={!!isInvalidPriceRange}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              isInvalidPriceRange
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            Terapkan
          </button>
        </div>
      </div>
    </div>
  );
}