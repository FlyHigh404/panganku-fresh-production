import Image from "next/image"

interface CardTestiProps {
  name: string
  role: string
  testimonial: string
  avatar: string
}

export default function CardTesti({ name, role, testimonial, avatar }: CardTestiProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 font-jakarta 
                 hover:shadow-md transition-all duration-300 
                 p-4 sm:p-5 md:p-6 
                 w-[240px] sm:w-[300px] md:w-[380px] 
                 h-[160px] sm:h-[180px] md:h-[200px]
                 flex justify-between items-start gap-3 sm:gap-4"
    >
      {/* Konten kiri */}
      <div className="flex flex-col">
        {/* Header: foto + nama + role */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">
              {name}
            </h4>
            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm">{role}</p>
          </div>
        </div>

        {/* Testimonial */}
        <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
          {testimonial}
        </p>
      </div>

      {/* Tanda kutip kanan */}
      <div className="text-green-500 text-5xl sm:text-7xl md:text-9xl font-bold leading-none flex-shrink-0">
        “
      </div>
    </div>
  )
}