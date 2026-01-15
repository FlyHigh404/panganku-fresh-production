
import { Banknote, Package, BadgeCheck, HandHeart, LockKeyhole, Clock3 } from "lucide-react"
import ProductPopuler from "@/components/sections/ProductSection"

const HeroSection = () => {
    

    return (
        <section
            id="beranda"
            className="relative min-h-screen bg-white overflow-hidden"
        >
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 right-[380px] w-[15rem] h-[22rem] bg-gradient-to-br from-[#6EC568] to-[#26A81D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transform -translate-x-1/2"></div>
                {/* right */}
                <div className="absolute -right-50 top-[220px] w-[15rem] h-[20rem] bg-gradient-to-br from-[#6EC568] to-[#26A81D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transform -translate-x-1/2"></div>
                {/* left */}
                <div className="absolute right-240 top-[170px] w-[15rem] h-[20rem] bg-gradient-to-br from-[#6EC568] to-[#26A81D] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transform -translate-x-1/2"></div>
            </div>

            {/* LEFT SIDE */}
            <div className="absolute left-0 lg:top-[220px] w-40 sm:w-64 md:w-80 lg:w-[280px] hidden lg:block">
                <div className="relative animate-float-left">
                    <img
                        src="/Left.png"
                        alt="Fresh vegetables"
                        width={280}
                        height={355}
                        className="object-contain animate-fade-in-left"
                    />
                    {/* Label Terjangkau */}
                    <div className="absolute lg:top-[22px] lg:left-[8px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.95rem] shadow-md animate-slide-in-left animation-delay-300">
                        Terjangkau
                        <Banknote className="w-5 h-5" />
                    </div>

                    {/* Label Ribuan Produk */}
                    <div className="absolute lg:top-[150px] lg:-right-[25px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.95rem] shadow-md animate-slide-in-left animation-delay-600">
                        Ribuan Produk
                        <Package className="w-5 h-5" />
                    </div>

                    {/* Label 100% Produk Segar */}
                    <div className="absolute lg:bottom-[22px] lg:left-[45px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.85rem] shadow-md animate-slide-in-left animation-delay-900">
                        100% Produk Segar
                        <BadgeCheck className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="absolute right-0 lg:top-[220px] w-40 sm:w-64 md:w-80 lg:w-[280px] hidden lg:block">
                <div className="relative animate-float-right">
                    <img
                        src="/Right.png"
                        alt="Fresh vegetables"
                        width={280}
                        height={355}
                        className="object-contain animate-fade-in-right"
                    />

                    {/* Label Dukung Petani */}
                    <div className="absolute lg:top-[22px] lg:right-[8px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.95rem] shadow-md animate-slide-in-right animation-delay-300">
                        Dukung Petani
                        <HandHeart className="w-5 h-5" />
                    </div>

                    {/* Label Transaksi Aman */}
                    <div className="absolute lg:top-[150px] lg:-left-[25px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.95rem] shadow-md animate-slide-in-right animation-delay-600">
                        Transaksi Aman
                        <LockKeyhole className="w-5 h-5" />
                    </div>

                    {/* Label Pengiriman Fleksibel */}
                    <div className="absolute lg:bottom-[22px] lg:right-[45px] bg-[#51B94A]/60 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium lg:text-[0.85rem] shadow-md animate-slide-in-right animation-delay-900">
                        Pengiriman Fleksibel
                        <Clock3 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 sm:px-8 md:px-8 pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Main headline */}
                    <h1
                        className="text-3xl sm:text-3xl md:text-4xl lg:text-[2.4rem] font-bold text-black mb-3 lg:mb-3.5 leading-tight lg:leading-snug animate-fade-in-up"
                    >
                        Belanja Bahan Segar{" "}
                        <span className="relative inline-block p-2">

                            <span className="text-green-600 font-bold leading-none">Tanpa Ribet,</span>

                            <div className="absolute inset-0 bg-[url('/Vector.png')] bg-no-repeat bg-contain pointer-events-none top-2"></div>
                        </span>
                        <br />
                        <span className="text-green-600 font-bold">Atur Sendiri</span> Jadwal Antar-nya
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-600 font-medium text-sm sm:text-base md:text-lg lg:text-[1.02rem] mb-2 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                        Mau masak besok pagi? Butuh stok dapur buat seminggu ke depan?
                    </p>
                    <p className="text-gray-600 font-medium text-sm sm:text-base md:text-lg lg:text-[1.02rem] mb-3 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
                        Di <span className="font-bold">Panganku Fresh</span>, kamu tinggal pilih bahan segarnya, biar{" "}
                        <span className="font-bold">kami yang antar</span>.
                    </p>

                    <ProductPopuler />
                </div>
            </div>
        </section>
    )
}

export default HeroSection