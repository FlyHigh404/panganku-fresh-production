"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";
import CartProduct from "@/components/CartProduct";

// --- Interface ---
interface Category {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface ProductWithCategory {
  id: string | number;
  imageUrl: string;
  name: string;
  weight?: string;
  stock?: number;
  description?: string;
  price: number;
  category: Category | null;
  averageRating?: number;
}

interface KatalogGroupProps {
  title: string;
  products: ProductWithCategory[];
  linkHref: string;
}

const KatalogGroup: React.FC<KatalogGroupProps> = ({ title, products, linkHref }) => {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 px-4 md:px-0">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h3>
        <Link
          href={linkHref}
          className="flex items-center text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
        >
          Lihat Semua
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
          {products.slice(0, 5).map((product, index) => (
            <div key={product.id} className="w-full min-w-[150px] sm:min-w-0 snap-center">
              <CartProduct product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function KatalogSection() {
  const [sayuranProducts, setSayuranProducts] = useState<ProductWithCategory[]>([]);
  const [buahProducts, setBuahProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/search`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error(`Gagal mengambil produk: ${response.status}`);

        const data = await response.json();

        // Standarisasi produk
        const allProducts: ProductWithCategory[] = (Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : Array.isArray(data.data)
              ? data.data
              : []
        ).map((p: any) => ({
          id: p.id,
          name: p.name,
          imageUrl: p.imageUrl || "/placeholder.svg",
          weight: p.weight || "",
          stock: p.stock || 0,
          description: p.description || "",
          price: p.price || 0,
          category: p.category ? { name: p.category.name } : p.categoryName ? { name: p.categoryName } : null,
        }));

        // Filter kategori
        const sayuranSegarProducts = allProducts.filter(
          (product) => product.category?.name?.toLowerCase() === "sayuran segar"
        );

        const buahSegarProducts = allProducts.filter(
          (product) => product.category?.name?.toLowerCase() === "buah segar"
        );

        // Debug log (tetap dipertahankan)
        console.log("All Products:", allProducts);
        console.log("Sayuran Products:", sayuranSegarProducts);
        console.log("Available categories:", [...new Set(allProducts.map((p) => p.category?.name))]);

        setSayuranProducts(sayuranSegarProducts);
        setBuahProducts(buahSegarProducts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="katalog" className="py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        <span className="ml-3 text-gray-600">Memuat Katalog Produk...</span>
      </section>
    );
  }

  if (error) {
    return (
      <section id="katalog" className="py-16 text-center text-red-600">
        Error: {error}
      </section>
    );
  }

  if (
    (!Array.isArray(sayuranProducts) || sayuranProducts.length === 0) &&
    (!Array.isArray(buahProducts) || buahProducts.length === 0)
  ) {
    return (
      <section id="katalog" className="py-16 text-center">
        <p className="text-gray-500 text-lg">Tidak ada produk dalam kategori yang tersedia</p>
      </section>
    );
  }

  return (
    <section id="katalog" className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <KatalogGroup title="Sayuran Segar" products={sayuranProducts} linkHref="/katalog" />
      <KatalogGroup title="Buah Segar" products={buahProducts} linkHref="/katalog" />
    </section>
  );
}
