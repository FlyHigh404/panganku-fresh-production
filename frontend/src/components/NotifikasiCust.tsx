"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';

interface NotificationItemData {
    id: string;
    message: string;
    createdAt: Date;
    userId: string;
}

interface NotifItemProps extends NotificationItemData {
    index: number;
}

const formatDateTime = (date: Date) => {
    const dateObj = new Date(date);
    const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const dateString = dateObj.toLocaleDateString('id-ID', optionsDate).replace(/\//g, '-');
    const timeString = dateObj.toLocaleTimeString('id-ID', optionsTime);

    return { dateString, timeString };
};

const NotifikasiItem: React.FC<NotifItemProps> = ({
    id, message, createdAt, index
}) => {
    const { dateString, timeString } = formatDateTime(createdAt);
    const isGreenBackground = index % 2 !== 0;
    const rowClass = isGreenBackground ? 'bg-white' : 'bg-green-50';

    const extractOrderInfo = (msg: string) => {
        const orderNumberMatch = msg.match(/#(\w+-\d+)/);
        const productMatch = msg.match(/produk\s+(.+?)(?=\s|$)/i);

        return {
            orderNumber: orderNumberMatch ? orderNumberMatch[1] : 'N/A',
            productName: productMatch ? productMatch[1] : 'Produk',
            status: msg.split('.')[0] || 'Notifikasi'
        };
    };

    const { orderNumber, productName, status } = extractOrderInfo(message);

    return (
        <div className={`flex p-2.5 border-b border-gray-200 ${rowClass}`}>
            <div className="w-8 h-8 mr-3 flex-shrink-0 mt-0.5 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="text-xs text-gray-600 font-semibold">
                    {orderNumber.slice(0, 3)}
                </div>
            </div>
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <p className="font-semibold text-sm text-gray-800 truncate pr-2">
                        {status}
                    </p>
                    <span className="text-[10px] text-gray-500 flex-shrink-0 mt-0.5">
                        {dateString} | {timeString}
                    </span>
                </div>
                <p className="text-xs text-gray-600 leading-snug">
                    {message}
                </p>
            </div>
        </div>
    );
};

const DROPDOWN_MAX_HEIGHT_CLASS = 'max-h-[320px]';

interface NotifikasiCustProps {
    notificationCount?: number;
    isMobile?: boolean;
    onClose?: () => void;
}

const NotifikasiCust: React.FC<NotifikasiCustProps> = ({
    notificationCount: externalCount,
    isMobile = false,
    onClose
}) => {
    const [isClickedOpen, setIsClickedOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    const isDropdownVisible = isClickedOpen || isHovered;
    const actualNotificationCount = notifications.length;

    // Fetch notifications dari API
    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/notifications`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Gagal memuat notifikasi');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch notifications ketika dropdown dibuka
    useEffect(() => {
        if (isDropdownVisible) {
            fetchNotifications();
        }
    }, [isDropdownVisible, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (componentRef.current && !componentRef.current.contains(event.target as Node) && isClickedOpen) {
                setIsClickedOpen(false);
                setIsHovered(false);
            }
        };
        if (isClickedOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isClickedOpen]);

    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsClickedOpen(prev => !prev);
        setIsHovered(false);
    };

    const handleMarkAllRead = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/notifications`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setNotifications([]);
                console.log('Semua notifikasi ditandai sudah dibaca.');
            } else {
                console.error('Gagal menandai notifikasi sebagai sudah dibaca');
            }
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        } finally {
            setIsClickedOpen(false);
            setIsHovered(false);
        }
    }, []);

    const getBadgeContent = () => {
        if (actualNotificationCount === 0) return 0;
        if (actualNotificationCount > 9) return '9+';
        return actualNotificationCount;
    };

    const badgeContent = getBadgeContent();

    // Mobile Version
    if (isMobile) {
        return (
            <div className="w-full" ref={componentRef}>
                {/* Mobile Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsClickedOpen(prev => !prev);
                        fetchNotifications();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span>Notifikasi</span>
                    {actualNotificationCount > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {badgeContent}
                        </span>
                    )}
                </button>

                {/* Mobile Dropdown - Full Width */}
                {isClickedOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                            onClick={() => {
                                setIsClickedOpen(false);
                                onClose?.();
                            }}
                        />

                        {/* Modal Panel */}
                        <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[70] max-h-[80vh] flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h3 className="text-lg font-bold text-gray-800">Notifikasi</h3>
                                <button
                                    onClick={() => {
                                        setIsClickedOpen(false);
                                        onClose?.();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Loading State */}
                                {loading && (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                        <p className="text-sm text-gray-500 mt-2">Memuat notifikasi...</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !loading && (
                                    <div className="p-4 text-center">
                                        <p className="text-red-500 text-sm mb-2">{error}</p>
                                        <button
                                            onClick={fetchNotifications}
                                            className="text-green-600 text-sm font-semibold hover:text-green-700"
                                        >
                                            Coba Lagi
                                        </button>
                                    </div>
                                )}

                                {/* Notifikasi Kosong */}
                                {!loading && !error && notifications.length === 0 && (
                                    <div className="p-8 text-center">
                                        <img
                                            src="/bgnotif.png"
                                            alt="Tidak ada notifikasi"
                                            className="mx-auto w-32 h-32 object-contain mb-3"
                                        />
                                        <h2 className="text-md font-semibold text-gray-800 mb-1">
                                            Tidak ada notifikasi
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Tidak ada notifikasi masuk
                                        </p>
                                    </div>
                                )}

                                {/* List Notifikasi */}
                                {!loading && !error && notifications.length > 0 && (
                                    <div className="divide-y divide-gray-200">
                                        {notifications.map((notif, index) => (
                                            <NotifikasiItem
                                                key={notif.id}
                                                {...notif}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer - Mark All Read */}
                            {!loading && !error && notifications.length > 0 && (
                                <div className="p-3 flex justify-center border-t border-gray-200 bg-white cursor-pointer">
                                    <button
                                        onClick={() => {
                                            handleMarkAllRead();
                                            onClose?.();
                                        }}
                                        className="text-sm font-semibold text-green-600 hover:text-green-700"
                                    >
                                        Tandai semua sudah dibaca
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Desktop Version (Original)
    return (
        <div
            className="relative"
            ref={componentRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                if (!isClickedOpen) {
                    setIsHovered(false);
                }
            }}
        >
            {/* Tombol Ikon Notifikasi (Bell) */}
            <button
                onClick={handleIconClick}
                className={`relative p-2 rounded-lg transition ${isClickedOpen || isHovered ? 'bg-green-100' : 'hover:bg-green-100'
                    }`}
                aria-expanded={isDropdownVisible}
                aria-haspopup="true"
                aria-controls="notification-dropdown"
            >
                <Bell
                    className={`w-5 h-5 text-[#4BBF42] cursor-pointer transition-transform duration-200 ease-out 
                    ${isHovered ? 'scale-110' : 'scale-100'}`}
                />

                {/* Badge jumlah notifikasi */}
                {(actualNotificationCount > 0) && (
                    <span
                        className={`absolute -top-1 -right-1 w-5 h-5 
                        bg-orange-500 
                        text-white text-xs rounded-full flex items-center justify-center font-bold`}
                    >
                        {badgeContent}
                    </span>
                )}
            </button>

            {/* Dropdown Notifikasi */}
            {isDropdownVisible && (
                <div
                    id="notification-dropdown"
                    className={`absolute right-0 mt-3 w-[280px] sm:w-[360px] md:w-[420px] ${DROPDOWN_MAX_HEIGHT_CLASS} overflow-y-auto bg-white rounded-lg shadow-2xl z-50 border border-gray-200`}
                    style={{ zIndex: 60 }}
                >
                    <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shadow-md">
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Notifikasi</h3>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Memuat notifikasi...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="p-4 text-center">
                            <p className="text-red-500 text-sm mb-2">{error}</p>
                            <button
                                onClick={fetchNotifications}
                                className="text-green-600 text-sm font-semibold hover:text-green-700"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    {/* Notifikasi Kosong */}
                    {!loading && !error && notifications.length === 0 && (
                        <div className="p-4 text-center">
                            <img
                                src="/bgnotif.png"
                                alt="Tidak ada notifikasi"
                                className="mx-auto w-35 h-35 object-contain mb-2"
                            />
                            <h2 className="text-md font-semibold text-gray-800 mb-1">
                                Tidak ada notifikasi
                            </h2>
                            <p className="text-sm text-gray-500">
                                Tidak ada notifikasi masuk
                            </p>
                        </div>
                    )}

                    {/* List Notifikasi */}
                    {!loading && !error && notifications.length > 0 && (
                        <>
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notif, index) => (
                                    <NotifikasiItem
                                        key={notif.id}
                                        {...notif}
                                        index={index}
                                    />
                                ))}
                            </div>

                            <div className="p-3 flex justify-center border-t border-gray-200 sticky bottom-0 bg-white z-10 cursor-pointer">
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={notifications.length === 0}
                                    className={`text-sm font-semibold transition ${notifications.length === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-green-600 hover:text-green-700'
                                        }`}
                                >
                                    Tandai semua sudah dibaca
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotifikasiCust;