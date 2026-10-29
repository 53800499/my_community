import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] text-gray-900 antialiased transition-colors dark:bg-[#0B0F19] dark:text-gray-100">
      {children}
    </div>
  );
}
