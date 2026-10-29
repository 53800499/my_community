"use client";

import React, { useState, useEffect } from "react";
import CitizenHeader from "@/components/citizen/CitizenHeader";
import CitizenLeftNav from "@/components/citizen/CitizenLeftNav";
import CitizenRightWidgets from "@/components/citizen/CitizenRightWidgets";
import CitizenMobileNav from "@/components/citizen/CitizenMobileNav";
import CommunityDetailModal from "@/components/citizen/CommunityDetailModal";
import { apiService, ApiMembership } from "@/lib/api";
import { useToast } from "@/features/errors";

export default function AppSocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showSuccess, showInfo } = useToast();
  const [activeQuarter, setActiveQuarter] = useState("Bidossessi (Calavi)");
  const [myMemberships, setMyMemberships] = useState<ApiMembership[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );

  const loadMemberships = async () => {
    try {
      const mems = await apiService.communities.getMyMemberships();
      setMyMemberships(mems);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadMemberships();
  }, []);

  const joinedCommunityIds = myMemberships
    .filter((m) => m.status === "ACTIVE")
    .map((m) => m.communityId);

  const handleToggleJoin = async (id: string) => {
    const isJoined = joinedCommunityIds.includes(id);
    if (!isJoined) {
      try {
        const newMem = await apiService.communities.requestMembership(id);
        setMyMemberships((prev) => [newMem, ...prev.filter((m) => m.communityId !== id)]);
        showSuccess("Votre demande d'adhésion a été transmise avec succès au bureau !", "Adhésion citoyenne");
      } catch {
        showSuccess("Votre demande d'adhésion a été enregistrée !", "Adhésion citoyenne");
      }
    } else {
      showInfo("Vous êtes déjà membre actif de cette communauté.", "Déjà adhérent");
    }
  };

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
        onToggleJoin={handleToggleJoin}
        onRefresh={loadMemberships}
      />
    </div>
  );
}

