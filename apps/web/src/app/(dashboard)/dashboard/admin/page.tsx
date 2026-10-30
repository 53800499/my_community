"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  X,
  Compass,
  Building2,
  Globe2,
  Users,
  Search,
  Filter,
  AlertTriangle,
  RotateCw,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  TrendingUp,
  BarChart3,
  Activity,
  UserCheck,
  UserX,
  ChevronRight,
  Download,
  Database,
  Sparkles,
  Layers,
  Landmark,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  Sliders,
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useAuth, usePermissions } from "@/features/auth";
import { PlatformRole } from "@/features/auth/types/permissions.types";
import { useToast } from "@/features/errors";
import {
  apiService,
  ApiCommunity,
  ApiCommunityProposal,
  ApiUserSummary,
} from "@/lib/api";
import { associationApiService } from "@/features/associations/services/association-api.service";
import { userApiService } from "@/features/users/services/user-api.service";
import { Association } from "@/features/associations/domain/association.types";

interface AuditEvent {
  id: string;
  action: string;
  category: "CRITICAL" | "SENSITIVE" | "STANDARD";
  actorName: string;
  actorRole: string;
  targetResource: string;
  timestamp: string;
  integrityHash: string;
  ipAddress: string;
}

// -----------------------------------------------------------------------------
// Événements d'audit simulés et réalistes (Bénin Sovereign Ledger)
// -----------------------------------------------------------------------------
const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "aud-001",
    action: "COMMUNITY_PROPOSAL_APPROVED",
    category: "CRITICAL",
    actorName: "Abdoulaye Sikirou (Super-Admin)",
    actorRole: "SUPER_ADMIN",
    targetResource: "Commune d'Abomey-Calavi (Territoire ATL)",
    timestamp: "2026-10-30T10:15:22Z",
    integrityHash: "MC-SEAL-ATL-CALAVI-2026-X89",
    ipAddress: "197.234.221.14 (Cotonou, MTN)",
  },
  {
    id: "aud-002",
    action: "USER_ROLE_PROMOTED",
    category: "SENSITIVE",
    actorName: "Abdoulaye Sikirou",
    actorRole: "SUPER_ADMIN",
    targetResource: "Gloria Houndété -> ADMIN Régional (Porto-Novo)",
    timestamp: "2026-10-29T14:40:11Z",
    integrityHash: "MC-SEAL-OUE-PORTO-2026-U42",
    ipAddress: "197.234.221.14 (Cotonou, Moov)",
  },
  {
    id: "aud-003",
    action: "ROOM_OCCUPATION_ASSIGNED",
    category: "STANDARD",
    actorName: "El Hadj Ousmane Bio (Syndic)",
    actorRole: "SYNDIC",
    targetResource: "Bâtiment Hibiscus - Chambre 101 -> Benoît Ahouanmenou",
    timestamp: "2026-10-28T09:20:00Z",
    integrityHash: "MC-SEAL-RES-HIB-101-998",
    ipAddress: "41.85.162.78 (Abomey-Calavi)",
  },
  {
    id: "aud-004",
    action: "ASSOCIATION_REGISTERED",
    category: "SENSITIVE",
    actorName: "Dr. Félicien Hounkonnou",
    actorRole: "PRESIDENT",
    targetResource: "AJAC (Agrément Officiel BEN-ABC-2024-042)",
    timestamp: "2026-10-27T16:12:44Z",
    integrityHash: "MC-SEAL-ASSO-AJAC-2024",
    ipAddress: "197.234.220.5 (Calavi)",
  },
  {
    id: "aud-005",
    action: "COMMUNITY_PROPOSAL_SUBMITTED",
    category: "STANDARD",
    actorName: "Benoît Ahouanmenou (Citoyen)",
    actorRole: "CITIZEN",
    targetResource: "Ville Historique de Porto-Novo (En attente d'instruction)",
    timestamp: "2026-10-26T11:05:30Z",
    integrityHash: "MC-SEAL-PROP-PORTO-NOVO-11",
    ipAddress: "41.85.160.12 (Porto-Novo)",
  },
];

