"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCheck({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/signin");
    }

    if (!isLoading && user && role && user.role !== role) {
      router.push("/unauthorized");
    }
  }, [user, isLoading, role, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="animate-pulse">Loading ...</p>
      </div>
    );
  }

  if (user && (!role || user.role === role)) {
    return <>{children}</>;
  }

  return null;
}