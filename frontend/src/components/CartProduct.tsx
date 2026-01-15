"use client";
import { LogIn, Plus, X, Star, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/product";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const Toast = ({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) => (
  <div className="fixed top-26 right-4 z-[100] animate-slide-in">
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-50 border border-green-200' :
        'bg-red-50 border border-red-200'
      }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
      )}
      <p className={`text-sm font-medium ${type === 'success' ? 'text-green-800' : 'text-red-800'
        }`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className={`ml-2 ${type === 'success' ? 'text-green-600 hover:text-green-700' :
            'text-red-600 hover:text-red-700'
          }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

interface CartProductProps {
  product: Product;
  index: number;
}

const CartProduct: React.FC<CartProductProps> = ({ product, index }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [averageRating, setAverageRating] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { user } = useAuth()
  const token = localStorage.getItem('token');
  const router = useRouter();
  const { incrementCart } = useCart();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchProductRating = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/${product.id}/ratings`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const ratingData = await response.json();
          setAverageRating(ratingData.average || 0);
        }
      } catch (error) {
        console.error("Error fetching product rating:", error);
      }
    };

    fetchProductRating();
  }, [product.id]);

  const renderRating = () => (
    <div className="flex items-center gap-1 mb-1">
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <span className="text-xs text-gray-600 font-medium">
        {averageRating.toFixed(1)}
      </span>
    </div>
  );

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setErrorMessage("Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang.");
      setShowErrorModal(true);
      return;
    }

    if (user.role === "ADMIN") {
      setErrorMessage("Akun admin tidak dapat menambahkan produk ke keranjang.");
      setShowErrorModal(true);
      return;
    }

    setIsAddingToCart(true);

    try {
      const data = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data),
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
    } catch (error: any) {
      console.error("Error terjadi:", error);
      setToast({
        message: "Terjadi kesalahan saat menambahkan ke keranjang.",
        type: 'error'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleLoginRedirect = () => {
    setShowErrorModal(false);
    router.push("/auth/signin");
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const formatPrice = (price: string | number) => {
    const numericPrice = Number(price);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numericPrice);
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-transparent backdrop-blur-sm"
            onClick={closeErrorModal}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <button
              onClick={closeErrorModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#26A81D] rounded-full flex items-center justify-center">
                <LogIn size={32} className="text-white" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Login Diperlukan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeErrorModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={user?.role === "ADMIN" ? closeErrorModal : handleLoginRedirect}
                className="flex-1 px-4 py-3 bg-[#26A81D] hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                {user?.role === "ADMIN" ? "Tutup" : "Login"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Link href={`/katalog/${product.id}`} passHref>
        <div
          key={product.id}
          className="cursor-pointer bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-1.5 sm:p-3 lg:p-2 shadow-sm sm:shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group animate-card-appear"
          style={{ animationDelay: `${900 + index * 200}ms` }}
        >
          <div className="mb-2 sm:mb-4 bg-gray-50 rounded-lg overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
            <Image
              src={product.imageUrl[0] || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={250}
              className="w-full h-20 sm:h-28 lg:h-24 object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          <h4 className="font-bold text-sm sm:text-base lg:text-sm text-gray-800 mb-1 group-hover:text-green-600 transition-colors duration-300">
            {product.name}{" "}
            <span className="font-normal text-gray-600 text-xs sm:text-sm">{product.weight}</span>
          </h4>

          {renderRating()}

          <p className="text-gray-500 text-xs sm:text-sm lg:text-xs mb-1">
            Sisa stok: {product.stock}
          </p>

          <p className="text-gray-600 text-[0.65rem] sm:text-xs lg:text-[0.7rem] mb-1 line-clamp-2">
            {product.description}
          </p>

          <span className="block text-sm sm:text-base lg:text-sm font-bold text-gray-800 mb-1.5">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={isAddingToCart || product.stock === 0}
            className={`w-full py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs lg:text-[10px] transition-all duration-300 flex items-center justify-center gap-1 transform active:scale-95 ${isAddingToCart
                ? "bg-gray-400 cursor-not-allowed"
                : product.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white hover:shadow-lg hover:scale-105"
              }`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="ml-1">Menambahkan...</span>
              </>
            ) : product.stock === 0 ? (
              "Stok Habis"
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Tambah Keranjang
              </>
            )}
          </button>
        </div>
      </Link>

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
    </>
  );
};

export default CartProduct;