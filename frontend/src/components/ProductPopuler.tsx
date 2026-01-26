"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function ProductPopuler() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<number>(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const { user, login, logout } = useAuth();
  const token = localStorage.getItem('token');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const [res1, res2] = await Promise.all([
          fetch(`${baseUrl}/app/api/products`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }).then((res) => res.json()),
          fetch(`${baseUrl}/app/api/products/categories`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }).then((res) => res.json()),
        ]);
        setProducts(res1);
        setCategories(res2);
      } catch (err) {
        setError("Failed to fetch products or categories");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };


  const handleAddToCart = async (product: any) => {
    // Cek login
    if (!user) {
      setErrorMessage("Anda harus login terlebih dahulu.");
      setShowErrorModal(true);
      return;
    }

    // Cek role user
    if (user?.role === "ADMIN") {
      setErrorMessage("Akun admin tidak dapat menambahkan produk ke keranjang.");
      setShowErrorModal(true);
      return;
    }

    setAddingToCart(product.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setCartItems(cartItems + 1);
      } else {
        const result = await response.json();
        setErrorMessage(result.error || "Gagal menambahkan ke keranjang.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error terjadi:", error);
      setErrorMessage("Terjadi kesalahan saat menambahkan ke keranjang.");
      setShowErrorModal(true);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleLoginRedirect = () => {
    setShowErrorModal(false);
    router.push("/auth/signin");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800"> Tidak Dapat Menambahkan</h3>
              <button onClick={() => setShowErrorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowErrorModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              {!user && (
                <button
                  onClick={handleLoginRedirect}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-5 px-2 sm:px-0 animate-fade-in-up animation-delay-400">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 sm:w-4.5 lg:w-4 h-4 sm:h-4.5 lg:h-4 text-gray-900 animate-pulse-soft" />
          <input
            type="text"
            placeholder="Cari produk terbaik di Panganku Fresh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 lg:py-2.5 text-sm sm:text-base lg:text-[0.95rem] border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-md bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-lg focus:scale-[1.01]"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap justify-center lg:justify-start lg:ml-42 gap-2 sm:gap-2.5 lg:gap-2 mb-4 animate-fade-in-up animation-delay-500">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.name)}
            className={`px-3.5 sm:px-5 lg:px-4 py-1.5 sm:py-2.5 lg:py-2 rounded-full font-medium text-sm sm:text-sm lg:text-[0.8rem] transition-all duration-300 animate-slide-in-category ${activeCategory === category
              ? "bg-green-500 text-white shadow-lg scale-105"
              : "bg-green-50 text-green-600 border border-green-300 hover:bg-green-100 hover:scale-105"
              }`}
            style={{ animationDelay: `${600 + index * 100}ms` }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Popular products section */}
      <div className="text-left max-w-7xl lg:w-3xl mx-auto px-4">
        <h2 className="text-lg sm:text-xl lg:text-base font-semibold text-gray-700 mb-4 lg:ml-22 animate-fade-in-up animation-delay-800">
          Produk populer hari ini!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, index) => (
            <Link href={`/katalog/detail?id=${product.id}`} passHref key={product.id}>
              <div
                className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-2 shadow-sm sm:shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group animate-card-appear"
                style={{ animationDelay: `${900 + index * 200}ms` }}
              >
                {/* 1. Gambar */}
                <div className="mb-2 sm:mb-4 bg-gray-50 rounded-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={product.imageUrl[0] || "/placeholder.svg"}
                    alt={product.name}
                    width={400}
                    height={250}
                    className="w-full h-20 sm:h-28 lg:h-24 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* 2. Nama + Berat */}
                <h4 className="font-bold text-sm sm:text-base lg:text-sm text-gray-800 mb-1 group-hover:text-green-600 transition-colors duration-300">
                  {product.name}{" "}
                  <span className="font-normal text-gray-600 text-xs sm:text-sm">{product.weight}</span>
                </h4>

                {/* 3. Stok */}
                <p className="text-gray-500 text-xs sm:text-sm lg:text-xs mb-1">
                  Sisa stok: {product.stock}
                </p>

                {/* 4. Deskripsi */}
                <p className="text-gray-600 text-[0.65rem] sm:text-xs lg:text-[0.7rem] mb-1 line-clamp-2">
                  {product.description}
                </p>

                {/* 5. Harga */}
                <span className="block text-sm sm:text-base lg:text-sm font-bold text-gray-800 mb-1.5">
                  {formatPrice(product.price)}
                </span>

                {/* 6. Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={addingToCart === product.id || product.stock === 0}
                  className={`w-full py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-sm lg:text-sm
    transition-all duration-300 flex items-center justify-center gap-1 
    transform active:scale-95
    ${addingToCart === product.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : product.stock === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:scale-105"
                    }
  `}
                >
                  {addingToCart === product.id ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span className="ml-1">Menambahkan...</span>
                    </>
                  ) : product.stock === 0 ? (
                    "Stok Habis"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 lg:w-4 lg:h-4" />
                      Tambah ke Keranjang
                    </>
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}