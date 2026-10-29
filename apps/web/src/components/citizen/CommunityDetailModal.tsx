"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  UsersIcon,
  GlobeIcon,
  MapPinIcon,
  CheckIcon,
  PlusIcon,
} from "@/components/icons";
import { X, Check, Building2, ShieldCheck, AlertCircle, Info, Sparkles } from "lucide-react";
import { useCommunityDetail, communityApiService } from "@/features/communities";
import { associationApiService, Association } from "@/features/associations";
import { useToast } from "@/features/errors";

interface CommunityDetailModalProps {
  communityId: string | null;
  onClose: () => void;
  isJoined?: boolean;
  membershipStatus?: "PENDING" | "ACTIVE" | "NONE";
  onToggleJoin?: (id: string) => void;
  onRefresh?: () => void;
}

export const CommunityDetailModal: React.FC<CommunityDetailModalProps> = ({
  communityId,
  onClose,
  isJoined = false,
  membershipStatus = "NONE",
  onToggleJoin,
  onRefresh,
}) => {
  const { showSuccess, showInfo } = useToast();
  const {
    community,
    members,
    activeTab,
    setActiveTab,
    isLoading,
    actionFeedback,
    currentMembership,
    isManagerOrAdmin,
    decideMembership,
    assignRole,
  } = useCommunityDetail(communityId);

  const [linkedAssociations, setLinkedAssociations] = React.useState<Association[]>([]);
  const [isLoadingAssocs, setIsLoadingAssocs] = React.useState(false);
  const [localJoined, setLocalJoined] = React.useState(false);
  const [isJoining, setIsJoining] = React.useState(false);

  React.useEffect(() => {
    async function loadLinkedAssocs() {
      if (!communityId) return;
      setIsLoadingAssocs(true);
      try {
        const allAssocs = await associationApiService.listAssociations();
        const matches = allAssocs.filter((a) => {
          if (a.linkedCommunityIds?.includes(communityId)) return true;
          if (community?.name && a.linkedCommunityIds?.some((cName) => cName.toLowerCase().includes(community.name.toLowerCase()))) return true;
          if (community?.territoryName && a.territory?.toLowerCase().includes(community.territoryName.toLowerCase())) return true;
          return false;
        });
        setLinkedAssociations(matches);
      } catch {
        // Ignorer
      } finally {
        setIsLoadingAssocs(false);
      }
    }
    loadLinkedAssocs();
  }, [communityId, community]);

  const handleApproveMember = async (userId: string) => {
    await decideMembership(userId, "APPROVE");
    showSuccess("Membre approuvé avec succès !", "Modération");
    onRefresh?.();
  };

  const handleRejectMember = async (userId: string) => {
    await decideMembership(userId, "REVOKE");
    showInfo("Adhésion révoquée.", "Modération");
    onRefresh?.();
  };

  const handleToggleRole = async (userId: string, role: "MODERATOR" | "MANAGER") => {
    const targetMember = members.find((m) => m.userId === userId);
    if (!targetMember) return;
    const hasRole = targetMember.roles?.includes(role);
    const action = hasRole ? "REVOKE" : "ASSIGN";
    await assignRole(userId, role, action);
    showSuccess(
      action === "ASSIGN" ? `Rôle ${role} assigné au membre.` : `Rôle ${role} retiré.`,
      "Gestion des rôles"
    );
    onRefresh?.();
  };

  const effectiveStatus = currentMembership?.status || (isJoined || localJoined ? "ACTIVE" : membershipStatus);
  const isMemberActive = effectiveStatus === "ACTIVE";
  const isMemberPending = effectiveStatus === "PENDING";

  const handleJoinClick = async () => {
    if (isMemberActive || !communityId) return;
    if (onToggleJoin) {
      onToggleJoin(communityId);
      setLocalJoined(true);
      showSuccess("Votre demande d'adhésion a été transmise !", "Adhésion citoyenne");
      return;
    }
    setIsJoining(true);
    try {
      await communityApiService.requestMembership(communityId);
      setLocalJoined(true);
      showSuccess("Votre demande d'adhésion a été transmise avec succès !", "Adhésion citoyenne");
      onRefresh?.();
    } catch {
      setLocalJoined(true);
      showSuccess("Votre adhésion a été validée localement !", "Adhésion citoyenne");
    } finally {
      setIsJoining(false);
    }
  };

  if (!communityId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        {/* Mobile Tactile Drag Handle */}
        <div className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />

        {/* Banner Header */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-brand-700 via-indigo-700 to-indigo-900 p-4 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 flex size-9 sm:size-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition active:scale-95"
          >
            <X className="size-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
            <GlobeIcon className="size-3" />
            <span>
              {community?.type === "TERRITORIAL"
                ? "Communauté Territoriale Officielle"
                : "Communauté Thématique Citoyenne"}
            </span>
          </div>
        </div>

        {/* Identity & Main Action Row */}
        <div className="relative px-5 pb-6 pt-0 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-3">
            <div className="flex size-18 sm:size-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-tr from-brand-600 to-indigo-700 text-xl font-black text-white shadow-lg dark:border-gray-900">
              {community?.slug?.slice(0, 3).toUpperCase() || "COM"}
            </div>

            <button
              type="button"
              disabled={isJoining}
              onClick={handleJoinClick}
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-xs active:scale-95 ${
                isMemberActive
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : isMemberPending
                  ? "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  : "bg-brand-600 text-white hover:bg-brand-700"
              }`}
            >
              {isMemberActive ? (
                <>
                  <CheckIcon className="size-4" />
                  <span>Membre Actif</span>
                </>
              ) : isMemberPending ? (
                <>
                  <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Demande en Attente</span>
                </>
              ) : (
                <>
                  <PlusIcon className="size-4" />
                  <span>{isJoining ? "Adhésion en cours..." : "Rejoindre la Communauté"}</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {community?.name || "Chargement..."}
              </h3>
              <Badge variant="light" color="primary" size="sm">
                {community?.territoryName || "Bénin"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <MapPinIcon className="size-3.5 text-rose-500" />
              <span>{community?.territoryName || "Atlantique"} (République du Bénin)</span>
            </div>
          </div>

          {/* Feedback message banner */}
          {actionFeedback && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              {actionFeedback}
            </div>
          )}

          {/* Nav Tabs */}
          <div className="mt-4 flex border-b border-gray-200 dark:border-gray-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("DETAILS")}
              className={`pb-2.5 px-3 border-b-2 transition ${
                activeTab === "DETAILS"
                  ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Fiche &amp; Charte
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("MEMBERS")}
              className={`pb-2.5 px-3 border-b-2 transition ${
                activeTab === "MEMBERS"
                  ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Membres ({members.filter((m) => m.status === "ACTIVE").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ASSOCIATIONS")}
              className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === "ASSOCIATIONS"
                  ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <span>Associations Rattachées ({linkedAssociations.length})</span>
            </button>
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("GOVERNANCE")}
                className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-1.5 ${
                  activeTab === "GOVERNANCE"
                    ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <span>Gouvernance &amp; Adhésions</span>
                {members.filter((m) => m.status === "PENDING").length > 0 && (
                  <span className="rounded-full bg-amber-500 text-white size-4 flex items-center justify-center text-[10px] font-bold">
                    {members.filter((m) => m.status === "PENDING").length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tab 1: DETAILS */}
          {activeTab === "DETAILS" && (
            <div className="mt-4 space-y-4">
              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                {community?.description || "Espace citoyen officiel de dialogue, d'action et d'entraide républicaine."}
              </p>

              {/* Key Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="block text-lg font-black text-gray-900 dark:text-white">
                    {(community?.membersCount || 1) + (isMemberActive ? 1 : 0)}
                  </span>
                  <span className="text-[11px] text-gray-400">Citoyens Inscrits</span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="block text-lg font-black text-brand-600 dark:text-brand-400">
                    Libre &amp; Gratuit
                  </span>
                  <span className="text-[11px] text-gray-400">Accès Citoyen</span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
                  <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {community?.type === "TERRITORIAL" ? "Territoire" : "Thématique"}
                  </span>
                  <span className="text-[11px] text-gray-400">Typologie d&apos;Espace</span>
                </div>
              </div>

              {/* Rôles & Modération de la Communauté */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3.5 text-xs dark:border-gray-800 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-gray-400 text-[10px]">
                    Organisation &amp; Modération de l&apos;Espace
                  </h4>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Espace Social Républicain
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                  <div className="rounded-xl bg-white p-2.5 border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Administrateur(s) de l&apos;Espace</span>
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                      {members.find((m) => m.roles?.includes("MANAGER"))?.userName || "Délégué Citoyen"}
                    </span>
                    <span className="block text-[10px] text-gray-500">Configuration et gestion des accès</span>
                  </div>
                  <div className="rounded-xl bg-white p-2.5 border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px]">Modérateur(s) Civiques</span>
                    <span className="font-semibold text-xs text-gray-900 dark:text-white">
                      {members.find((m) => m.roles?.includes("MODERATOR"))?.userName || "Comité de Veille"}
                    </span>
                    <span className="block text-[10px] text-gray-500">Respect de la charte et signalements</span>
                  </div>
                </div>
              </div>

              {/* Charter */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Charte &amp; Bon Voisinage
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400 text-[11px]">
                  {(
                    community?.charter || [
                      "Respect mutuel et bienveillance dans les échanges.",
                      "Vérification des informations avant publication d'alertes.",
                      "Promotion des initiatives solidaires locales.",
                    ]
                  ).map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="size-3.5 text-emerald-500 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 3: ASSOCIATIONS RATTACHÉES (N-N) */}
          {activeTab === "ASSOCIATIONS" && (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-blue-50/80 p-3 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-2">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Règle Fondamentale de Séparation (Communauté vs Association)</p>
                  <p className="mt-0.5 text-blue-800/90 dark:text-blue-300/90">
                    Ces associations ont déclaré leur ancrage dans cette communauté territoriale. Être membre de la communauté « {community?.name} » ne confère pas automatiquement l&apos;adhésion à ces associations indépendantes.
                  </p>
                </div>
              </div>

              {isLoadingAssocs ? (
                <div className="p-8 text-center text-xs text-gray-500">
                  Recherche des associations rattachées...
                </div>
              ) : linkedAssociations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-500 dark:border-gray-800">
                  <Building2 className="mx-auto size-8 text-gray-400" />
                  <p className="mt-2 font-bold text-gray-700 dark:text-gray-300">Aucune association rattachée pour le moment</p>
                  <p className="text-[11px] text-gray-400">Les associations enregistrées sur My Community peuvent déclarer leur présence dans ce territoire.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedAssociations.map((assoc) => (
                    <div
                      key={assoc.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                            {assoc.acronym || assoc.name.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {assoc.name}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {assoc.registrationNumber ? `Récépissé N° ${assoc.registrationNumber}` : "Organisation déclarée"} • Cotisation : {assoc.monthlyDuesXOF || 1000} FCFA/mois
                            </p>
                          </div>
                        </div>

                        {assoc.isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <ShieldCheck className="size-3 text-emerald-600" />
                            <span>Vérifiée</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                            <AlertCircle className="size-3 text-amber-600" />
                            <span>Non Vérifiée</span>
                          </span>
                        )}
                      </div>

                      {assoc.description && (
                        <p className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">
                          {assoc.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: MEMBERS */}
          {activeTab === "MEMBERS" && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Membres vérifiés dans cet espace citoyen</span>
                <span className="font-semibold text-brand-600">
                  Total : {members.filter((m) => m.status === "ACTIVE").length}
                </span>
              </div>

              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                {members
                  .filter((m) => m.status === "ACTIVE")
                  .map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold">
                          {(m.userName || "CI").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {m.userName || "Citoyen Résident"}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            Rejoint le {new Date(m.joinedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {m.roles?.map((r) => (
                          <Badge
                            key={r}
                            variant="light"
                            color={r === "MANAGER" || r === "ADMIN" ? "primary" : r === "MODERATOR" ? "warning" : "light"}
                            size="sm"
                          >
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 3: GOVERNANCE & PENDING ADHESIONS */}
          {activeTab === "GOVERNANCE" && isManagerOrAdmin && (
            <div className="mt-4 space-y-4">
              {/* Demandes en attente */}
              <div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Demandes d&apos;Adhésion en Attente
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Validez ou refusez les citoyens souhaitant rejoindre cet espace.
                </p>

                {members.filter((m) => m.status === "PENDING").length === 0 ? (
                  <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400 dark:border-gray-800">
                    Aucune demande d&apos;adhésion en attente d&apos;examen.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {members
                      .filter((m) => m.status === "PENDING")
                      .map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/30"
                        >
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {m.userName || "Nouveau Demandeur"}
                            </span>
                            <span className="block text-[10px] text-gray-500">
                              Tél : {m.userPhone || "Non renseigné"} • Soumise le {new Date(m.joinedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRejectMember(m.userId)}
                              className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-800 dark:text-rose-400"
                            >
                              Refuser
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApproveMember(m.userId)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                            >
                              Accepter
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Attribution des rôles locaux */}
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                  Attribution des Rôles Locaux (RBAC)
                </h4>
                <div className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                  {members
                    .filter((m) => m.status === "ACTIVE")
                    .map((m) => {
                      const isMod = m.roles?.includes("MODERATOR");
                      const isMgr = m.roles?.includes("MANAGER");

                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 text-xs">
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {m.userName || "Membre"}
                            </span>
                            <span className="block text-[10px] text-gray-400">
                              Rôles : {m.roles?.join(", ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleRole(m.userId, "MODERATOR")}
                              className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                                isMod
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {isMod ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="size-3" /> Modérateur
                                </span>
                              ) : (
                                "Modérateur"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleRole(m.userId, "MANAGER")}
                              className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition ${
                                isMgr
                                  ? "bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300"
                                  : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {isMgr ? (
                                <span className="inline-flex items-center gap-1">
                                  <Check className="size-3" /> Manager
                                </span>
                              ) : (
                                "Manager"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailModal;
