"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Footer from "@/components/Footer";
import NavSearch from "@/components/NavSearch";
import RatingSection from "@/components/RatingSection";
import ReviewSection from "@/components/ReviewSection";
import FormRating from "@/components/FormRating";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

// Toast Notification Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div className="fixed top-24 right-4 z-[100002] animate-slide-in">
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === "success"
        ? "bg-green-50 border border-green-200"
        : "bg-red-50 border border-red-200"
        }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      <p
        className={`text-sm font-medium ${type === "success" ? "text-green-800" : "text-red-800"
          }`}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className={`ml-2 ${type === "success"
          ? "text-green-600 hover:text-green-700"
          : "text-red-600 hover:text-red-700"
          }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
    <div className="px-6 py-4 border-b border-gray-100">
      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:ml-10 lg:mr-12">
      <div className="space-y-7">
        <div className="aspect-square bg-gray-200 rounded-xl animate-pulse w-full max-w-[500px] max-h-[500px]" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-12 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string[];
  stock: number;
  weight?: string;
  category?: {
    name: string;
  };
  rating?: number;
  createdAt?: string;
}

interface Review {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image?: string | null;
  };
  reply?: string | null;
  replyBy?: string | null;
  admin?: {
    name: string;
    role?: string;
  } | null;
}

interface Rating {
  value: number;
  count: number;
}

// Helper function untuk memproses data ratings dari API
const processRatingsData = (ratingsData: any): Rating[] => {
  if (!ratingsData || typeof ratingsData !== "object") {
    return [
      { value: 5, count: 0 },
      { value: 4, count: 0 },
      { value: 3, count: 0 },
      { value: 2, count: 0 },
      { value: 1, count: 0 },
    ];
  }

  if (Array.isArray(ratingsData)) {
    if (ratingsData.length === 0) {
      return [
        { value: 5, count: 0 },
        { value: 4, count: 0 },
        { value: 3, count: 0 },
        { value: 2, count: 0 },
        { value: 1, count: 0 },
      ];
    }

    const ratingsMap: Record<number, number> = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingsData.forEach((item: any) => {
      const star = Number(item.value);
      const count = Number(item._count?.value || item.count || 0);

      if (star >= 1 && star <= 5) {
        ratingsMap[star] = count;
      }
    });

    return [
      { value: 5, count: ratingsMap[5] },
      { value: 4, count: ratingsMap[4] },
      { value: 3, count: ratingsMap[3] },
      { value: 2, count: ratingsMap[2] },
      { value: 1, count: ratingsMap[1] },
    ];
  }

  const ratingsMap: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  Object.entries(ratingsData).forEach(([key, value]) => {
    const star = Number(key);
    const count = Number(value);

    if (star >= 1 && star <= 5 && !isNaN(count)) {
      ratingsMap[star] = count;
    }
  });

  return [
    { value: 5, count: ratingsMap[5] },
    { value: 4, count: ratingsMap[4] },
    { value: 3, count: ratingsMap[3] },
    { value: 2, count: ratingsMap[2] },
    { value: 1, count: ratingsMap[1] },
  ];
};

// Helper function untuk menghitung rating statistics
const calculateRatingStats = (ratings: Rating[]) => {
  const totalReviews = ratings.reduce((acc, r) => acc + r.count, 0);

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
    };
  }

  const totalStars = ratings.reduce((acc, r) => acc + r.value * r.count, 0);
  const averageRating = totalStars / totalReviews;

  return {
    totalReviews,
    averageRating: Number(averageRating.toFixed(1)),
  };
};

const ProductDetailPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { incrementCart } = useCart();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [RelatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      setError(null);

      const productId = id as string;
      if (!productId) {
        setError("Product ID tidak ditemukan");
        return;
      }

      setQuantity(1);
      // Fetch product data
      const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/${productId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!productResponse.ok) throw new Error("Gagal mengambil data produk");

      const productData = await productResponse.json();
      setProduct(productData);

      // Fetch reviews, ratings, dan related products
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const [reviewsResponse, ratingsResponse, productRelatedResponse] =
        await Promise.all([
          fetch(`${baseUrl}/app/api/products/${productId}/reviews`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
          fetch(`${baseUrl}/app/api/products/${productId}/ratings`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }),
          fetch(
            `${baseUrl}/app/api/products/${productId}/produk-terkait?categoryId=${productData.categoryId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
          ),
        ]);

      const relatedProductsData = await productRelatedResponse.json();
      setRelatedProducts(relatedProductsData);

      // Process reviews data
      let reviewsData: Review[] = [];
      if (reviewsResponse.ok) {
        const reviewsJson = await reviewsResponse.json();
        reviewsData = Array.isArray(reviewsJson)
          ? reviewsJson.map((r: any) => ({
            id: r.id,
            content: r.content,
            createdAt: r.createdAt,
            user: {
              name: r.user?.name || "Anonim",
              image: r.user?.image || null,
            },
            reply: r.reply,
            replyBy: r.replyBy,
            admin: r.admin ? { name: r.admin.name, role: "Admin" } : null,
          }))
          : [];
        setReviews(reviewsData);
      } else {
        setReviews([]);
      }
      // Process ratings data
      let processedRatings: Rating[];
      if (ratingsResponse.ok) {
        const ratingsJson = await ratingsResponse.json();
        const ratingsList = ratingsJson.ratings || [];
        const averageFromApi = ratingsJson.average || 0;

        // Hitung count untuk setiap rating value
        const ratingCounts = [1, 2, 3, 4, 5].map((value) => {
          const count = ratingsList.filter((r: any) => r.value === value).length;
          return { value, count };
        });

        // Reverse untuk urutan 5 ke 1
        processedRatings = ratingCounts.reverse();

        // Set state dengan data dari API
        setTotalReviews(ratingsList.length);
        setAverageRating(Number(averageFromApi.toFixed(1)));

        // Update product rating
        if (productData.rating !== averageFromApi) {
          setProduct((prev) => (prev ? { ...prev, rating: averageFromApi } : null));
        }
      } else {
        processedRatings = processRatingsData(null);
        setTotalReviews(0);
        setAverageRating(0);
      }

      setRatings(processedRatings);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memuat data"
      );
      setRatings(processRatingsData(null));
      setTotalReviews(0);
      setAverageRating(0);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      setShowStickyBar(scrollPosition > windowHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("IDR", "Rp");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const showLoginAlert = () => {
    setToast({
      message: "Anda harus login terlebih dahulu.",
      type: "error",
    });
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!product) {
      setToast({ message: "Produk tidak ditemukan.", type: "error" });
      return;
    }

    if (product.stock === 0) {
      setToast({ message: "Stok produk habis.", type: "error" });
      return;
    }
    if (product.stock < quantity) {
      setToast({ message: "Stok produk tidak mencukupi.", type: "error" });
      return;
    }

    if (!user) {
      router.push(`/auth/signin?callbackUrl=/products/${product.id}`);
      return;
    }

    // 3. Cek Role Admin
    if (user.role === "ADMIN") {
      setToast({
        message: "Akun admin tidak dapat membeli produk.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          productId: product.id,
          quantity
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }

      router.push(`/checkout?orderId=${result.order.id}`);

    } catch (error) {
      console.error('Error creating order:', error);
      setToast({
        message: "Gagal membuat pesanan. Silakan coba lagi.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!user) {
      showLoginAlert();
      return;
    }

    if (user.role === "ADMIN") {
      setToast({
        message: "Akun admin tidak dapat menambahkan produk ke keranjang.",
        type: "error",
      });
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity,
          unitPrice: product?.price,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setTimeout(() => incrementCart(), 100);
        setToast({
          message: `${quantity} produk berhasil ditambahkan ke keranjang!`,
          type: "success",
        });
        setQuantity(1);
      } else {
        const result = await response.json();
        setToast({
          message: result.error || "Gagal menambahkan ke keranjang.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error terjadi:", error);
      setToast({
        message: "Terjadi kesalahan saat menambahkan ke keranjang.",
        type: "error",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      showLoginAlert();
      return;
    }

    if (user.role === "ADMIN") {
      setToast({
        message: "Akun admin tidak dapat memberikan ulasan.",
        type: "error",
      });
      return;
    }

    setIsRatingOpen(true);
  };

  if (loading) {
    return (
      <>
        <NavSearch />
        <div className="min-h-screen bg-gray-50">
          <ProductSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <NavSearch />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {error || "Produk tidak ditemukan"}
            </p>
            <button
              onClick={handleGoBack}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Kembali
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <Suspense>
      <NavSearch />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Product Detail Container */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 mt-20 md:mt-22">
            {/* Back Button */}
            <div className="px-6 py-4 border-b border-gray-100">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Kembali</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:ml-10 lg:mr-12">
              {/* Product Images */}
              <div className="space-y-7">
                <div className="aspect-square relative bg-gray-50 rounded-xl overflow-hidden w-full max-w-[500px] max-h-[500px]">
                  <img
                    src={
                      product.imageUrl?.[selectedImage] || "/placeholder.svg"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                  <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span className="sr-only">Klik untuk memperbesar</span>
                  </button>
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-3">
                  {product.imageUrl?.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${selectedImage === index
                        ? "border-green-500 ring-2 ring-green-200"
                        : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>
                  {product.weight && (
                    <p className="text-gray-600 mb-2">{product.weight}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Kategori: {product.category?.name || "Tidak ada kategori"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({totalReviews} ulasan)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Stok: </span>
                    <span className="font-medium text-gray-900">
                      {product.stock}
                    </span>
                    <span
                      className={`ml-2 font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {product.stock > 0 ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-xl transition-colors"
                  >
                    Beli Sekarang
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || addingToCart}
                    className="flex-1 border-2 border-green-500 text-green-500 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Menambahkan...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Tambah Keranjang</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-green-600 mb-3 text-sm">
                    Deskripsi Produk
                  </h3>

                  <div className="text-gray-700 mb-3 leading-relaxed text-sm">
                    {product.description || "Tidak ada deskripsi produk."}
                  </div>

                  {product.category && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Kategori:</span>
                        <span className="ml-2">{product.category.name}</span>
                      </div>
                    </div>
                  )}

                  {product.createdAt && (
                    <div className="text-xs text-gray-500 mt-2">
                      Ditambahkan:{" "}
                      {new Date(product.createdAt).toLocaleDateString("id-ID")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Produk Terkait
                </h2>
              </div>
            </div>
            <div className="p-6">
              {RelatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {RelatedProducts.map((relatedProduct) => (
                    <a
                      key={relatedProduct.id}
                      href={`/katalog/detail?id=${relatedProduct.id}`}
                      className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-gray-50 relative">
                        <img
                          src={relatedProduct.imageUrl[0] || "/placeholder.svg"}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <p className="text-green-600 font-bold">
                          {formatPrice(relatedProduct.price)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada produk terkait
                </p>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <RatingSection
            averageRating={averageRating}
            totalReviews={totalReviews}
            ratings={ratings}
            product={{
              id: product.id,
              name: product.name,
              image: product.imageUrl[0],
              qty: 1,
              price: product.price,
            }}
            orderNumber="123"
          />

          {/* Review Section */}
          <div className="mb-8 mt-2">
            {reviews.length > 0 ? (
              <ReviewSection reviews={reviews} userRole={user?.role} />
            ) : (
              <div className="text-center py-8 rounded-lg bg-white">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold text-lg">
                  Belum ada ulasan untuk produk ini
                </p>
                <p className="text-gray-400 mt-2 mb-4">
                  Jadilah yang pertama memberikan ulasan!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 🔥 PERBAIKAN: FormRating Modal dengan onSubmitSuccess */}
        <FormRating
          open={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          onSubmitSuccess={async () => {
            // Close modal terlebih dahulu
            setIsRatingOpen(false);

            // Tampilkan toast loading
            setToast({
              message: "Memuat ulang data...",
              type: "success",
            });

            // Re-fetch data setelah submit rating
            await fetchData();

            // Tampilkan toast sukses
            setToast({
              message: "Rating dan ulasan berhasil ditambahkan!",
              type: "success",
            });
          }}
          product={{
            id: product.id,
            name: product.name,
            image: product.imageUrl[0],
            qty: 1,
            price: product.price,
          }}
          orderNumber="123"
        />

        {/* Sticky Bar */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 z-50 ${showStickyBar ? "translate-y-0" : "translate-y-full"
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={product.imageUrl?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-xs truncate">
                  {product.name}
                </h3>
                <div className="text-gray-500 text-xs">Total Harga</div>
                <div className="font-bold text-green-600 text-sm">
                  {formatPrice(product.price * quantity)}
                </div>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 py-1.5 font-medium text-sm min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="lex items-center justify-center bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors text-xs  cursor-pointer whitespace-nowrap"
                >
                  Beli<br /> Sekarang
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className="border border-green-500 text-green-500 hover:bg-green-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  {addingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  <span className="sr-only">Tambah Keranjang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

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
    </Suspense>
  );
};

export default ProductDetailPage;