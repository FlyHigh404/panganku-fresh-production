"use client";
import { useState, useEffect } from "react";
import AdminLayout from "../AdminLayout";
import { Search, Plus, Edit, Trash2, Filter, ChevronDown, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import ProductUploadForm from "@/components/ProductUploadForm";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    description: string;
    category: { name: string };
    price: number;
    stock: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedStockStatus, setSelectedStockStatus] = useState("Semua");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string; category?: string } | null>(null);

  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false);
  const [deletedProductName, setDeletedProductName] = useState("");

  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [savedProductInfo, setSavedProductInfo] = useState({ name: "", isEdit: false });

  const handleProductSaveSuccess = (productName: string, isEdit: boolean) => {
    setSavedProductInfo({ name: productName, isEdit });
    setSaveSuccessOpen(true);
    fetchProducts(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (silentRefresh = false) => {
    const token = localStorage.getItem('token');
    try {
      if (!silentRefresh) {
        setLoading(true);
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/products`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      if (!silentRefresh) {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (product: { id: string; name: string; category?: { name: string } }) => {
    setProductToDelete({
      id: product.id,
      name: product.name,
      category: product.category?.name
    });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('token');
    
    if (!productToDelete) return;

    setIsDeleting(productToDelete.id);
    setDeleteConfirmOpen(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setDeletedProductName(productToDelete.name);

      setDeleteSuccessOpen(true);

      await fetchProducts(true);

    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsDeleting(null);
      setProductToDelete(null);
    }
  };

  const handleApplyFilter = () => {
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setSelectedCategory("Semua Kategori");
    setSelectedStockStatus("Semua");
    setShowFilter(false);
  };

  const categories = ["Semua Kategori", ...Array.from(new Set(products.map(p => p.category.name)))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua Kategori" ||
      product.category.name === selectedCategory;

    const matchesStock =
      selectedStockStatus === "Semua" ||
      (selectedStockStatus === "Tersedia" && product.stock > 0) ||
      (selectedStockStatus === "Stok Habis" && product.stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  if (loading) {
    return (
      <AdminLayout>
        <main className="flex-1 bg-gray-50 pt-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          </div>
        </main>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <main className="flex-1 bg-gray-50 pt-2">
        {/* Main Container with shadow and rounded corners */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-4 sm:pt-6 sm:pb-0 bg-white">
            <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
              {/* Header Text */}
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tabel produk</h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Ini adalah daftar produk terbaru</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 mr-3">
                {/* Search Bar */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Filter and Add buttons container */}
                <div className="flex space-x-2 sm:space-x-3">
                  {/* Filter Button */}
                  <div className="relative flex-1 sm:flex-none">
                    <button
                      onClick={() => setShowFilter(!showFilter)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-colors text-sm w-full sm:w-auto"
                    >
                      <Filter className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Filter</span>
                      <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Add Product Button */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-colors font-medium text-sm flex-1 sm:flex-none"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Tambah Produk</span>
                    <span className="sm:hidden">Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="p-4 sm:p-6">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${isDeleting === product.id ? "opacity-50" : ""
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                      <p className="text-gray-600 text-xs mt-1">{product.category.name}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
                        title="Edit"
                        disabled={isDeleting === product.id}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Delete"
                        disabled={isDeleting === product.id}
                      >
                        {isDeleting === product.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-900 font-medium">
                      Rp {product.price.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`font-medium ${product.stock === 0 ? "text-red-600" : "text-gray-900"
                        }`}
                    >
                      Stok: {product.stock}
                    </span>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
                  <p className="text-sm mt-1">Coba ubah kata kunci pencarian atau filter Anda</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      NAMA
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      KATEGORI
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      HARGA
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      STOK
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                      TINDAKAN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } ${isDeleting === product.id ? "opacity-50" : ""}`}
                    >
                      <td className="py-5 px-6">
                        <div className="font-medium text-gray-900 text-sm">
                          {product.name}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-gray-600 text-sm">
                          {product.category.name}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-gray-900 font-medium text-sm">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`font-medium text-sm ${product.stock === 0 ? "text-red-600" : "text-gray-900"
                            }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer"
                            title="Edit"
                            disabled={isDeleting === product.id}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                            title="Delete"
                            disabled={isDeleting === product.id}
                          >
                            {isDeleting === product.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 px-6 text-center bg-white">
                        <div className="text-gray-500">
                          <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
                          <p className="text-sm mt-1">Coba ubah kata kunci pencarian atau filter Anda</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && productToDelete && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 md:p-8 relative animate-scale-in">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Hapus Produk?
                </h2>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 mb-2">
                  Apakah Anda yakin ingin menghapus produk ini?
                </p>

                {/* Product Preview */}
                <div className="w-full bg-gray-50 rounded-lg p-3 mb-6 text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {productToDelete.name}
                  </p>
                  {productToDelete.category && (
                    <p className="text-xs text-gray-600 mb-1">
                      Kategori: {productToDelete.category}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Produk ini akan dihapus secara permanen
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    className="flex-1 px-4 py-2.5 md:py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
                    onClick={() => {
                      setDeleteConfirmOpen(false);
                      setProductToDelete(null);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="flex-1 px-4 py-2.5 md:py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm md:text-base"
                    onClick={handleDeleteConfirm}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Success Modal */}
        {deleteSuccessOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 md:p-8 relative animate-scale-in">
              <div className="flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  Produk Berhasil Dihapus!
                </h2>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Produk <span className="font-semibold text-gray-900">{deletedProductName}</span> telah dihapus dari sistem
                </p>

                {/* OK Button */}
                <button
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
                  onClick={() => setDeleteSuccessOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save/Edit Success Modal */}
        {saveSuccessOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 md:p-8 relative animate-scale-in">
              <div className="flex flex-col items-center text-center">
                {/* Success Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>

                {/* Title */}
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  {savedProductInfo.isEdit ? "Produk Berhasil Diperbarui!" : "Produk Berhasil Ditambahkan!"}
                </h2>

                {/* Description */}
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Produk <span className="font-semibold text-gray-900">{savedProductInfo.name}</span> telah {savedProductInfo.isEdit ? "diperbarui" : "ditambahkan"} ke sistem
                </p>

                {/* OK Button */}
                <button
                  className="w-full px-4 py-2.5 md:py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
                  onClick={() => setSaveSuccessOpen(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            {/* Modal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  Tambah Produk
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <ProductUploadForm onClose={() => setShowAddModal(false)} onSuccess={handleProductSaveSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-4 sm:px-6 py-4 rounded-t-xl">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
                  Edit Produk
                </h2>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <ProductUploadForm initialData={editingProduct} onClose={() => setEditingProduct(null)} onSuccess={handleProductSaveSuccess} />
              </div>
            </div>
          </div>
        )}

        {/* Filter Dropdown - Centered */}
        {showFilter && (
          <div className="fixed inset-0 z-40 flex items-start justify-center pt-32">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowFilter(false)}
            />

            {/* Filter Card */}
            <div
              className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 sm:p-8 w-full max-w-md mx-4 relative z-10 animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Filter Produk</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem'
                    }}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Stok</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem'
                    }}
                    value={selectedStockStatus}
                    onChange={(e) => setSelectedStockStatus(e.target.value)}
                  >
                    <option value="Semua">Semua</option>
                    <option value="Tersedia">Tersedia</option>
                    <option value="Stok Habis">Stok Habis</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:bg-green-700 transition-colors"
                    onClick={handleApplyFilter}
                  >
                    Terapkan
                  </button>
                  <button
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg text-base font-semibold hover:bg-gray-200 transition-colors"
                    onClick={handleResetFilter}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
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
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
};

export default Products;