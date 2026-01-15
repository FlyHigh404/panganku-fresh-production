"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type CartContextType = {
    cartCount: number;
    setCartCount: (count: number) => void;
    incrementCart: () => void;
    decrementCart: (quantity?: number) => void;
    fetchCartCount: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartCount, setCartCount] = useState<number>(0);

    const fetchCartCount = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/cart`, {
                cache: "no-store", headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) {
                setCartCount(0);
                return;
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const totalQty = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                setCartCount(totalQty);
            } else if (Array.isArray(data.orderItems)) {
                const totalQty = data.orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                setCartCount(totalQty);
            } else {
                setCartCount(0);
            }
        } catch (error) {
            console.error("Error fetching cart count:", error);
            setCartCount(0);
        }
    };

    const incrementCart = () => {
        setCartCount((prev) => prev + 1);
    };

    const decrementCart = (quantity: number = 1) => {
        setCartCount((prev) => Math.max(0, prev - quantity));
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, setCartCount, incrementCart, decrementCart, fetchCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};