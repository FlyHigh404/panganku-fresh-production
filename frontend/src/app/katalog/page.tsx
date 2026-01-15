"use client";

import { useState, useEffect } from "react";
import { Filter, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import CartProduct from "@/components/CartProduct";
import KategoriSide from "@/components/KategoriSide";
import KategoriMobile from "@/components/KategoriMobile";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import NavSearch from "@/components/NavSearch";
import { useCart } from "@/context/CartContext";
// import { useSession } from "next-auth/react";

// Toast Notification Component
const Toast = ({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) => (
  <div className="fixed top-26 right-4 z-[100] animate-slide-in">
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-50 border border-green-200' :
      type === 'error' ? 'bg-red-50 border border-red-200' :
        'bg-blue-50 border border-blue-200'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : type === 'error' ? (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
      )}
      <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' :
        type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`ml-2 ${type === 'success' ? 'text-green-600 hover:text-green-700' :
          type === 'error' ? 'text-red-600 hover:text-red-700' :
            'text-blue-600 hover:text-blue-700'
          }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Loading Skeleton for Products
const ProductsSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Loading Skeleton for Categories
const CategoriesSkeleton = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
    ))}
  </div>
);

export default function KatalogPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["all"]);
  const [priceRange, setPriceRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  // const { data: session } = useSession();
  const { incrementCart } = useCart();

  const addToCart = async (product: any) => {
    const token = localStorage.getItem('token');
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
        setTimeout(() => incrementCart(), 100);
        setToast({
          message: `${product.name} berhasil ditambahkan ke keranjang!`,
          type: 'success'
        });
      } else {
        const result = await response.json();
        setToast({
          message: result.error || "Gagal menambahkan ke keranjang.",
          type: 'error'
        });
      }
    } catch (error) {
      console.error("Error terjadi:", error);
      setToast({
        message: "Terjadi kesalahan saat menambahkan ke keranjang.",
        type: 'error'
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // mobile filter modal
  const [showFilter, setShowFilter] = useState(false);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // fetch kategori
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/categories`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Gagal memuat kategori");
        const data = await res.json();
        setCategories([{ id: "all", name: "Semua" }, ...data]);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setToast({
          message: "Gagal memuat kategori",
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // fetch produk
  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoadingProducts(true);
        const params = new URLSearchParams();

        //  FILTER PENCARIAN
        if (searchTerm) params.append("q", searchTerm);

        //  FILTER KATEGORI
        const filtered = selectedCategories.filter((c) => c !== "all");
        if (filtered.length > 0) {
          params.append("categoryId", filtered.join(","));
        }

        // FILTER HARGA 
        if (priceRange.min !== null) {
          params.append("minPrice", priceRange.min.toString());
        }
        if (priceRange.max !== null) {
          params.append("maxPrice", priceRange.max.toString());
        }


        // FILTER RATING
        if (selectedRatings.length > 0) {
          const minRating = Math.min(...selectedRatings);
          params.append("minRating", minRating.toString());
        }


        params.append("page", currentPage.toString());
        params.append("limit", itemsPerPage.toString());

        console.log("Fetching with params:", params.toString());

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/search?${params.toString()}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Gagal memuat produk");

        const data = await res.json();

        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalProducts(data.meta?.total || 0);

        // Show info toast when filter applied
        if ((filtered.length > 0 || priceRange.min !== null || priceRange.max !== null || selectedRatings.length > 0) && currentPage === 1) {
          let filterMessage = "Menampilkan produk dengan filter: ";
          const filterParts = [];

          if (filtered.length > 0) {
            const categoryNames = categories
              .filter(c => filtered.includes(c.id))
              .map(c => c.name)
              .join(", ");
            filterParts.push(`kategori ${categoryNames}`);
          }

          if (priceRange.min !== null || priceRange.max !== null) {
            const priceText = `harga ${priceRange.min ? `Rp${priceRange.min.toLocaleString()}` : ''}${priceRange.min && priceRange.max ? ' - ' : ''}${priceRange.max ? `Rp${priceRange.max.toLocaleString()}` : ''}`;
            filterParts.push(priceText);
          }

          if (selectedRatings.length > 0) {
            const ratingText = `rating ${Math.min(...selectedRatings)}+`;
            filterParts.push(ratingText);
          }

          setToast({
            message: filterMessage + filterParts.join(", "),
            type: 'info'
          });
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message);
        setToast({
          message: "Gagal memuat produk",
          type: 'error'
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!loading) {
      fetchProducts();
    }
  }, [searchTerm, selectedCategories, currentPage, loading, priceRange, selectedRatings]);

  // efek scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle category selection
  const handleCategorySelect = (catId: string) => {
    setSelectedCategories([catId]);
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Filters applied:', filters);

    // Reset dulu semua filter
    setPriceRange({ min: null, max: null });
    setSelectedRatings([]);

    // Terapkan filter baru
    if (filters.minPrice !== null || filters.maxPrice !== null) {
      setPriceRange({
        min: filters.minPrice,
        max: filters.maxPrice
      });
    }

    if (filters.ratings && filters.ratings.length > 0) {
      setSelectedRatings(filters.ratings);
    }

    // Kategori 
    if (filters.categories && filters.categories.length > 0) {
      setSelectedCategories(filters.categories);
    } else {
      setSelectedCategories(["all"]);
    }

    setCurrentPage(1);
    setToast({
      message: "Filter diterapkan",
      type: 'success'
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedCategories(["all"]);
    setSearchTerm("");
    setPriceRange({ min: null, max: null });
    setSelectedRatings([]);
    setCurrentPage(1);
    setToast({
      message: "Filter direset",
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navbar */}
      <div
        className={`fixed top-0 w-full z-50 transition-all ${scrolled
          ? "bg-white backdrop-blur-sm shadow-sm"
          : "bg-transparent"
          }`}
      >
        <NavSearch />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-32 flex gap-6">
        {/* Sidebar Kategori (Desktop only) */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-32">
            {loading ? (
              <CategoriesSkeleton />
            ) : (
              <KategoriSide
                categories={categories}
                onSelectCategory={handleCategorySelect}
                onApplyFilters={handleApplyFilters}
              />
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 mt-10 md:mt-0 ">
          {/* Header with filters info */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Katalog Produk
              </h1>
              {!loadingProducts && (
                <p className="text-sm text-gray-600">
                  Menampilkan {products.length} dari {totalProducts} produk
                  {selectedCategories[0] !== "all" && (
                    <span className="ml-1 text-green-600 font-medium">
                      (Terfilter)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilter(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
            </button>

            {/* Reset Filters Button */}
            {(selectedCategories[0] !== "all" || searchTerm || priceRange.min !== null || priceRange.max !== null || selectedRatings.length > 0) && (
              <button
                onClick={handleResetFilters}
                className="hidden md:flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 font-medium transition-colors px-3 py-2 border border-gray-300 rounded-lg hover:border-green-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
                Reset Filter
              </button>
            )}
          </div>

          {/* Loading State */}
          {loadingProducts ? (
            <ProductsSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Terjadi Kesalahan
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Muat Ulang
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Filter className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-gray-600 mb-4">
                Coba ubah filter atau kata kunci pencarian
              </p>
              <button
                onClick={handleResetFilters}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-6">
                {products.map((product, i) => (
                  <CartProduct
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile Filter Modal */}
      {showFilter && (
        <KategoriMobile
          categories={categories}
          selectedCategories={selectedCategories}
          onClose={() => setShowFilter(false)}
          onChangeCategories={(selected) => {
            setSelectedCategories(selected);
            setCurrentPage(1);
            setShowFilter(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onReset={() => {
            setSelectedCategories(["all"]);
            setCurrentPage(1);
          }}
          onApplyFilters={handleApplyFilters}
          onResetAll={handleResetFilters}
        />
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}