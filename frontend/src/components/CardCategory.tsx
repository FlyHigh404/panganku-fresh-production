import React from "react"

interface Category {
  title: string
  description: string
  image: string
  circleBgColor: string
}

interface CardCategoryProps extends Category {
  index: number
  isActive: boolean
  isReturning?: boolean
}

export default function CardCategory({
  title,
  description,
  image,
  index,
  circleBgColor,
  isActive,
  isReturning,
}: CardCategoryProps) {
  const isEven = index % 2 === 1

  return (
    <div
      className={`group bg-white rounded-full py-4 flex flex-col items-center text-center shadow-md transition duration-200 
      ${isEven ? "translate-y-[-15px]" : ""}`}
      style={{
        width: "170px",
        height: "300px",
        flexShrink: 0,
      }}
    >
      {/* Lingkaran background */}
      <div
        className="w-[130px] h-[130px] rounded-full flex items-center justify-center mb-3 bg-cover bg-center"
        style={{ backgroundImage: `url(${circleBgColor})` }}
      >
        <img
          src={image}
          alt={title}
          className={`w-[95px] h-[95px] rounded-full transition-transform duration-500 ease-in-out transform
            ${
              isReturning
                ? "translate-y-0 scale-100" 
                : isActive
                ? "-translate-y-10 scale-110" 
                : "translate-y-0 scale-100"
            }
          `}
        />
      </div>

      {/* Judul & deskripsi */}
      <h3
        className={`font-bold text-lg mb-2 ${
          isActive ? "text-green-900" : "text-green-700"
        }`}
      >
        {title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}