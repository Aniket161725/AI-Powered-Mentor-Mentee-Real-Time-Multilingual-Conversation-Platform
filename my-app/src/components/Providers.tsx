// components/Providers.tsx
"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthProvider"; // adjust path
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
