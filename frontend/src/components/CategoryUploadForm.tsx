"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Category {
    id: string;
    name: string;
}

interface CategoryFormData {
    name: string;
    description: string;
}

interface CategoryUploadFormProps {
    initialData?: any;
    onClose?: () => void;
    onSuccess?: (categoryName: string, isEdit: boolean) => void;
}

export default function CategoryUploadForm({ initialData, onClose, onSuccess }: CategoryUploadFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/products/categories`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
            });
        }
    }, [initialData]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        const token = localStorage.getItem('token');

        e.preventDefault();
        setLoading(true);

        try {
            const categoryData = {
                ...formData,
            };

            let response;
            const isEdit = !!initialData;

            if (isEdit) {
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/categories/${initialData.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(categoryData),
                });
            } else {
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/categories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(categoryData),
                });
            }

            if (response.ok) {
                if (onSuccess) {
                    onSuccess(formData.name, isEdit);
                }

                setTimeout(() => {
                    if (onClose) {
                        onClose();
                    }
                }, 100);
            } else {
                const errorData = await response.json();
                alert(errorData.error || "Failed to save category");
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
                <h3 className="text-lg font-medium text-gray-700 mb-6">Isi detail kategori</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Name */}
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
                            placeholder="Nama Kategori"
                        />
                        <label
                            htmlFor="name"
                            className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
                peer-focus:text-green-600"
                        >
                            Nama kategori
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
                            placeholder="Deskripsi kategori"
                        />
                        <label
                            htmlFor="description"
                            className="absolute left-4 top-1.5 text-sm text-green-600 transition-all 
                peer-focus:text-green-600"
                        >
                            Deskripsi Kategori
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-8">
                    <button
                        type="submit"
                        disabled={loading}
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
    );
}