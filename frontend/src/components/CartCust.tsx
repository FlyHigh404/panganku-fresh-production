"use client";
import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

// --- INTERFACE ---
interface CartItemData {
  id: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface CartItemProps extends CartItemData {
  index: number;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const DROPDOWN_MAX_HEIGHT_CLASS = "max-h-[320px]";

// --- KOMPONEN ITEM KERANJANG ---
const CartItem: React.FC<CartItemProps> = ({
  name,
  quantity,
  price,
  imageUrl,
  index,
}) => {
  const isGreenBackground = index % 2 !== 0;
  const rowClass = isGreenBackground ? "bg-white" : "bg-green-50";

  return (
    <div
      className={`flex p-2.5 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${rowClass}`}
    >
      <div className="w-10 h-10 mr-3 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate pr-2">
          {name}
        </p>
        <p className="text-xs text-gray-600 leading-snug">Qty: x{quantity}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <span className="block text-sm font-bold text-gray-800 mt-2">
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA CARTCUST ---
const CartCust: React.FC = () => {
  const token = localStorage.getItem('token');
  const router = useRouter();
  const [isClickedOpen, setIsClickedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Ambil data dari context
  const { cartCount, fetchCartCount } = useCart();

  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(false);

  const isDropdownVisible = isClickedOpen || isHovered;

  // Di dalam useEffect fetchCart (baris ~85)
  useEffect(() => {
    if (isDropdownVisible) {
      const fetchCart = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart`, {
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache',
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();

          if (response.ok) {
            const orderItems = data.orderItems || [];
            const formattedItems = orderItems.map((item: any) => ({
              id: item.id,
              name: item.product.name,
              price: parseFloat(item.unitPrice),
              quantity: item.quantity,
              imageUrl: item.product.imageUrl[0] || "/placeholder.svg",
            }));
            setCartItems(formattedItems);

            const totalQty = formattedItems.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0);

            // Update cart count dari hasil fetch actual
            if (totalQty !== cartCount) {
              fetchCartCount();
            }
          } else {
            setCartItems([]);
          }
        } catch (err) {
          console.error("Gagal ambil cart:", err);
          setCartItems([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }
  }, [isDropdownVisible, cartCount, fetchCartCount]);

  // Tutup dropdown saat klik luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target as Node)
      ) {
        setIsClickedOpen(false);
        setIsHovered(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Jika sedang dibuka, tutup dan refresh count
    if (isClickedOpen) {
      setIsClickedOpen(false);
      fetchCartCount();
    } else {
      setIsClickedOpen(true);
    }
    setIsHovered(false);
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsClickedOpen(false);
    setIsHovered(false);
    router.push("/cart");
  };

  const badgeContent = cartCount > 99 ? "99+" : cartCount;

  return (
    <div
      className="relative"
      ref={componentRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => !isClickedOpen && setIsHovered(false)}
    >
      {/* Tombol Ikon Keranjang */}
      <button
        onClick={(e) => {
          handleIconClick(e);
          // Hanya navigate jika dropdown tidak visible
          if (!isDropdownVisible) {
            router.push("/cart");
          }
        }}
        className={`relative p-2 rounded-lg transition ${isClickedOpen || isHovered ? "bg-green-100" : "hover:bg-green-100"
          }`}
        aria-expanded={isDropdownVisible}
        aria-haspopup="true"
        aria-controls="cart-dropdown"
      >
        <ShoppingCart
          className={`w-6 h-6 text-[#4BBF42] transition-transform  cursor-pointer duration-200 ease-out 
            ${isHovered ? "scale-110" : "scale-100"}`}
        />
        {/* Badge jumlah item */}
        <span
          className={`absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold`}
        >
          {badgeContent}
        </span>
      </button>

      {/* Dropdown */}
      {isDropdownVisible && (
        <div
          id="cart-dropdown"
          className={`absolute right-0 mt-3 w-[280px] sm:w-[360px] md:w-[420px] ${DROPDOWN_MAX_HEIGHT_CLASS} overflow-y-auto bg-white rounded-lg shadow-2xl z-50 border border-gray-200`}
          style={{ zIndex: 60 }}
        >
          <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-md">
            <h3 className="text-lg font-bold text-gray-800">
              Keranjang ({cartCount})
            </h3>
            <button
              onClick={handleViewMore}
              className="text-xs text-green-600 hover:underline"
            >
              Lihat Selengkapnya
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Memuat keranjang...
            </div>
          ) : cartItems.length === 0 ? (
            <div className="p-6 text-center">
              <Image
                src="/bgcart.png"
                alt="Keranjang kosong"
                width={140}
                height={140}
                className="mx-auto w-28 h-28 object-contain mb-3"
              />
              <h2 className="text-[14px] font-semibold text-gray-800 mb-1">
                Keranjang Kosong
              </h2>
              <p className="text-[10px] text-gray-500">
                Cari dan tambahkan produk yang akan kamu beli ke keranjang
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <CartItem key={item.id} {...item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartCust;