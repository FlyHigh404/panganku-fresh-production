// components/ProductUploadForm.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Loader2, CheckCircle2 } from "lucide-react"
import FileDropzone from "./FileDropZone"

interface Category {
  id: string
  name: string
}

interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  categoryId: string
  imageUrl: string[]
}

interface ProductUploadFormProps {
  initialData?: any;
  onClose?: () => void;
  onSuccess?: (productName: string, isEdit: boolean) => void;
}

export default function ProductUploadForm({ initialData, onClose, onSuccess }: ProductUploadFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: [],
  })

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/categories`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        stock: initialData.stock?.toString() || "",
        categoryId: initialData.category?.id || "",
        imageUrl: initialData.imageUrl || [],
      });

      setPreviewUrls(initialData.imageUrl || []);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFilesDrop = (files: FileList) => {
    const arr = Array.from(files)
    setPendingFiles((prev) => [...prev, ...arr])
    const newPreviews = arr.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newPendingFiles = pendingFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    if (index < formData.imageUrl.length) {
      const newImageUrls = formData.imageUrl.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        imageUrl: newImageUrls,
      }));
    }

    setPendingFiles(newPendingFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem('token');
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedUrls: string[] = [...formData.imageUrl];

      for (const file of pendingFiles) {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/upload`, {
          method: "POST", body: fd, headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        uploadedUrls.push(data.url);
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: uploadedUrls,
      };

      let response;
      const isEdit = !!initialData;

      if (isEdit) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/products/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(productData),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(productData),
        });
      }

      if (response.ok) {
        // Panggil callback onSuccess dengan nama produk dan status edit
        if (onSuccess) {
          onSuccess(formData.name, isEdit);
        }

        // Tutup modal setelah delay singkat
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 100);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save product");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-left mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-6">Isi detail produk</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <div className="mb-8">
          {previewUrls.length > 0 ? (
            <div>
              <div className="relative">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                  <img
                    src={previewUrls[0]}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {previewUrls.length > 1 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {previewUrls.slice(1).map((url, index) => (
                      <div key={index + 1} className="relative group">
                        <img
                          src={url}
                          alt={`Product image ${index + 2}`}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index + 1)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => removeImage(0)}
                    className="bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 hover:bg-white shadow-sm"
                    title="Hapus gambar"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative border-2 border-dashed border-green-400 rounded-lg p-6 bg-white hover:bg-green-50 transition-colors">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 text-green-500">
                      <img src="/export.png" alt="" />
                    </div>
                    <p className="text-gray-700 font-medium">Tambah gambar lain (klik/drag disini)</p>
                  </div>
                  <FileDropzone
                    onFilesDrop={handleFilesDrop}
                    accept="image/*"
                    multiple={true}
                    label="Tambah gambar lain"
                    id="product-images-additional"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
              <div className="py-12 text-center">
                <img src="/export.png" className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">Upload gambar produk</p>
                  <p className="text-gray-500">Klik untuk memilih file atau drag & drop di sini</p>
                  <p className="text-sm text-gray-400">Mendukung format: JPEG, JPG & PNG</p>
                </div>
              </div>
              <FileDropzone
                onFilesDrop={handleFilesDrop}
                accept="image/*"
                multiple={true}
                label="Upload gambar produk"
                id="product-images-initial"
              />
            </div>
          )}
        </div>

        {/* Product Name */}
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900"
              placeholder="Nama Produk"
            />
            <label
              htmlFor="name"
              className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
        peer-focus:text-green-600"
            >
              Nama produk
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="relative">
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="peer w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg 
      focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900 resize-none"
              placeholder="Deskripsi produk"
            />
            <label
              htmlFor="description"
              className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
      peer-focus:text-green-600"
            >
              Deskripsi Produk
            </label>
          </div>
        </div>

        {/* Category */}
        <div className="relative">
          <div className="relative">
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="peer w-full px-4 pt-3 pb-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-500 bg-white appearance-none"
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Price */}
        <div className="relative">
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900"
              placeholder="Rp"
            />
            <label
              htmlFor="price"
              className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
        peer-focus:text-green-600"
            >
              Harga
            </label>
            <img src="/dollar-circle.png" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Stock */}
        <div className="relative">
          <div className="relative">
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              min="0"
              className="peer w-full px-4 pt-6 pb-2 pr-12 border border-gray-300 rounded-lg 
        focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-900"
              placeholder="0"
            />
            <label
              htmlFor="stock"
              className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
        peer-focus:text-green-600"
            >
              Stok
            </label>
            <img src="/box.png" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={loading || previewUrls.length === 0}
            className="w-full bg-[#26A81D] hover:bg-[#21961A] text-white py-4 px-6 rounded-lg font-medium text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Menyimpan...
              </>
            ) : (
              "Konfirmasi"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}