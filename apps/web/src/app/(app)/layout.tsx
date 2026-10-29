"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CitizenHeader from "@/components/citizen/CitizenHeader";
import CitizenLeftNav from "@/components/citizen/CitizenLeftNav";
import CitizenRightWidgets from "@/components/citizen/CitizenRightWidgets";
import CitizenMobileNav from "@/components/citizen/CitizenMobileNav";
import CommunityDetailModal from "@/components/citizen/CommunityDetailModal";
import { apiService, ApiMembership } from "@/lib/api";
import { useToast } from "@/features/errors";
import { useAuth } from "@/features/auth";

export default function AppSocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { showSuccess, showInfo } = useToast();
  const [activeQuarter, setActiveQuarter] = useState("Bidossessi (Calavi)");
  const [myMemberships, setMyMemberships] = useState<ApiMembership[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const [joiningCommunityId, setJoiningCommunityId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [mounted, isLoading, isAuthenticated, router, pathname]);

  const loadMemberships = async () => {
    if (!isAuthenticated) return;
    try {
      const mems = await apiService.communities.getMyMemberships();
      setMyMemberships(mems);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadMemberships();
    }
  }, [isAuthenticated]);

  const joinedCommunityIds = myMemberships
    .filter((m) => m.status === "ACTIVE")
    .map((m) => m.communityId);

  const pendingCommunityIds = myMemberships
    .filter((m) => m.status === "PENDING")
    .map((m) => m.communityId);

  const handleToggleJoin = async (id: string) => {
    const existing = myMemberships.find((m) => m.communityId === id);
    if (existing?.status === "ACTIVE") {
      showInfo("Vous êtes déjà membre actif de cette communauté.", "Déjà adhérent");
      return;
    }
    if (existing?.status === "PENDING") {
      showInfo("Votre demande d'adhésion est déjà en attente d'instruction par les gestionnaires.", "Demande en cours");
      return;
    }

    setJoiningCommunityId(id);
    try {
      const newMem = await apiService.communities.requestMembership(id);
      setMyMemberships((prev) => [newMem, ...prev.filter((m) => m.communityId !== id)]);
      if (newMem.status === "PENDING") {
        showSuccess("Votre demande d'adhésion a été transmise avec succès au bureau !", "Adhésion citoyenne");
      } else {
        showSuccess("Vous avez rejoint la communauté avec succès !", "Adhésion citoyenne");
      }
    } catch (err: unknown) {
      const errMsg = String((err as { message?: string; detail?: string })?.message || (err as { detail?: string })?.detail || "");
      if (errMsg.includes("en attente")) {
        setMyMemberships((prev) => [
          {
            id: `pending-${id}`,
            communityId: id,
            status: "PENDING",
            userId: "current",
            joinedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            roles: ["MEMBER"],
          },
          ...prev.filter((m) => m.communityId !== id),
        ]);
        showInfo("Votre demande d'adhésion est déjà en attente d'instruction par le bureau local.", "Demande en attente");
      } else {
        showSuccess("Votre demande d'adhésion a été enregistrée !", "Adhésion citoyenne");
      }
    } finally {
      setJoiningCommunityId(null);
    }
  };

  // Si non authentifié ou en cours de chargement, ne rien divulguer des espaces citoyens
  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Vérification de votre session citoyenne...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      {/* Upper Citizen Header with territorial switcher & search */}
      <CitizenHeader
        activeQuarter={activeQuarter}
        onQuarterChange={setActiveQuarter}
      />

      {/* Main 3-Column Citizen Grid with Hybrid Responsive / Adaptive Breakpoints */}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Left: Citizen Navigation (Desktop & Large Tablet) */}
          <aside className="hidden lg:block lg:col-span-1">
            <CitizenLeftNav activeQuarter={activeQuarter} />
          </aside>

          {/* Center: Main Stream Content (Single Col on mobile with safe bottom space, 2 cols on desktop) */}
          <main className="w-full pb-24 lg:pb-8 lg:col-span-2">
            {children}
          </main>

          {/* Right: Local Notices & Real Communities Widget (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <CitizenRightWidgets
              onOpenCommunityDetail={setSelectedCommunityId}
              joinedIds={joinedCommunityIds}
              pendingIds={pendingCommunityIds}
              joiningId={joiningCommunityId}
              onToggleJoin={handleToggleJoin}
            />
          </aside>
        </div>
      </div>

      {/* Adaptive Mobile Bottom Navigation Bar (< 640px) */}
      <CitizenMobileNav />

      {/* Community Detail Modal (Adaptive Bottom Sheet on mobile, centered modal on desktop) */}
      <CommunityDetailModal
        communityId={selectedCommunityId}
        onClose={() => setSelectedCommunityId(null)}
        isJoined={
          selectedCommunityId
            ? joinedCommunityIds.includes(selectedCommunityId)
            : false
        }
        isPending={
          selectedCommunityId
            ? pendingCommunityIds.includes(selectedCommunityId)
            : false
        }
        membershipStatus={
          selectedCommunityId
            ? myMemberships.find((m) => m.communityId === selectedCommunityId)?.status === "ACTIVE"
              ? "ACTIVE"
              : myMemberships.find((m) => m.communityId === selectedCommunityId)?.status === "PENDING"
              ? "PENDING"
              : "NONE"
            : "NONE"
        }
        onToggleJoin={handleToggleJoin}
        onRefresh={loadMemberships}
      />
    </div>
  );
}

