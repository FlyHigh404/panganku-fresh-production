"use client"

import { useAuth } from "@/context/AuthContext";
// import { useSession } from "next-auth/react"
import useReplySocket from "@/hooks/useReplySocket"
import { useToast, Toast } from "@/components/Toast"

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
    // const { data: session } = useSession()
    const { user } = useAuth();
    const userId = user?.id as string
    const { toast, showToast, hideToast } = useToast()

    const handleNotification = (message: string) => {
        showToast(message, 'success') 
    }

    useReplySocket(userId, handleNotification)

    return (
        <>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={5000} // durasi lebih lama untuk notifikasi
            />
        </>
    )
}