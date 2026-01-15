"use client"
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import InputBox from "@/components/InputBox";

type Address = {
  id: string;
  recipientName: string;
  phoneNumber: string;
  label: string;
  fullAddress: string;
  note?: string;
  isPrimary: boolean;
};

type EditAddressProps = {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null;
  onSave: (updatedAddress: Address) => void;
  existingAddresses: Address[];
};

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

const Checkbox = ({
  label,
  checked,
  onChange,
  children,
  disabled = false
}: {
  label?: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
  disabled?: boolean
}) => (
  <label className={`flex items-start gap-2 cursor-pointer text-xs sm:text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 rounded border border-[#8F8F8F] bg-transparent focus:ring-green-500 text-green-600 mt-0.5"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
    <span className="flex-1 text-gray-700 font-normal leading-snug">
      {label}
      {children}
    </span>
  </label>
);

export default function EditAddress({ isOpen, onClose, address, onSave, existingAddresses }: EditAddressProps) {
  const [addressEdit, setAddressEdit] = useState<Address | null>(address);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAddressEdit(address);
  }, [address]);


  const hasExistingPrimary = existingAddresses.some(
    addr => addr.isPrimary && addr.id !== addressEdit?.id
  );

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    if (!addressEdit) return;

    if (!addressEdit.recipientName.trim()) {
      return;
    }
    if (!addressEdit.phoneNumber.trim()) {
      return;
    }
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(addressEdit.phoneNumber)) {
      return;
    }
    if (!addressEdit.fullAddress.trim()) {
      return;
    }

    if (addressEdit.isPrimary && hasExistingPrimary) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address/${addressEdit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(addressEdit),
      });

      if (!response.ok) throw new Error("Failed to update address");

      const updatedAddress: Address = await response.json();
      onSave(updatedAddress);
      onClose();
    } catch (error) {
      console.error("Error updating address:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setAddressEdit(prev => prev ? { ...prev, phoneNumber: numericValue } : null);
  };

  const handleIsPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAddressEdit(prev => prev ? { ...prev, isPrimary: checked } : null);
  };

  if (!isOpen || !addressEdit) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4 -top-7">
        <div
          className="fixed inset-0 bg-transparent backdrop-blur-sm"
          onClick={isSaving ? undefined : onClose}
        />

        {/* Modal Content */}
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-4 md:p-6 relative z-[10002]">
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl z-10"
            onClick={onClose}
            disabled={isSaving}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <h2 className="text-base md:text-lg font-bold text-black mb-4 text-center pr-8">
            Ubah Alamat
          </h2>
          <hr className="border-gray-200 my-3" />

          {/* Form */}
          <div className="space-y-4">
            <InputBox
              label="Label Alamat"
              value={addressEdit.label || ""}
              onChange={(e) => setAddressEdit({ ...addressEdit, label: e.target.value })}
              placeholder="misalnya Rumah, Kantor"
              disabled={isSaving}
            />

            <InputBox
              label="Alamat Lengkap"
              value={addressEdit.fullAddress}
              onChange={(e) => setAddressEdit({ ...addressEdit, fullAddress: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              disabled={isSaving}
            />

            <InputBox
              label="Catatan untuk Kurir (Opsional)"
              value={addressEdit.note || ""}
              onChange={(e) => setAddressEdit({ ...addressEdit, note: e.target.value })}
              placeholder="misalnya Warna rumah, landmark, instruksi khusus"
              disabled={isSaving}
            />

            <InputBox
              label="Nama Penerima"
              value={addressEdit.recipientName}
              onChange={(e) => setAddressEdit({ ...addressEdit, recipientName: e.target.value })}
              placeholder="Masukkan nama penerima"
              disabled={isSaving}
            />

            <InputBox
              label="Nomor Telepon"
              value={addressEdit.phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="08xxxxxxxxxx"
              disabled={isSaving}
            />

            <div className="mt-4">
              <Checkbox
                label="Jadikan alamat utama"
                checked={addressEdit.isPrimary}
                onChange={handleIsPrimaryChange}
                disabled={hasExistingPrimary && !addressEdit.isPrimary}
              >
                {hasExistingPrimary && !addressEdit.isPrimary && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sudah ada alamat utama. Hapus status utama dari alamat lain terlebih dahulu.
                  </p>
                )}
              </Checkbox>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <button
              className="w-full bg-green-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </>
  );
}