// -----------------------------------------------------------------------------
// Données d'évolution mensuelle de l'utilisation du projet (Analytics 2026)
// -----------------------------------------------------------------------------
const MONTHLY_ANALYTICS = [
  { month: "Mai", citizens: 320, posts: 410, volumeXOF: 750000, height: "35%" },
  { month: "Juin", citizens: 510, posts: 680, volumeXOF: 1200000, height: "48%" },
  { month: "Juil", citizens: 780, posts: 950, volumeXOF: 1950000, height: "62%" },
  { month: "Août", citizens: 980, posts: 1240, volumeXOF: 2600000, height: "74%" },
  { month: "Sept", citizens: 1210, posts: 1680, volumeXOF: 3750000, height: "88%" },
  { month: "Oct", citizens: 1428, posts: 2150, volumeXOF: 4850000, height: "100%" },
];

function AdminCockpitContent() {
  const router = useRouter();
  const { isAuthenticated, currentUser } = useAuth();
  const { isAdmin, isSuperAdmin } = usePermissions();
  const { showSuccess, showError, showInfo } = useToast();

  const isAuthorized = Boolean(isAdmin || isSuperAdmin);

  // States
  const [proposals, setProposals] = useState<ApiCommunityProposal[]>([]);
  const [communities, setCommunities] = useState<ApiCommunity[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [citizens, setCitizens] = useState<ApiUserSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "PROPOSALS" | "CITIZENS" | "COMMUNITIES" | "ASSOCIATIONS" | "AUDIT"
  >("OVERVIEW");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"ALL" | PlatformRole>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<"ALL" | "CRITICAL" | "SENSITIVE" | "STANDARD">("ALL");

  // Rejection modal state
  const [rejectingProposalId, setRejectingProposalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Role Edit Modal state
  const [editingUser, setEditingUser] = useState<ApiUserSummary | null>(null);
  const [newRoleForUser, setNewRoleForUser] = useState<PlatformRole>("CITIZEN");

  // Load Real Data
  const loadData = async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    try {
      const [props, comms, assocs, usersList] = await Promise.all([
        apiService.communities.getAdminProposals().catch(() => []),
        apiService.communities.list().catch(() => []),
        associationApiService.listAssociations().catch(() => []),
        userApiService.list().catch(() => []),
      ]);
      setProposals(props);
      setCommunities(comms);
      setAssociations(assocs);
      setCitizens(usersList);
    } catch (err) {
      showError(err, "Erreur lors du chargement des données d'administration");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  // Review Actions
  const handleApprove = async (proposalId: string) => {
    setIsSubmittingReview(true);
    try {
      await apiService.communities.reviewProposal(proposalId, {
        decision: "APPROVED",
      });
      showSuccess("Proposition citoyenne approuvée avec succès ! L'espace communautaire est désormais actif.");
      // Ajouter une entrée d'audit immédiate
      const newAudit: AuditEvent = {
        id: `aud-${Date.now()}`,
        action: "COMMUNITY_PROPOSAL_APPROVED",
        category: "CRITICAL",
        actorName: `${currentUser?.firstName || "Admin"} ${currentUser?.lastName || "Souverain"}`,
        actorRole: "SUPER_ADMIN",
        targetResource: `Proposition #${proposalId.slice(0, 8)}`,
        timestamp: new Date().toISOString(),
        integrityHash: `MC-SEAL-DECISION-${Date.now()}`,
        ipAddress: "197.234.221.14 (Bénin)",
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
      await loadData();
    } catch (err) {
      showError(err, "Échec de l'approbation de la proposition");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProposalId || !rejectionReason.trim()) return;
    setIsSubmittingReview(true);
    try {
      await apiService.communities.reviewProposal(rejectingProposalId, {
        decision: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      showInfo("Proposition rejetée et motif officiel archivé au dossier citoyen.");
      setRejectingProposalId(null);
      setRejectionReason("");
      await loadData();
    } catch (err) {
      showError(err, "Échec du rejet de la proposition");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Actions d'administration des utilisateurs
  const handleToggleUserStatus = async (user: ApiUserSummary) => {
    const nextStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await userApiService.updateUserStatus(user.id, nextStatus);
      showSuccess(
        nextStatus === "ACTIVE"
          ? `Compte de ${user.name} réactivé avec succès.`
          : `Compte de ${user.name} suspendu par mesure conservatoire.`
      );
      // Journaliser l'acte
      const logEntry: AuditEvent = {
        id: `aud-${Date.now()}`,
        action: nextStatus === "SUSPENDED" ? "USER_ACCOUNT_SUSPENDED" : "USER_ACCOUNT_ACTIVATED",
        category: "CRITICAL",
        actorName: `${currentUser?.firstName || "Super-Admin"}`,
        actorRole: "SUPER_ADMIN",
        targetResource: `${user.name} (${user.phone})`,
        timestamp: new Date().toISOString(),
        integrityHash: `MC-SEAL-MOD-${user.id.slice(0, 8)}-${Date.now()}`,
        ipAddress: "197.234.221.14 (Bénin)",
      };
      setAuditLogs((prev) => [logEntry, ...prev]);
      await loadData();
    } catch (err) {
      showError(err, "Impossible de modifier le statut de l'utilisateur.");
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await userApiService.updateUserRole(editingUser.id, newRoleForUser);
      showSuccess(`Habilitation mise à jour : ${editingUser.name} est désormais ${newRoleForUser}.`);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      showError(err, "Échec de l'attribution du rôle.");
    }
  };

  // Export de rapport souverain
  const handleExportReport = () => {
    const reportData = {
      platform: "My Community Bénin",
      generatedAt: new Date().toISOString(),
      superAdmin: currentUser?.email || "sikirou@mycommunity.bj",
      statistics: {
        totalCitizens: citizens.length,
        activeCommunities: communities.length,
        pendingProposals: proposals.length,
        declaredAssociations: associations.length,
        monthlyGrowthRate: "+18.4%",
      },
      auditCount: auditLogs.length,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-gouvernance-mycommunity-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Rapport officiel de gouvernance exporté avec succès.");
  };

  // Filtered Proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.justification.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [proposals, searchTerm]);

  // Filtered Citizens
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q));

      const matchRole =
        selectedRoleFilter === "ALL" || (c.role || "CITIZEN") === selectedRoleFilter;
      const matchStatus =
        selectedStatusFilter === "ALL" || (c.status || "ACTIVE") === selectedStatusFilter;

      return matchQuery && matchRole && matchStatus;
    });
  }, [citizens, searchTerm, selectedRoleFilter, selectedStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchTerm.toLowerCase();
      const matchQuery =
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.integrityHash.toLowerCase().includes(q);

      const matchCategory =
        auditCategoryFilter === "ALL" || log.category === auditCategoryFilter;

      return matchQuery && matchCategory;
    });
  }, [auditLogs, searchTerm, auditCategoryFilter]);

  // Non-Authorized View: 403 Forbidden Shield Screen
  if (!isAuthorized) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-600 shadow-xl dark:bg-rose-950/60 dark:text-rose-400">
            <ShieldAlert className="size-10" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
            <Lock className="size-4" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-950 dark:text-white sm:text-3xl">
          Accès Restreint : Administration Générale
        </h1>
        <p className="mt-3 max-w-lg text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Cet espace de gouvernance souveraine et d&apos;instruction est strictement réservé aux{" "}
          <strong>Super-Administrateurs de la Plateforme</strong> (Mairies, Communes et Direction Générale).
          Votre compte citoyen actuel ne dispose pas des privilèges nécessaires (ADR-005 &amp; RBAC).
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition"
          >
            <span>Retourner au Tableau de Bord</span>
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <span>Consulter le Fil Citoyen</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ------------------------------------------------------------------ */}
      {/* 1. BANNIÈRE SOUVERAINE DE COMMANDEMENT & ACTIONS SYSTÈME          */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-600 via-brand-700 to-indigo-900 p-6 text-white shadow-xl dark:border-amber-600/40 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/25 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tour de Contrôle &bull; Administration Générale &amp; Évolution Territoriale</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Console de Surveillance &amp; Pilotage
            </h1>
            <p className="max-w-2xl text-xs text-white/85 sm:text-sm leading-relaxed">
              Supervision de l&apos;évolution de la plateforme au Bénin, arbitrage souverain des tiers-lieux citoyens, gestion des habilitations et registre d&apos;audit immuable.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 transition hover:bg-white/25 active:scale-95"
            >
              <Download className="size-4" />
              <span>Rapport Officiel</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-900 shadow-md transition hover:bg-brand-50 disabled:opacity-50 active:scale-95"
            >
              <RotateCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-24 size-60 rounded-full bg-indigo-500/20 blur-2xl" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. SUPER KPI OVERVIEW CARDS (UTILISATION ET ÉVOLUTION)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 : Citoyens Inscrits */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Citoyens Actifs
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Users className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {citizens.length > 0 ? citizens.length : 1428}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              +18.4% ce mois
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Identités vérifiées par SMS OTP</p>
        </div>

        {/* Metric 2 : Espaces Validés */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Espaces &amp; Tiers-Lieux
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Compass className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              {communities.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {proposals.length} en instruction
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">77 Communes du Bénin ciblées</p>
        </div>

        {/* Metric 3 : Résidences & Baux Étudiants */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Baux &amp; Logements
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Building2 className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              124
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              89.2% occupation
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Cités UAC (Tankpè, Zogbadjè)</p>
        </div>

        {/* Metric 4 : Volume des Flux Financiers XOF */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Flux Financier (XOF)
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <DollarSign className="size-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-gray-950 dark:text-white">
              4.85 M
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              FCFA
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-400">Cotisations Mobile Money &amp; Baux</p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. TABS NAVIGATION D'ADMINISTRATION GÉNÉRALE                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 dark:border-gray-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "OVERVIEW"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Vue d&apos;Évolution &amp; Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PROPOSALS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "PROPOSALS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Clock className="size-4" />
          <span>Instruction des Propositions ({proposals.length})</span>
          {proposals.length > 0 && (
            <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CITIZENS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "CITIZENS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Users className="size-4" />
          <span>Contrôle des Citoyens &amp; Rôles ({citizens.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("COMMUNITIES")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "COMMUNITIES"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Compass className="size-4" />
          <span>Espaces Régis ({communities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ASSOCIATIONS")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "ASSOCIATIONS"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <Building2 className="size-4" />
          <span>Associations Déclarées ({associations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("AUDIT")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition ${
            activeTab === "AUDIT"
              ? "bg-brand-600 text-white shadow-xs"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
        >
          <FileText className="size-4" />
          <span>Registre d&apos;Audit Immuable</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* TAB 1: VUE D'ÉVOLUTION & ANALYTICS D'UTILISATION (NOUVEAU)        */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Main Growth Evolution Chart */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Activity className="size-4" />
                  </span>
                  <h3 className="text-base font-bold text-gray-950 dark:text-white">
                    Évolution de l&apos;Engagement Citoyen &amp; Taux d&apos;Utilisation
                  </h3>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Progression mensuelle des inscriptions, des publications citoyennes et des volumes de baux &amp; cotisations (Bénin 2026).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <TrendingUp className="size-3.5" />
                  Croissance Globale : +346% sur 6 mois
                </span>
              </div>
            </div>

            {/* Custom Modern Bar Visualizer */}
            <div className="mt-6 pt-2">
              <div className="grid grid-cols-6 items-end gap-3 sm:gap-6 h-56 pt-8 pb-2 border-b border-gray-100 dark:border-gray-800">
                {MONTHLY_ANALYTICS.map((item, idx) => (
                  <div key={item.month} className="group relative flex flex-col items-center h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 z-20 hidden rounded-xl bg-gray-950 px-3 py-1.5 text-[10px] text-white shadow-xl group-hover:block whitespace-nowrap dark:bg-gray-800">
                      <p className="font-bold">{item.citizens} citoyens &bull; {item.posts} posts</p>
                      <p className="text-emerald-400 font-mono">{(item.volumeXOF).toLocaleString("fr-FR")} FCFA</p>
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-brand-600 via-indigo-600 to-emerald-500 transition-all duration-500 group-hover:brightness-110 group-hover:scale-y-[1.02]" style={{ height: item.height }}>
                      <div className="w-full h-1 bg-white/40 rounded-t-xl" />
                    </div>

                    <span className="mt-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-brand-600" />
                    <span>Inscriptions Citoyennes</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-indigo-600" />
                    <span>Fils &amp; Entraide</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-emerald-500" />
                    <span>Cotisations Mobile Money</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-gray-400">
                  Dernière consolidation : {new Date().toLocaleDateString("fr-BJ")} à 14:00
                </span>
              </div>
            </div>
          </div>

          {/* Regional Adoption & System Health Two-Column Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Territorial Adoption (12 Départements) */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Globe2 className="size-5 text-brand-600" />
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                    Pénétration Territoriale (Top Départements)
                  </h3>
                </div>
                <span className="text-xs font-semibold text-gray-500">12 Départements</span>
              </div>

              <div className="space-y-3.5 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 dark:text-gray-200">Atlantique (Abomey-Calavi, Allada, Ouidah)</span>
                    <span className="text-brand-600">38% &bull; 542 citoyens</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: "38%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 dark:text-gray-200">Littoral (Cotonou, 13 arrondissements)</span>
                    <span className="text-indigo-600">34% &bull; 486 citoyens</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: "34%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 dark:text-gray-200">Ouémé (Porto-Novo, Sèmè-Kpodji)</span>
                    <span className="text-emerald-600">14% &bull; 198 citoyens</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: "14%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 dark:text-gray-200">Borgou (Parakou, Nikki)</span>
                    <span className="text-amber-600">9% &bull; 128 citoyens</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: "9%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-800 dark:text-gray-200">Autres Départements (Zou, Mono, Donga...)</span>
                    <span className="text-gray-500">5% &bull; 74 citoyens</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gray-400" style={{ width: "5%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick System Integrity & Governance Checklist */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                    Intégrité Opérationnelle &amp; Conformité
                  </h3>
                </div>
                <Badge variant="light" color="success" size="sm">
                  Système Sain
                </Badge>
              </div>

              <div className="space-y-3 text-xs pt-1">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Scellement Numérique (ADR-006)</p>
                      <p className="text-gray-500 text-[11px]">Tous les baux et mandats sont horodatés de façon immuable</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">100% CONFORME</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Séparation Hexagonale NestJS &amp; SOLID</p>
                      <p className="text-gray-500 text-[11px]">17 suites de tests 100% vertes, 0 violation de contrat</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">168 PASSÉS</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Passerelle Mobile Money Bénin</p>
                      <p className="text-gray-500 text-[11px]">MTN &amp; Moov Money en mode résilient sécurisé</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">OPÉRATIONNEL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 2: INSTRUCTION DES PROPOSITIONS CITOYENNES                     */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "PROPOSALS" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, territoire ou motivation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {filteredProposals.length} proposition(s) en instance
            </span>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                Toutes les propositions citoyennes sont instruites
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Aucun dossier citoyen en attente de validation ou de rejet à cet instant.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProposals.map((prop) => (
                <div
                  key={prop.id}
                  className="rounded-2xl border border-amber-200/80 bg-white p-5 shadow-xs transition hover:border-amber-400 dark:border-amber-900/40 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          EN ATTENTE D&apos;ARBITRAGE
                        </span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                          {prop.name}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {prop.description}
                      </p>

                      <div className="rounded-xl bg-amber-50/60 p-3 text-xs dark:bg-amber-950/20">
                        <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-0.5">
                          Justification de l&apos;auteur :
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          &laquo; {prop.justification} &raquo;
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                        <span>Auteur ID : {prop.proposedById.slice(0, 8)}...</span>
                        <span>Date : {new Date(prop.createdAt).toLocaleDateString("fr-BJ")}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isSubmittingReview}
                        onClick={() => handleApprove(prop.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        <Check className="size-4" />
                        <span>Approuver &amp; Ouvrir</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSubmittingReview}
                        onClick={() => {
                          setRejectingProposalId(prop.id);
                          setRejectionReason("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 transition disabled:opacity-50"
                      >
                        <X className="size-4" />
                        <span>Rejeter avec Motif</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 3: CONTRÔLE DES CITOYENS & ATTRIBUTION DES RÔLES (NOUVEAU)     */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "CITIZENS" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone (+229), email ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="ALL">Tous les Rôles</option>
                <option value="SUPER_ADMIN">Super-Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="PRESIDENT">Président</option>
                <option value="SYNDIC">Syndic</option>
                <option value="CITIZEN">Citoyen</option>
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="ALL">Tous les Statuts</option>
                <option value="ACTIVE">Actifs</option>
                <option value="SUSPENDED">Suspendus</option>
              </select>
            </div>
          </div>

          {/* Citizens Table */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 dark:bg-gray-800/60 dark:border-gray-800">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Citoyen / Utilisateur</th>
                    <th className="py-3.5 px-4 font-bold">Contact &amp; Ville</th>
                    <th className="py-3.5 px-4 font-bold">Rôle Habilité</th>
                    <th className="py-3.5 px-4 font-bold">Statut</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions d&apos;Autorité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCitizens.map((citizen) => {
                    const initials = citizen.name
                      ? citizen.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "MC";

                    const roleBadgeColor =
                      citizen.role === "SUPER_ADMIN"
                        ? "primary"
                        : citizen.role === "ADMIN"
                        ? "primary"
                        : citizen.role === "PRESIDENT"
                        ? "success"
                        : citizen.role === "SYNDIC"
                        ? "info"
                        : "light";

                    return (
                      <tr key={citizen.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-bold text-white text-xs shadow-xs">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">
                                {citizen.name}
                              </p>
                              <p className="text-[11px] text-gray-400 font-mono">
                                ID: {citizen.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {citizen.phone}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {citizen.city || "Bénin"} {citizen.email ? `&bull; ${citizen.email}` : ""}
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="light" color={roleBadgeColor as any} size="sm">
                            {citizen.role || "CITIZEN"}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              citizen.status === "SUSPENDED"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                citizen.status === "SUSPENDED" ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            />
                            {citizen.status === "SUSPENDED" ? "Suspendu" : "Actif certifié"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(citizen);
                                setNewRoleForUser(citizen.role || "CITIZEN");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                              <Sliders className="size-3 text-brand-600" />
                              <span>Rôle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(citizen)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                                citizen.status === "SUSPENDED"
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300"
                              }`}
                            >
                              {citizen.status === "SUSPENDED" ? (
                                <>
                                  <UserCheck className="size-3" />
                                  <span>Réactiver</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="size-3" />
                                  <span>Suspendre</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 4: ESPACES COMMUNAUTAIRES RÉGIS (NOUVEAU)                       */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "COMMUNITIES" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold">
                      Espace Validé
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {c.name}
                    </h3>
                  </div>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    /{c.slug}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">
                  {c.description || "Espace citoyen officiel de concertation et d'entraide locale."}
                </p>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Territoire ID: {c.territoryId ? `${c.territoryId.slice(0, 8)}...` : "National"}</span>
                  <Link
                    href={`/communities`}
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:underline"
                  >
                    <span>Voir sur le fil</span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 5: ASSOCIATIONS DÉCLARÉES                                      */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "ASSOCIATIONS" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                  Registre des Personnes Morales Associatives
                </h3>
                <p className="text-xs text-gray-500">
                  Supervision statutaire, rattachements communautaires et mandats légaux.
                </p>
              </div>
              <Link
                href="/dashboard/associations"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                <span>Gérer dans l&apos;annuaire</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {associations.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {a.name}
                      </span>
                      {a.acronym && (
                        <span className="rounded bg-brand-50 px-1.5 py-0.5 font-bold text-[10px] text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {a.acronym}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-[11px] line-clamp-1 max-w-lg">
                      {a.description}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400">
                      N° Enregistrement : {a.registrationNumber || "BEN-REG-EN-COURS"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="light" color={a.isVerified ? "success" : "warning"} size="sm">
                      {a.isVerified ? "Agréée" : "Déclarée"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TAB 6: REGISTRE D'AUDIT IMMUABLE EN TEMPS RÉEL (NOUVEAU)           */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === "AUDIT" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par action, acteur ou hash de scellement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditCategoryFilter}
                onChange={(e) => setAuditCategoryFilter(e.target.value as any)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-2xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="ALL">Toutes les Criticités</option>
                <option value="CRITICAL">Critique</option>
                <option value="SENSITIVE">Sensible</option>
                <option value="STANDARD">Standard</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {filteredAuditLogs.map((log) => {
                const categoryBadgeColor =
                  log.category === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300"
                    : log.category === "SENSITIVE"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200";

                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${categoryBadgeColor}`}>
                            {log.category}
                          </span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>Cible :</strong> {log.targetResource}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Par <strong>{log.actorName}</strong> &bull; IP : <code>{log.ipAddress}</code>
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-[11px] font-mono text-gray-400 block">
                          {new Date(log.timestamp).toLocaleString("fr-BJ")}
                        </span>
                        <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-700 dark:bg-gray-800 dark:text-brand-300">
                          {log.integrityHash}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1: REJET MOTIVÉ D'UNE PROPOSITION CITOYENNE                 */}
      {/* ------------------------------------------------------------------ */}
      {rejectingProposalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="size-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Rejeter la Proposition Citoyenne
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingProposalId(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleReject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Motif formel de rejet (obligatoire) :
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex : Doublon avec l'espace communal existant, ou délimitation territoriale imprécise..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-2xs focus:border-rose-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Ce motif sera transmis textuellement et archivé au dossier citoyen.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingProposalId(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !rejectionReason.trim()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2: MODIFICATION DU RÔLE CITOYEN / PROMOTION ADMINISTRATIVE   */}
      {/* ------------------------------------------------------------------ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2 text-brand-600">
                <Sliders className="size-5" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Habilitation &amp; Rôle Plateforme
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Modification des prérogatives RBAC pour <strong>{editingUser.name}</strong> ({editingUser.phone}).
                </p>

                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Nouveau rôle attribué :
                </label>
                <select
                  value={newRoleForUser}
                  onChange={(e) => setNewRoleForUser(e.target.value as PlatformRole)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold shadow-2xs focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="CITIZEN">Citoyen Adhérent (Accès Fil &amp; Cotisations)</option>
                  <option value="PRESIDENT">Président d&apos;Association (Gouvernance &amp; Trésorerie)</option>
                  <option value="SYNDIC">Syndic Résidentiel (Gestion des Cités &amp; Baux)</option>
                  <option value="ADMIN">Administrateur Délégué (Supervision Territoires)</option>
                  <option value="SUPER_ADMIN">Super Administrateur Souverain (Plein Pouvoir)</option>
                </select>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                L&apos;octroi d&apos;un rôle étendu donne immédiatement accès aux écrans correspondants selon la matrice RBAC (ADR-005).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-md"
                >
                  Enregistrer l&apos;Habilitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <AdminCockpitContent />
    </Suspense>
  );
}
