"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage > 4) pages.push(1, "...")
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages, currentPage + 1);
        i++
      ) {
        pages.push(i)
      }
      if (currentPage < totalPages - 3) pages.push("...", totalPages)
    }
    return pages
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Tombol prev */}
      <button
        className="p-2 rounded hover:bg-gray-100 disabled:text-gray-400"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Angka halaman */}
      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded ${
              page === currentPage
                ? "bg-green-500 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2">
            {page}
          </span>
        )
      )}

      {/* Tombol next */}
      <button
        className="p-2 rounded hover:bg-gray-100 disabled:text-gray-400"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
