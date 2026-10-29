"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  UsersIcon,
  SearchIcon,
  PlusIcon,
  CheckIcon,
  GlobeIcon,
  ShieldCheckIcon,
  ShieldAlertIcon,
} from "@/components/icons";
import { Check, X, Clock, Building2, MessageSquare, Info, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useToast } from "@/features/errors";
import { useRouter } from "next/navigation";
import {
  apiService,
  ApiCommunity,
  ApiCommunityProposal,
  ApiMembership,
} from "@/lib/api";
import { associationApiService } from "@/features/associations/services/association-api.service";
import { Association } from "@/features/associations/domain/association.types";
import CommunityDetailModal from "@/components/citizen/CommunityDetailModal";
import ProposeCommunityModal from "@/components/citizen/ProposeCommunityModal";

export default function CommunitiesPage() {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "EXPLORE" | "MY_COMMUNITIES" | "MY_PROPOSALS" | "ADMIN_REVIEW"
  >("EXPLORE");

  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [showGuidance, setShowGuidance] = useState(false);
  const [myProposals, setMyProposals] = useState<ApiCommunityProposal[]>([]);
  const [adminProposals, setAdminProposals] = useState<ApiCommunityProposal[]>([]);
  const [myMemberships, setMyMemberships] = useState<ApiMembership[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [filter, setFilter] = useState<"ALL" | "TERRITORIAL" | "THEMATIC">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);

  // Rejection modal state for admin review
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    try {
      const [comms, assocs] = await Promise.all([
        apiService.communities.list(),
        associationApiService.listAssociations().catch(() => []),
      ]);
      setCommunities(comms);
      setAssociations(assocs);

      if (isAuthenticated) {
        const [props, adminProps, mems] = await Promise.all([
          apiService.communities.getMyProposals().catch(() => []),
          apiService.communities.getAdminProposals().catch(() => []),
          apiService.communities.getMyMemberships().catch(() => []),
        ]);
        setMyProposals(props);
        setAdminProposals(adminProps);
        setMyMemberships(mems);
      } else {
        setMyProposals([]);
        setAdminProposals([]);
        setMyMemberships([]);
      }
    } catch {
      // Ignore network errors on public browse
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/communities")}`);
      return;
    }
    callback();
  };

  const handleToggleJoin = async (id: string) => {
    requireAuth(async () => {
      const existing = myMemberships.find((m) => m.communityId === id);
      if (existing?.status === "ACTIVE") {
        showInfo("Vous êtes déjà membre actif de cet espace citoyen.");
        return;
      }
      if (existing?.status === "PENDING") {
        showInfo("Votre demande d'adhésion est en cours d'instruction par les gestionnaires.");
        return;
      }

      setJoiningId(id);
      try {
        const newMem = await apiService.communities.requestMembership(id);
        setMyMemberships((prev) => [newMem, ...prev.filter((m) => m.communityId !== id)]);
        if (newMem.status === "PENDING") {
          showSuccess("Demande d'adhésion soumise ! Elle sera examinée par le bureau local.");
        } else {
          showSuccess("Vous avez rejoint la communauté !");
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
          showInfo("Votre demande d'adhésion est déjà en cours d'instruction par les gestionnaires.");
        } else {
          showError(err, "Demande d'adhésion impossible");
        }
      } finally {
        setJoiningId(null);
      }
    });
  };

  const handleApproveProposal = async (proposalId: string) => {
    requireAuth(async () => {
      try {
        await apiService.communities.reviewProposal(proposalId, {
          decision: "APPROVED",
        });
        showSuccess("Proposition approuvée ! L'espace communautaire a été créé et activé.");
        await loadData();
      } catch (err) {
        showError(err, "Échec de l'approbation");
      }
    });
  };

  const handleConfirmReject = async () => {
    if (!rejectingProposalId || !rejectionReason.trim()) return;

    requireAuth(async () => {
      try {
        await apiService.communities.reviewProposal(rejectingProposalId, {
          decision: "REJECTED",
          rejectionReason: rejectionReason.trim(),
        });
        showSuccess("Proposition rejetée avec motif explicatif notifié au citoyen.");
        setRejectingProposalId(null);
        setRejectionReason("");
        await loadData();
      } catch (err) {
        showError(err, "Échec du rejet");
      }
    });
  };

  const handleProposalCreated = (newProposal: ApiCommunityProposal) => {
    setMyProposals((prev) => [newProposal, ...prev]);
    setAdminProposals((prev) => [newProposal, ...prev]);
    showSuccess("Votre proposition citoyenne a été transmise avec succès !");
    setActiveTab("MY_PROPOSALS");
  };

  const filteredCommunities = communities.filter((com) => {
    const matchesType = filter === "ALL" || com.type === filter;
    const matchesSearch =
      com.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      com.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      com.territoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    return matchesType && matchesSearch;
  });

  const joinedCommunityIds = myMemberships
    .filter((m) => m.status === "ACTIVE")
    .map((m) => m.communityId);

  const pendingCommunityIds = myMemberships
    .filter((m) => m.status === "PENDING")
    .map((m) => m.communityId);

  const handleTabClick = (tab: "EXPLORE" | "MY_COMMUNITIES" | "MY_PROPOSALS" | "ADMIN_REVIEW") => {
    if (tab !== "EXPLORE" && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/communities")}`);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">

      {/* Header with Title & Propose Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Espaces &amp; Communautés Citoyennes
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Espaces Citoyens
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Découvrez vos quartiers, rejoignez des collectifs ou proposez une nouvelle communauté souveraine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              router.push(`/login?redirect=${encodeURIComponent("/communities")}`);
              return;
            }
            setIsProposeModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 hover:shadow-md"
        >
          <PlusIcon className="size-4" />
          <span>Proposer un Espace Citoyen</span>
        </button>
      </div>

      {/* Pedagogical Governance Banner: Community vs Association */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-brand-50/40 p-4 text-xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Info className="size-4" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                  Repère Citoyen : Espace Communautaire vs Association
                </h4>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Gouvernance Souveraine
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                Une <strong>Communauté</strong> est un espace social et territorial ouvert de rassemblement (quartier, campus ou thème). L&apos;adhésion y est libre, sans statuts imposés ni cotisations obligatoires. Les <strong>Associations rattachées</strong> sont des structures juridiques organisées (avec statuts, bureau élu et cotisations) qui animent ces communautés.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuidance((prev) => !prev)}
            className="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title={showGuidance ? "Masquer les détails" : "Afficher les détails"}
          >
            {showGuidance ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {showGuidance && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-indigo-100 pt-3 text-[11px] dark:border-indigo-900/40">
            <div className="rounded-xl bg-white/70 p-3 dark:bg-gray-800/60">
              <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
                Espace Communautaire (Social &amp; Territorial)
              </span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Rassemblement autour d&apos;un quartier ou d&apos;un intérêt commun</li>
                <li>Rôles techniques : Créateur (gestionnaire), Modérateur, Membre</li>
                <li>Pas de cotisations obligatoires ni de bureau statutaire exigé</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white/70 p-3 dark:bg-gray-800/60">
              <span className="font-bold text-brand-800 dark:text-brand-300 block mb-1">
                Association Rattachée (Structure Juridique)
              </span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Organisation déclarée avec statuts légaux et registre de membres</li>
                <li>Bureau Exécutif officiel élu (Président, Secrétaire, Trésorier)</li>
                <li>Cotisations mensuelles en XOF et budget géré</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-gray-200 pb-2 dark:border-gray-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => handleTabClick("EXPLORE")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
            activeTab === "EXPLORE"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <GlobeIcon className="size-4" />
          <span>Explorer les Espaces ({communities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("MY_COMMUNITIES")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
            activeTab === "MY_COMMUNITIES"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <UsersIcon className="size-4" />
          <span>Mes Espaces &amp; Adhésions ({myMemberships.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("MY_PROPOSALS")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
            activeTab === "MY_PROPOSALS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <ShieldAlertIcon className="size-4" />
          <span>Mes Propositions ({myProposals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("ADMIN_REVIEW")}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
            activeTab === "ADMIN_REVIEW"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <ShieldCheckIcon className="size-4" />
          <span>Instruction &amp; Gouvernance</span>
          {adminProposals.filter((p) => p.status === "PENDING").length > 0 && (
            <span className="rounded-full bg-amber-500 text-white size-4 flex items-center justify-center text-[10px] font-bold">
              {adminProposals.filter((p) => p.status === "PENDING").length}
            </span>
          )}
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* VUE 1 : EXPLORATION DES ESPACES */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "EXPLORE" && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "ALL"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Toutes ({communities.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("TERRITORIAL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "TERRITORIAL"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Territoriales
              </button>
              <button
                type="button"
                onClick={() => setFilter("THEMATIC")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  filter === "THEMATIC"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Thématiques
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <SearchIcon className="size-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, territoire..."
                className="h-9 w-64 rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredCommunities.map((com) => {
              const isJoined = joinedCommunityIds.includes(com.id);
              const isPending = pendingCommunityIds.includes(com.id);
              const linkedAssocs = associations.filter((a) => a.linkedCommunityIds?.includes(com.id));

              return (
                <div
                  key={com.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 font-bold">
                          <UsersIcon className="size-5" />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedCommunityId(com.id)}
                            className="text-left font-bold text-gray-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400 text-sm transition"
                          >
                            {com.name}
                          </button>
                          <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                            {com.territoryName ? `${com.territoryName} • ` : ""}
                            {com.type === "TERRITORIAL" ? "Territoriale" : "Thématique"}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="light"
                        color={com.type === "TERRITORIAL" ? "primary" : "info"}
                        size="sm"
                      >
                        {com.membersCount + (isJoined ? 1 : 0)} membres
                      </Badge>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                      {com.description || "Espace citoyen officiel de partage et d'entraide."}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        <Building2 className="size-3" />
                        {linkedAssocs.length} association{linkedAssocs.length > 1 ? "s" : ""} rattachée{linkedAssocs.length > 1 ? "s" : ""}
                      </span>
                      {isJoined && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="size-3" /> Membre du collectif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCommunityId(com.id)}
                        className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                      >
                        Fiche &amp; Règlements &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push(`/feed?communityId=${com.id}`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300 transition"
                        title="Voir le fil citoyen de cet espace"
                      >
                        <MessageSquare className="size-3.5" />
                        <span>Fil</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isJoined || isPending || joiningId === com.id}
                      onClick={() => handleToggleJoin(com.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                        isJoined
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-default"
                          : isPending
                          ? "border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400 cursor-default"
                          : joiningId === com.id
                          ? "border border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 opacity-75 cursor-wait"
                          : "bg-brand-600 text-white hover:bg-brand-700 shadow-2xs active:scale-95"
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <CheckIcon className="size-3.5" />
                          <span>Membre Actif</span>
                        </>
                      ) : isPending ? (
                        <>
                          <span className="flex size-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>En attente</span>
                        </>
                      ) : joiningId === com.id ? (
                        <>
                          <span className="size-3.5 animate-spin rounded-full border-2 border-brand-600 dark:border-brand-400 border-t-transparent" />
                          <span>Envoi...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="size-3.5" />
                          <span>Rejoindre</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 2 : MES ESPACES & ADHÉSIONS */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "MY_COMMUNITIES" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Espaces auxquels vous êtes affilié en tant que citoyen résident
            </span>
            <Badge variant="light" color="primary" size="sm">
              {myMemberships.length} Adhésions
            </Badge>
          </div>

          {myMemberships.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <UsersIcon className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Vous n&apos;avez pas encore rejoint d&apos;espace citoyen
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Explorez les communautés de votre commune ou quartier pour dialoguer avec vos voisins.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("EXPLORE")}
                className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                Explorer le Réseau
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {myMemberships.map((mem) => {
                const com = communities.find((c) => c.id === mem.communityId);
                const linkedAssocs = associations.filter((a) => a.linkedCommunityIds?.includes(mem.communityId));

                return (
                  <div
                    key={mem.id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {(mem.communityName || "C").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                              {mem.communityName || com?.name || "Espace Citoyen"}
                            </h3>
                            <span className="text-[11px] text-gray-400">
                              Adhésion le {new Date(mem.joinedAt).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="light"
                          color={mem.status === "ACTIVE" ? "success" : "warning"}
                          size="sm"
                        >
                          {mem.status === "ACTIVE" ? "Actif" : "En attente"}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          <Building2 className="size-3" />
                          {linkedAssocs.length} association{linkedAssocs.length > 1 ? "s" : ""} rattachée{linkedAssocs.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {mem.roles?.map((r) => (
                          <Badge key={r} variant="solid" color="primary" size="sm">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedCommunityId(mem.communityId)}
                          className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                        >
                          Consulter l&apos;Espace &rarr;
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/feed?communityId=${mem.communityId}`)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          <MessageSquare className="size-3.5" />
                          <span>Accéder au Fil</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-gray-400 font-mono">
                        ID: {mem.communityId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 3 : MES PROPOSITIONS D'ESPACES */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "MY_PROPOSALS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Historique des propositions citoyennes créées et soumises aux autorités
            </span>
            <button
              type="button"
              onClick={() => setIsProposeModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
            >
              <PlusIcon className="size-3.5" />
              <span>Nouvelle Proposition</span>
            </button>
          </div>

          {myProposals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <GlobeIcon className="mx-auto size-10 text-gray-300 dark:text-gray-600" />
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Aucune initiative de communauté en cours
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                Vous avez la possibilité de soumettre une nouvelle communauté pour votre village, quartier ou thématique citoyenne.
              </p>
              <button
                type="button"
                onClick={() => setIsProposeModalOpen(true)}
                className="mt-4 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                Lancer une Proposition
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {prop.name}
                        </h3>
                        <Badge
                          variant="light"
                          color={
                            prop.status === "APPROVED"
                              ? "success"
                              : prop.status === "REJECTED"
                              ? "error"
                              : "warning"
                          }
                          size="sm"
                        >
                          {prop.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="size-3" /> Approuvée &amp; Active
                            </span>
                          ) : prop.status === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1">
                              <X className="size-3" /> Rejetée
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" /> En instruction (PENDING)
                            </span>
                          )}
                        </Badge>
                      </div>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        Territoire : {prop.territoryName || "Bénin"} • Déposée le {new Date(prop.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-gray-400">
                      ID: {prop.id}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {prop.description}
                  </p>

                  <div className="mt-3 rounded-xl bg-gray-50/70 p-3 text-xs dark:bg-gray-800/40">
                    <span className="block font-bold text-[10px] uppercase text-gray-400 tracking-wider">
                      Justification d&apos;utilité publique fournie
                    </span>
                    <p className="mt-1 text-gray-700 dark:text-gray-300 text-xs">
                      {prop.justification}
                    </p>
                  </div>

                  {prop.reviewNote && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                      <span className="font-bold">Motif de la décision administrative :</span> {prop.reviewNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 4 : INSTRUCTION & GOUVERNANCE ADMINISTRATIVE */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "ADMIN_REVIEW" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Guichet d&apos;Instruction des Propositions Citoyennes
              </h3>
              <p className="text-xs text-gray-500">
                Validation formelle pour activation et création de l&apos;espace communautaire souverain.
              </p>
            </div>
            <Badge variant="solid" color="primary" size="md">
              {adminProposals.filter((p) => p.status === "PENDING").length} à instruire
            </Badge>
          </div>

          {adminProposals.filter((p) => p.status === "PENDING").length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <CheckIcon className="mx-auto size-10 text-emerald-500" />
              <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Toutes les propositions citoyennes sont instruites !
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Aucune initiative citoyenne en attente d&apos;instruction pour le moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {adminProposals
                .filter((p) => p.status === "PENDING")
                .map((prop) => (
                  <div
                    key={prop.id}
                    className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs dark:border-amber-900/50 dark:bg-gray-900"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {prop.name}
                          </h4>
                          <Badge variant="light" color="warning" size="sm">
                            À instruire
                          </Badge>
                        </div>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Initié par : <strong className="text-gray-800 dark:text-gray-200">{prop.proposedByName || "Citoyen"}</strong> • Territoire : {prop.territoryName || "Bénin"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingProposalId(prop.id);
                            setRejectionReason("");
                          }}
                          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:bg-gray-800 dark:text-rose-400"
                        >
                          Rejeter
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveProposal(prop.id)}
                          className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                        >
                          Valider &amp; Activer
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                      {prop.description}
                    </p>

                    <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs dark:bg-gray-800/40">
                      <span className="block font-bold text-[10px] uppercase text-gray-400">
                        Motif d&apos;utilité publique
                      </span>
                      <p className="mt-1 text-gray-700 dark:text-gray-300">
                        {prop.justification}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Rejection Reason (Adaptive Bottom-Sheet on mobile) */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              Motif de Rejet de la Proposition
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Conformément à la spécification, un motif argumenté est obligatoire pour justifier le refus auprès du citoyen.
            </p>

            <textarea
              rows={3}
              required
              placeholder="Ex: Territoire déjà couvert par un espace actif existant ou périmètre ambigu..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingProposalId(null)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CommunityDetailModal
        communityId={selectedCommunityId}
        onClose={() => setSelectedCommunityId(null)}
        isJoined={selectedCommunityId ? joinedCommunityIds.includes(selectedCommunityId) : false}
        isPending={selectedCommunityId ? pendingCommunityIds.includes(selectedCommunityId) : false}
        membershipStatus={
          selectedCommunityId
            ? joinedCommunityIds.includes(selectedCommunityId)
              ? "ACTIVE"
              : pendingCommunityIds.includes(selectedCommunityId)
              ? "PENDING"
              : "NONE"
            : "NONE"
        }
        onToggleJoin={handleToggleJoin}
        onRefresh={loadData}
      />

      <ProposeCommunityModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSuccess={handleProposalCreated}
      />
    </div>
  );
}
