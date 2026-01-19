"use client"
import React, { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import InputBox from "@/components/InputBox"
import { User, Smartphone, Home, MapPin, ClipboardList, Search, CheckCircle } from "lucide-react"
import { useToast, Toast } from "@/components/Toast"
import { useMapEvents } from 'react-leaflet'
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import 'leaflet/dist/leaflet.css'

type Address = {
  id: string
  userId?: string
  recipientName: string
  phoneNumber: string
  label: string
  fullAddress: string
  note?: string
  isPrimary: boolean
}

interface AddAddressProps {
  id?: string
  isOpen: boolean
  onClose: () => void
  onSave: (address: Address) => void
}

const Checkbox = ({
  label,
  checked,
  onChange,
  children,
}: {
  label?: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
}) => (
  <label className="flex items-start gap-2 cursor-pointer text-xs sm:text-sm">
    <input
      type="checkbox"
      className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 rounded border border-[#8F8F8F] bg-transparent focus:ring-green-500 text-green-600 mt-0.5"
      checked={checked}
      onChange={onChange}
    />
    <span className="flex-1 text-gray-700 font-normal leading-snug">
      {label}
      {children}
    </span>
  </label>
)

// map
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

// make the icon
const customIcon = L.divIcon({
  html: renderToStaticMarkup(
     <MapPin size={24} fill="#ff0000"></MapPin>
  ),
  className: 'custom-leaflet-icon', // prevents default leaflet styles
  iconSize: [32, 32],
  iconAnchor: [16, 32], // points the bottom center of the icon to the coord
});


const AddAddress: React.FC<AddAddressProps> = ({ isOpen, onClose, onSave }) => {
  const [recipientName, setRecipientName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [labelAddress, setLabelAddress] = useState("")
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    houseNumber: "",
    kelurahan: "",
    kecamatan: "",
    regency: "Bekasi", // Default
  })
  const [tempCoords, setTempCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [finalCoords, setFinalCoords] = useState<{ lat: number, lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [note, setNote] = useState("")
  const [isPrimary, setIsPrimary] = useState(false)
  const [agree, setAgree] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // store coordinate
  const STORE_COORDS = {
    lat: -6.253669190045658, lng: 107.08002424641867
  }
  // calculate radius
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // on map pin click
  const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
      click: (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setPhoneNumber(numericValue)
  }

  if (!isOpen) return null

  const handleSearchLocation = async () => {
    const fullString = `${addressDetails.street} ${addressDetails.houseNumber}, ${addressDetails.kelurahan}, ${addressDetails.kecamatan}, ${addressDetails.regency}`;
    setIsSearching(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/shipping/geocode?q=${encodeURIComponent(fullString)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await res.json();

      if (data.length > 0) {
        setTempCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        // Fallback: Try to get user's current GPS if address not found
        navigator.geolocation.getCurrentPosition(
          (pos) => setTempCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => showToast("Alamat tidak ditemukan. Silakan tentukan manual di peta.", "warning")
        );
      }
    } catch (err) {
      showToast("Gagal mencari lokasi.", "error");
    } finally {
      setIsSearching(false);
    }
  }

  const handleSaveLocation = () => {
    if (!tempCoords) {
      showToast("Silakan cari lokasi terlebih dahulu.", "warning");
      return;
    }

    const distance = getDistance(STORE_COORDS.lat, STORE_COORDS.lng, tempCoords.lat, tempCoords.lng);

    if (distance > 10) {
      showToast(`Maaf, lokasi Anda (${distance.toFixed(1)}km) di luar jangkauan pengiriman kami (Max 10km).`, "error");
      setFinalCoords(null); // Clear final coords if out of range
      return;
    }

    setFinalCoords(tempCoords);
    showToast(`Lokasi tersimpan di ${tempCoords.lat.toFixed(5)}, ${tempCoords.lng.toFixed(5)}`, "success");
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!recipientName || !phoneNumber || !addressDetails.street || !agree) {
      showToast("Mohon isi semua field yang wajib diisi dan setujui syarat & ketentuan.", "warning")
      return
    }
    if (!finalCoords) {
      showToast("Silakan tentukan lokasi pada peta terlebih dahulu.", "warning");
      return;
    }
    const fullAddress = `Jalan ${addressDetails.street} No. ${addressDetails.houseNumber}, Kel/Desa ${addressDetails.kelurahan}, Kec. ${addressDetails.kecamatan}, ${addressDetails.regency}.`;

    const newAddress: Address = {
      id: Date.now().toString(),
      recipientName,
      phoneNumber,
      label: labelAddress || "Alamat",
      fullAddress: fullAddress,
      note: `${note} coords: ${finalCoords.lat}:${finalCoords.lng}` || `coords: ${finalCoords.lat}:${finalCoords.lng}`,
      isPrimary,
    }
    console.log('New address :', JSON.stringify(newAddress))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/profile/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newAddress),
      })

      const data = await response.json()

      if (response.ok) {
        onSave(newAddress)
        setRecipientName("")
        setPhoneNumber("")
        setLabelAddress("")
        setAddressDetails({
          street: "",
          houseNumber: "",
          kelurahan: "",
          kecamatan: "",
          regency: "Bekasi",
        });
        setTempCoords(null);
        setFinalCoords(null);
        setNote("")
        setIsPrimary(false)
        setAgree(false)
        onClose()
        showToast("Alamat berhasil disimpan!", "success")
      } else {
        showToast(data.message || "Gagal menyimpan alamat.", "error")
      }
    } catch (error) {
      console.error(error)
      showToast("Terjadi kesalahan saat menyimpan alamat.", "error")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-sm z-[10002] font-jakarta px-3 sm:px-0"
      onClick={handleBackdropClick}
    >
      <div className="bg-white sm:w-[650px] max-h-[90vh] sm:max-h-[85vh] rounded-xl sm:rounded-2xl p-4 sm:p-6 relative shadow-2xl z-[10001]">
        <div className="relative flex items-center border-b border-gray-200 pb-2 sm:pb-3 mb-4">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center w-full">
            Tambah Alamat
          </h2>
          <button
            className="absolute right-0 text-gray-500 hover:text-gray-700 text-lg sm:text-xl transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-3 sm:space-y-4 max-h-[calc(90vh-50px)] sm:max-h-[calc(85vh-180px)] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">

          <p className="font-semibold text-gray-800 text-sm sm:text-base">Isi alamat</p>
          <InputBox
            label="Nama Penerima"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Masukkan nama penerima"
            icon={<User size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Nomor Telepon"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            placeholder="08xxxxxxxxxx"
            icon={<Smartphone size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />
          <InputBox
            label="Label Alamat"
            value={labelAddress}
            onChange={(e) => setLabelAddress(e.target.value)}
            placeholder="misalnya Rumah, Kantor"
            icon={<Home size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />

          {/* chunked address */}
          <p className="font-semibold text-gray-800 pt-2">Detail Lokasi</p>

          <div className="grid grid-cols-2 gap-3">
            <InputBox
              label="Jalan"
              value={addressDetails.street}
              onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })}
              placeholder="Bosih" />
            <InputBox
              label="No. Rumah"
              value={addressDetails.houseNumber}
              onChange={(e) => setAddressDetails({ ...addressDetails, houseNumber: e.target.value })}
              placeholder="12" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <InputBox
              label="Kelurahan"
              value={addressDetails.kelurahan}
              onChange={(e) => setAddressDetails({ ...addressDetails, kelurahan: e.target.value })} />
            <InputBox
              label="Kecamatan"
              value={addressDetails.kecamatan}
              onChange={(e) => setAddressDetails({ ...addressDetails, kecamatan: e.target.value })} />
            <InputBox
              label="Kota/Kab"
              value={addressDetails.regency}
              onChange={(e) => setAddressDetails({ ...addressDetails, regency: e.target.value })} />
          </div>

          {/* add location box (its guessing the location with the address from user ) */}
          <button
            onClick={handleSearchLocation}
            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all"
            disabled={isSearching}
          >
            <Search size={16} /> {isSearching ? "Mencari..." : "Cek Lokasi di Peta"}
          </button>

          {/* map preview */}
          {tempCoords && (
            <>
              <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 relative">
                <MapContainer center={[tempCoords.lat, tempCoords.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickHandler onMapClick={(lat, lng) => {
                    setTempCoords({ lat, lng });
                    setFinalCoords(null); // Reset verification if user moves pin
                  }} />
                  <Marker
                    position={[tempCoords.lat, tempCoords.lng]}
                    draggable={true}
                    icon={customIcon}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        setTempCoords({ lat: position.lat, lng: position.lng });
                        setFinalCoords(null); // Reset verification if user moves pin
                      },
                    }}
                  />
                </MapContainer>
                <div className="absolute bottom-2 left-2 z-[1000] bg-white px-2 py-1 rounded text-[10px] shadow-md">
                  Geser pin atau klik pada peta untuk menentukan lokasi
                </div>
              </div>
              <button
                onClick={handleSaveLocation}
                className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-medium text-sm transition-colors ${finalCoords
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {finalCoords ? (
                  <>
                    <CheckCircle size={16} /> Titik Lokasi Tersimpan
                  </>
                ) : (
                  "Simpan Titik Lokasi"
                )}
              </button>
            </>
          )}

          <InputBox
            label="Catatan untuk Kurir (Opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="misalnya Warna rumah, landmark, instruksi khusus"
            icon={<ClipboardList size={18} className="sm:w-5 sm:h-5 text-gray-400" />}
          />

          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <Checkbox
              label="Jadikan alamat utama"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
            />
            <Checkbox
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            >
              <span className="text-xs sm:text-sm">
                Saya menyetujui{" "}
                <a href="#" className="text-green-600 font-semibold hover:underline">
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a href="#" className="text-green-600 font-semibold hover:underline">
                  Kebijakan Privasi
                </a>{" "}
                untuk manajemen alamat di Panganku Fresh
              </span>
            </Checkbox>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 sm:mt-6 border-t border-gray-100 pt-4">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base disabled:bg-gray-400 transition-colors"
            onClick={handleSave}
            disabled={!agree}
          >
            Simpan
          </button>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}

export default AddAddress