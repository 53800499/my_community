"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Users,
  Compass,
  Check,
  X,
  Clock,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Search,
  MessageSquare,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Sparkles,
  UserCheck,
  Shield,
  AlertTriangle,
  Send,
  Trash2,
} from "lucide-react";
import { useAuth, usePermissions } from "@/features/auth";
import { useToast } from "@/features/errors";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Select2 } from "@/components/ui/Select2";

type DashboardCommunityTab = "OVERVIEW" | "PROPOSALS" | "MODERATION" | "RULES";

function DashboardCommunitiesContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const { isAdmin, isSuperAdmin, isExecutive, canReviewProposals } = usePermissions();
  const canReview = Boolean(isAdmin || isSuperAdmin || canReviewProposals);
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<DashboardCommunityTab>(() => {
    if (initialTab === "proposals" && canReview) return "PROPOSALS";
    if (initialTab === "moderation" && (isExecutive || canReview)) return "MODERATION";
    if (initialTab === "rules") return "RULES";
    return "OVERVIEW";
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "proposals") {
      if (canReview) {
        setActiveTab("PROPOSALS");
      } else {
        setActiveTab("OVERVIEW");
      }
    } else if (tabParam === "moderation") {
      if (isExecutive || canReview) {
        setActiveTab("MODERATION");
      } else {
        setActiveTab("OVERVIEW");
      }
    } else if (tabParam === "rules") {
      setActiveTab("RULES");
    }
  }, [searchParams, canReview, isExecutive]);

  // Data States
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [proposals, setProposals] = useState<ApiCommunityProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "TERRITORIAL" | "THEMATIC">("ALL");
  const [proposalStatusFilter, setProposalStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  // Selection & Modal States
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);

  // Rejection modal
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Moderation tab states
  const [moderationCommunityId, setModerationCommunityId] = useState<string>("");
  const [moderationMembers, setModerationMembers] = useState<ApiMembership[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  // Deletion modal state
  const [deletingCommunity, setDeletingCommunity] = useState<ApiCommunity | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletingCommunity) return;
    if (deleteConfirmName.trim().toLowerCase() !== deletingCommunity.name.trim().toLowerCase()) {
      setDeleteError(`Veuillez saisir exactement le nom « ${deletingCommunity.name} » pour confirmer.`);
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiService.communities.deleteCommunity(deletingCommunity.id, deleteConfirmName);
      showSuccess(`L'espace communautaire « ${deletingCommunity.name} » a été dissous et supprimé avec succès.`);
      setDeletingCommunity(null);
      setDeleteConfirmName("");
      await loadData();
    } catch (err) {
      showError(err, "Erreur lors de la suppression de la communauté");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [comms, assocs, adminProps] = await Promise.all([
        apiService.communities.list(),
        associationApiService.listAssociations().catch(() => []),
        canReview
          ? apiService.communities.getAdminProposals().catch(() => [])
          : Promise.resolve([]),
      ]);
      setCommunities(comms);
      setAssociations(assocs);
      setProposals(adminProps);

      if (comms.length > 0 && !moderationCommunityId) {
        setModerationCommunityId(comms[0].id);
      }
    } catch (err) {
      showError(err, "Erreur lors du chargement des espaces citoyens");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  // Load members when selected moderation community changes
  useEffect(() => {
    if (!moderationCommunityId) return;
    const fetchMembers = async () => {
      setIsMembersLoading(true);
      try {
        const mems = await apiService.communities.listMembers(moderationCommunityId);
        setModerationMembers(mems);
      } catch (err) {
        console.error("Erreur chargement membres:", err);
      } finally {
        setIsMembersLoading(false);
      }
    };
    fetchMembers();
  }, [moderationCommunityId]);

  // Filtered Communities
  const filteredCommunities = useMemo(() => {
    return communities.filter((com) => {
      const matchesType =
        typeFilter === "ALL" || com.type === typeFilter;
      const matchesSearch =
        com.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        com.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        com.territoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      return matchesType && matchesSearch;
    });
  }, [communities, typeFilter, searchTerm]);

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (proposalStatusFilter === "ALL") return true;
      return p.status === proposalStatusFilter;
    });
  }, [proposals, proposalStatusFilter]);

  // Pending count for badge
  const pendingProposalsCount = useMemo(() => {
    return proposals.filter((p) => p.status === "PENDING").length;
  }, [proposals]);

  // Handlers for Proposal Instruction
  const handleApproveProposal = async (proposalId: string) => {
    try {
      await apiService.communities.reviewProposal(proposalId, { decision: "APPROVED" });
      showSuccess("Proposition citoyenne approuvée avec succès ! L'espace communautaire est désormais actif.");
      await loadData();
    } catch (err) {
      showError(err, "Échec de l'approbation de la proposition");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingProposalId) return;
    if (!rejectionReason.trim()) {
      showInfo("Veuillez motiver le refus pour informer le citoyen proposant.");
      return;
    }

    try {
      await apiService.communities.reviewProposal(rejectingProposalId, {
        decision: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      showSuccess("Proposition rejetée. Le motif a été consigné pour le citoyen.");
      setRejectingProposalId(null);
      setRejectionReason("");
      await loadData();
    } catch (err) {
      showError(err, "Échec du rejet de la proposition");
    }
  };

  // Handlers for Moderation Roles
  const handleToggleRole = async (userId: string, role: "MODERATOR" | "MANAGER", currentlyHas: boolean) => {
    if (!moderationCommunityId) return;
    try {
      await apiService.communities.assignRole(
        moderationCommunityId,
        userId,
        role,
        currentlyHas ? "REVOKE" : "ASSIGN"
      );
      showSuccess(
        currentlyHas
          ? `Rôle ${role} révoqué.`
          : `Rôle ${role} attribué avec succès.`
      );
      const updated = await apiService.communities.listMembers(moderationCommunityId);
      setModerationMembers(updated);
    } catch (err) {
      showError(err, "Impossible de modifier le rôle");
    }
  };

  const handleDecideMembership = async (userId: string, decision: "APPROVE" | "SUSPEND" | "REVOKE") => {
    if (!moderationCommunityId) return;
    try {
      await apiService.communities.decideMembership(moderationCommunityId, userId, decision);
      showSuccess(`Adhésion mise à jour (${decision}).`);
      const updated = await apiService.communities.listMembers(moderationCommunityId);
      setModerationMembers(updated);
    } catch (err) {
      showError(err, "Échec de la modification du statut d'adhésion");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Welcome & Supervision Header */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-700 via-indigo-700 to-indigo-900 p-6 text-white shadow-xl dark:border-brand-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gouvernance Citoyenne &amp; Territoires</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Supervision des Espaces Citoyens
            </h1>
            <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
              Instruction des propositions de quartiers, attribution des rôles d&apos;animation locale (Modérateurs &amp; Managers) et suivi du fil citoyen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25"
            >
              <MessageSquare className="size-4" />
              <span>Accéder au Fil Citoyen</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProposeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50"
            >
              <Sparkles className="size-4" />
              <span>Proposer un Espace</span>
            </button>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-32 -bottom-24 size-48 rounded-full bg-brand-400/10 blur-xl" />
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Espaces Actifs
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Compass className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {communities.length}
            </span>
            <span className="text-xs text-gray-400 font-medium">territoires &amp; thèmes</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              À Instruire
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {pendingProposalsCount}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              {pendingProposalsCount > 0 ? "action requise" : "à jour"}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Citoyens Référencés
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Users className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {communities.reduce((acc, c) => acc + (c.membersCount || 1), 0)}
            </span>
            <span className="text-xs text-emerald-600 font-medium">membres actifs</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Associations Ancrées
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Building2 className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {associations.length}
            </span>
            <span className="text-xs text-indigo-600 font-medium">organisations</span>
          </div>
        </div>
      </div>

      {/* Pedagogical Governance Banner (ADR-013) */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-brand-50/40 p-4 text-xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-gray-900 dark:to-gray-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Info className="size-4" />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                  Gouvernance Souveraine : Règle Fondamentale de Séparation
                </h4>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  ADR-013
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                L&apos;Espace Communautaire est un <strong>rassemblement social libre de proximité</strong> (quartier, campus, intérêt). Il n&apos;exige aucun bureau officiel imposé ni cotisation financière. Les <strong>Associations rattachées</strong> sont des personnes morales distinctes avec statuts, cotisations en XOF et bureau élu (Président, Secrétaire, Trésorier).
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
                Rôles au sein de la Communauté
              </span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li><strong>Créateur / Administrateur</strong> : assure la configuration technique et la gestion de la fiche.</li>
                <li><strong>Modérateur</strong> : veille à la bienveillance et au respect de la charte de voisinage.</li>
                <li><strong>Membre Citoyen</strong> : réside sur le territoire et participe aux échanges.</li>
              </ul>
            </div>
            <div className="rounded-xl bg-white/70 p-3 dark:bg-gray-800/60">
              <span className="font-bold text-brand-800 dark:text-brand-300 block mb-1">
                Multi-Rattachements N &times; M
              </span>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300 list-disc list-inside">
                <li>Une communauté territoriale peut accueillir plusieurs associations partenaires.</li>
                <li>Une association peut intervenir dans plusieurs communautés géographiques.</li>
                <li>L&apos;appartenance à l&apos;un n&apos;entraîne jamais l&apos;adhésion automatique à l&apos;autre.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "OVERVIEW"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Compass className="size-4" />
          <span>Espaces Citoyens ({communities.length})</span>
        </button>

        {canReview && (
          <button
            type="button"
            onClick={() => setActiveTab("PROPOSALS")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
              activeTab === "PROPOSALS"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Clock className="size-4" />
            <span>Instruction des Propositions</span>
            {pendingProposalsCount > 0 && (
              <span className="rounded-full bg-amber-500 text-white size-4.5 flex items-center justify-center text-[10px] font-bold">
                {pendingProposalsCount}
              </span>
            )}
          </button>
        )}

        {(canReview || isExecutive) && (
          <button
            type="button"
            onClick={() => setActiveTab("MODERATION")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
              activeTab === "MODERATION"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>Modération &amp; Rôles</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("RULES")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 transition ${
            activeTab === "RULES"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <FileCheck className="size-4" />
          <span>Chartes &amp; Règles</span>
        </button>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* VUE 1 : OVERVIEW / ANNUAIRE DES ESPACES */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTypeFilter("ALL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === "ALL"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Toutes ({communities.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("TERRITORIAL")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === "TERRITORIAL"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Territoriales
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("THEMATIC")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === "THEMATIC"
                    ? "bg-brand-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Thématiques
              </button>
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="size-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom, ville..."
                className="h-9 w-64 rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Communities Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredCommunities.map((com) => {
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
                          <Compass className="size-5" />
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
                            {com.type === "TERRITORIAL" ? "Territoire Citoyen" : "Thématique Spécialisée"}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant="light"
                        color={com.type === "TERRITORIAL" ? "primary" : "info"}
                        size="sm"
                      >
                        {com.membersCount} citoyens
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
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setSelectedCommunityId(com.id)}
                      className="text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Fiche &amp; Règlements &rarr;
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`/feed?communityId=${com.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <MessageSquare className="size-3.5" />
                        <span>Fil</span>
                      </button>

                      {(canReview || isExecutive) && (
                        <button
                          type="button"
                          onClick={() => {
                            setModerationCommunityId(com.id);
                            setActiveTab("MODERATION");
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-brand-700"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Modérer</span>
                        </button>
                      )}

                      {canReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingCommunity(com);
                            setDeleteConfirmName("");
                            setDeleteError(null);
                          }}
                          className="inline-flex items-center rounded-xl p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                          title="Dissoudre / Supprimer cet espace communautaire"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 2 : PROPOSALS / INSTRUCTION */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "PROPOSALS" && (
        <div className="space-y-4">
          {/* Bannière d'autorité & validation */}
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/40 p-4 text-xs dark:border-amber-900/40 dark:from-amber-950/40 dark:via-gray-900 dark:to-gray-900">
            <div className="flex items-start gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                  Qui valide les propositions de communautés citoyennes ?
                </h4>
                <p className="mt-0.5 text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                  L&apos;instruction officielle est assurée par les <strong>Administrateurs Territoriaux (Communes, Mairies, Arrondissements)</strong> et l&apos;<strong>Administration Générale de la Plateforme (Super-Admin)</strong>. L&apos;approbation génère automatiquement la communauté active avec son slug officiel et notifie le citoyen auteur. En cas de refus, un motif officiel est obligatoirement notifié.
                </p>
              </div>
            </div>
          </div>

          {/* Proposal Status Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setProposalStatusFilter("PENDING")}
              className={`rounded-xl px-3 py-1.5 transition ${
                proposalStatusFilter === "PENDING"
                  ? "bg-amber-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
            >
              En attente ({proposals.filter((p) => p.status === "PENDING").length})
            </button>
            <button
              type="button"
              onClick={() => setProposalStatusFilter("APPROVED")}
              className={`rounded-xl px-3 py-1.5 transition ${
                proposalStatusFilter === "APPROVED"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
            >
              Approuvées ({proposals.filter((p) => p.status === "APPROVED").length})
            </button>
            <button
              type="button"
              onClick={() => setProposalStatusFilter("REJECTED")}
              className={`rounded-xl px-3 py-1.5 transition ${
                proposalStatusFilter === "REJECTED"
                  ? "bg-rose-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
            >
              Rejetées ({proposals.filter((p) => p.status === "REJECTED").length})
            </button>
            <button
              type="button"
              onClick={() => setProposalStatusFilter("ALL")}
              className={`rounded-xl px-3 py-1.5 transition ${
                proposalStatusFilter === "ALL"
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              }`}
            >
              Toutes ({proposals.length})
            </button>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
              <Clock className="mx-auto size-10 text-gray-400" />
              <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Aucune proposition dans cette catégorie
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Toutes les propositions citoyennes pour ce filtre ont été traitées.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((prop) => {
                const isPending = prop.status === "PENDING";
                const isApproved = prop.status === "APPROVED";

                return (
                  <div
                    key={prop.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {prop.name}
                          </h3>
                          <Badge
                            variant="light"
                            color={isApproved ? "success" : isPending ? "warning" : "error"}
                            size="sm"
                          >
                            {prop.status}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Proposée le {new Date(prop.createdAt).toLocaleDateString("fr-FR")} par {prop.proposedByName || "Citoyen Résident"}
                        </span>
                      </div>

                      {/* Action buttons if PENDING */}
                      {isPending && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleApproveProposal(prop.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                          >
                            <Check className="size-3.5" />
                            <span>Approuver &amp; Activer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingProposalId(prop.id);
                              setRejectionReason("");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                          >
                            <X className="size-3.5" />
                            <span>Rejeter avec Motif</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Description de l&apos;espace :
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {prop.description}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                          Justification &amp; Ancrage Territorial :
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {prop.justification}
                        </p>
                      </div>
                    </div>

                    {prop.reviewNote && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block">
                          Motif consigné :
                        </span>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                          {prop.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 3 : MODERATION & RÔLES LOCAUX */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "MODERATION" && (
        <div className="space-y-4">
          {/* Community Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-brand-600" />
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Gestion des Rôles &amp; Modération Locale
                </h3>
                <p className="text-[11px] text-gray-500">
                  Attribuez les statuts de Modérateur et Manager pour animer cet espace.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-gray-500 shrink-0">Espace :</span>
              <div className="w-full sm:w-64">
                <Select2
                  value={moderationCommunityId}
                  onChange={(e) => setModerationCommunityId(e.target.value)}
                  className="w-full"
                >
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select2>
              </div>
            </div>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
                Membres de la Communauté ({moderationMembers.length})
              </h4>
              <Badge variant="light" color="primary" size="sm">
                Rôles Non-Hiérarchiques
              </Badge>
            </div>

            {isMembersLoading ? (
              <div className="p-8 text-center text-xs text-gray-500">
                Chargement des membres...
              </div>
            ) : moderationMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">
                Aucun membre répertorié dans cet espace pour le moment.
              </div>
            ) : (
              <div className="mt-3 divide-y divide-gray-100 text-xs dark:divide-gray-800">
                {moderationMembers.map((mem) => {
                  const hasMod = mem.roles?.includes("MODERATOR");
                  const hasMgr = mem.roles?.includes("MANAGER");

                  return (
                    <div
                      key={mem.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {(mem.userName || "CI").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{mem.userName || "Citoyen Résident"}</span>
                            <Badge
                              variant="light"
                              color={mem.status === "ACTIVE" ? "success" : "warning"}
                              size="sm"
                            >
                              {mem.status}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            ID: {mem.userId.slice(0, 8)}... • Rejoint le {new Date(mem.joinedAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>

                      {/* Role Toggle Controls */}
                      <div className="flex items-center gap-2">
                        {/* Moderator toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleRole(mem.userId, "MODERATOR", !!hasMod)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                            hasMod
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <ShieldCheck className="size-3" />
                          <span>{hasMod ? "Modérateur (Actif)" : "+ Modérateur"}</span>
                        </button>

                        {/* Manager toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleRole(mem.userId, "MANAGER", !!hasMgr)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                            hasMgr
                              ? "bg-brand-100 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <UserCheck className="size-3" />
                          <span>{hasMgr ? "Manager (Actif)" : "+ Manager"}</span>
                        </button>

                        {/* Status moderation */}
                        {mem.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleDecideMembership(mem.userId, "APPROVE")}
                            className="rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700"
                          >
                            Valider
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* VUE 4 : RÈGLES & CHARTES */}
      {/* -------------------------------------------------------------------- */}
      {activeTab === "RULES" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
              <FileCheck className="size-5 text-brand-600" />
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Charte Citoyenne &amp; Convivialité Locale
                </h3>
                <p className="text-[11px] text-gray-500">
                  Règles de bienveillance applicables par défaut à l&apos;ensemble des communautés My Community.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800/60 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">
                  1. Respect du Cadre de Vie &amp; Salubrité
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  Participer aux efforts collectifs de propreté des caniveaux, trottoirs et voies publiques dans son quartier.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800/60 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">
                  2. Entraide Locale &amp; Vigilance Confraternelle
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  Priorité au partage des alertes de sécurité de quartier et à l&apos;accueil bienveillant des nouveaux résidents ou étudiants.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800/60 space-y-1">
                <span className="font-bold text-gray-900 dark:text-white">
                  3. Indépendance Associative &amp; Clarté des Rôles
                </span>
                <p className="text-gray-600 dark:text-gray-400">
                  Les cotisations obligatoires sont réservées aux associations déclarées. Aucun prélèvement financier ne peut être imposé pour participer aux échanges d&apos;une communauté citoyenne.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal for Proposals */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </span>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                Rejeter la Proposition Citoyenne
              </h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-400">
              Veuillez indiquer un motif clair et constructif. Cette explication sera transmise au citoyen ayant formulé la demande.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex : Ce territoire est déjà rattaché à l'espace officiel 'Habitants de Zogbadjè'. Nous vous invitons à y participer..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setRejectingProposalId(null);
                  setRejectionReason("");
                }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Detail Modal */}
      <CommunityDetailModal
        communityId={selectedCommunityId}
        onClose={() => setSelectedCommunityId(null)}
        onRefresh={loadData}
      />

      {/* Propose Community Modal */}
      <ProposeCommunityModal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        onSuccess={() => {
          setIsProposeModalOpen(false);
          loadData();
        }}
      />

      {/* Modal Dissolution & Suppression Communauté */}
      {deletingCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-5 shrink-0" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Dissoudre l&apos;Espace Communautaire
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeletingCommunity(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                <p className="font-bold">Avertissement de sécurité &amp; impact :</p>
                <ul className="mt-1.5 list-disc pl-4 space-y-1 text-[11px] text-rose-800 dark:text-rose-300">
                  <li>La suppression retire définitivement « <strong>{deletingCommunity.name}</strong> » de la plateforme.</li>
                  <li>Les {deletingCommunity.membersCount || 1} membre(s) citoyens et les associations rattachées seront déliés.</li>
                  <li>Le fil d&apos;actualité et les initiatives de ce territoire seront clôturés.</li>
                </ul>
              </div>

              {deleteError && (
                <div className="rounded-xl border border-rose-300 bg-rose-100 p-3 text-xs text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteCommunity} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Pour confirmer, tapez le nom exact : <span className="font-mono text-rose-600 dark:text-rose-400 select-all font-bold">{deletingCommunity.name}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder="Recopier le nom de la communauté ici..."
                    className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingCommunity(null)}
                    disabled={isDeleting}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isDeleting ||
                      deleteConfirmName.trim().toLowerCase() !== deletingCommunity.name.trim().toLowerCase()
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <Trash2 className="size-3.5" />
                    <span>{isDeleting ? "Dissolution en cours..." : "Confirmer la Dissolution"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardCommunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <DashboardCommunitiesContent />
    </Suspense>
  );
}
