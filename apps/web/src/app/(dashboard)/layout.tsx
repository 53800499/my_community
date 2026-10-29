"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { AssociationProvider } from "@/context/AssociationContext";
import AppSidebar from "@/components/layout/AppSidebar";
import Backdrop from "@/components/layout/Backdrop";
import AppHeader from "@/components/layout/AppHeader";
import { useAuth } from "@/features/auth";

const DashboardLayoutContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isExpanded } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isLoading, isAuthenticated, router, pathname]);

  // Si non authentifié ou en cours de chargement, ne rien divulguer du dashboard
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Vérification des habilitations d&apos;accès...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AssociationProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </AssociationProvider>
    </SidebarProvider>
  );
}
