"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/features/auth";
import { usePermissions } from "@/features/auth";
import { useActiveAssociation } from "@/context/AssociationContext";
import { useToast } from "@/features/errors";
import { apiClient } from "@/lib/api-client";
import {
  User,
  ShieldCheck,
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ExternalLink,
  Save,
  AlertCircle,
  FileText,
} from "lucide-react";

interface UserProfileData {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarKey?: string | null;
  bio?: string | null;
  city?: string | null;
  createdAt?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const {
    role,
    isSuperAdmin,
    isAdmin,
    isPresident,
    isSyndic,
    isCitizen,
    isExecutive,
    can,
  } = usePermissions();
  const { associations, userAssociations, activeAssociation, setActiveAssociationId } =
    useActiveAssociation();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<"info" | "permissions" | "communities" | "security">("info");
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("Abomey-Calavi");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

  // Load real profile from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      setIsLoadingProfile(true);
      try {
        const data = await apiClient.fetch<UserProfileData>("users/me");
        if (isMounted && data) {
          setProfile(data);
          setFirstName(data.firstName || user?.firstName || "");
          setLastName(data.lastName || user?.lastName || "");
          setCity(data.city || "Abomey-Calavi");
          setBio(data.bio || "");
        }
      } catch {
        // Fallback to session user data
        if (isMounted && user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
        }
      } finally {
        if (isMounted) {
          if (user?.email) setEmail(user.email);
          setIsLoadingProfile(false);
        }
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await apiClient.fetch<UserProfileData>("users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          city: city.trim(),
          bio: bio.trim(),
        }),
      });

      setProfile(updated);

      // Met à jour la session locale pour synchroniser navbar et composants
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("mc_current_user");
        if (raw) {
          try {
            const current = JSON.parse(raw);
            const enriched = {
              ...current,
              firstName: updated.firstName || firstName,
              lastName: updated.lastName || lastName,
            };
            localStorage.setItem("mc_current_user", JSON.stringify(enriched));
          } catch {
            // ignore
          }
        }
      }

      showSuccess("Votre profil citoyen a été mis à jour avec succès !", "Profil actualisé");
    } catch (err) {
      showError(err, "Impossible de mettre à jour votre profil");
    } finally {
      setIsSaving(false);
    }
  };

  const copyUserId = () => {
    const idToCopy = user?.id || profile?.userId || "";
    if (idToCopy && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(idToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Initials computation
  const initials = useMemo(() => {
    const f = firstName || user?.firstName || "";
    const l = lastName || user?.lastName || "";
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f.slice(0, 2).toUpperCase();
    if (user?.phoneNumber) return user.phoneNumber.slice(-2);
    return "MC";
  }, [firstName, lastName, user]);

  const fullNameDisplay = useMemo(() => {
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    if (profile?.fullName) return profile.fullName;
    return "Citoyen My Community";
  }, [firstName, lastName, profile]);

  // Label and Badge color for platform role
  const roleMetadata = useMemo(() => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          title: "Super Administrateur Plateforme",
          variant: "primary" as const,
          description: "Contrôle global du système, audit et gestion territoriale",
        };
      case "ADMIN":
        return {
          title: "Administrateur Système",
          variant: "primary" as const,
          description: "Supervision des résidences, associations et modération",
        };
      case "PRESIDENT":
        return {
          title: "Président d'Association",
          variant: "success" as const,
          description: "Direction du bureau exécutif, mandats et trésorerie associative",
        };
      case "SYNDIC":
        return {
          title: "Syndic Gestionnaire Résidentiel",
          variant: "info" as const,
          description: "Gestion des campus, résidences universitaires et baux locatifs",
        };
      default:
        return {
          title: "Membre Citoyen Adhérent",
          variant: "light" as const,
          description: "Accès au fil citoyen, adhésions et cotisations participatives",
        };
    }
  }, [role]);

  // All RBAC Permissions mapped with explanations
  const permissionsList = useMemo(() => {
    return [
      {
        code: "FEED_PUBLISH",
        label: "Publication sur le Fil Citoyen",
        description: "Partager des annonces citoyennes, propositions et actualités locales",
        granted: can("FEED_PUBLISH"),
      },
      {
        code: "FEED_COMMENT",
        label: "Participation aux Débats & Commentaires",
        description: "Commenter les publications et débattre avec la communauté",
        granted: can("FEED_COMMENT"),
      },
      {
        code: "FEED_REACT",
        label: "Réactions & Votes Citoyens",
        description: "Exprimer son soutien et voter sur les initiatives locales",
        granted: can("FEED_REACT"),
      },
      {
        code: "COMMUNITY_PROPOSE",
        label: "Proposition de Nouveaux Espaces / Tiers-lieux",
        description: "Soumettre une initiative pour créer une nouvelle communauté",
        granted: can("COMMUNITY_PROPOSE"),
      },
      {
        code: "COMMUNITY_JOIN",
        label: "Adhésion aux Associations & Résidences",
        description: "Rejoindre librement des communautés et payer ses cotisations",
        granted: can("COMMUNITY_JOIN"),
      },
      {
        code: "ASSOCIATION_VIEW",
        label: "Consultation de l'Annuaire Associatif",
        description: "Explorer les associations, organigrammes et bureaux publics",
        granted: can("ASSOCIATION_VIEW"),
      },
      {
        code: "ASSOCIATION_VIEW_SECRETS",
        label: "Secrets & Décrets du Bureau Exécutif",
        description: "Accès aux mandats dirigeants, conventions d'intégration et délibérations internes",
        granted: can("ASSOCIATION_VIEW_SECRETS"),
      },
      {
        code: "ASSOCIATION_MANAGE_FINANCE",
        label: "Ordonnancement de Trésorerie & Dépenses",
        description: "Gestion des factures, grand livre comptable et baux solidaires d'association",
        granted: can("ASSOCIATION_MANAGE_FINANCE"),
      },
      {
        code: "RESIDENCE_MANAGE_ROOMS",
        label: "Attribution des Chambres & Baux Résidentiels",
        description: "Affecter des logements étudiants et gérer les contrats locatifs",
        granted: can("RESIDENCE_MANAGE_ROOMS"),
      },
      {
        code: "COMMUNITY_REVIEW",
        label: "Validation & Modération des Propositions",
        description: "Approuver ou rejeter les nouvelles communautés citoyennes soumises",
        granted: can("COMMUNITY_REVIEW"),
      },
      {
        code: "TERRITORIES_MANAGE",
        label: "Administration du Référentiel des Territoires",
        description: "Gérer la nomenclature officielle des 12 départements et 77 communes du Bénin",
        granted: can("TERRITORIES_MANAGE"),
      },
      {
        code: "AUDIT_VIEW",
        label: "Journal d'Audit & Sécurité Système",
        description: "Surveiller les opérations de sécurité et les mutations critiques",
        granted: can("AUDIT_VIEW"),
      },
    ];
  }, [can]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* En-tête de la page */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Mon Compte &amp; Profil Citoyen
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Détails de votre compte connecté, habilitations de gouvernance et coordonnées citoyennes certifiées.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/50"
        >
          <LogOut className="size-4" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Profil Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-500/10 blur-2xl dark:bg-brand-500/20" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar avec initiales */}
          <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-700 to-indigo-800 text-3xl font-black text-white shadow-md">
            {initials}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {fullNameDisplay}
              </h2>
              <Badge variant="light" color="success" size="sm">
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Identité Vérifiée Bénin (OTP)
                </span>
              </Badge>
              {isExecutive && (
                <Badge variant="light" color="warning" size="sm">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck className="size-3.5 text-amber-600" />
                    Bureau Exécutif
                  </span>
                </Badge>
              )}
            </div>

            <p className="text-xs font-medium text-brand-700 dark:text-brand-300">
              {roleMetadata.title} • {roleMetadata.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5 text-gray-400" />
                <strong className="text-gray-700 dark:text-gray-300">{user?.phoneNumber || "+229 -- -- -- --"}</strong>
              </span>

              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5 text-gray-400" />
                  <span>{email}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-gray-400" />
                <span>{city || "Bénin"}</span>
              </span>
            </div>

            {/* Identifiant Citoyen UUID */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">ID Citoyen :</span>
              <code className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-mono font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {user?.id || profile?.userId || "d3b07384-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
              </code>
              <button
                type="button"
                onClick={copyUserId}
                title="Copier mon identifiant citoyen"
                className="inline-flex items-center gap-1 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {copiedId ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par Onglets */}
      <div className="flex border-b border-gray-200 overflow-x-auto dark:border-gray-800">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === "info"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <User className="size-4" />
          <span>Informations Personnelles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("permissions")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === "permissions"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>Mes Habilitations &amp; Permissions</span>
          <span className="rounded-full bg-brand-100 px-1.5 py-0.2 text-[10px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {permissionsList.filter((p) => p.granted).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("communities")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === "communities"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <Users className="size-4" />
          <span>Mes Communautés</span>
          {userAssociations.length > 0 && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.2 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {userAssociations.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === "security"
              ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <KeyRound className="size-4" />
          <span>Sécurité &amp; Sessions</span>
        </button>
      </div>

      {/* Onglet 1 : Informations Personnelles & Coordonnées */}
      {activeTab === "info" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Coordonnées &amp; Présentation Citoyenne
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ces informations sont enregistrées dans votre dossier citoyen et figurent sur vos baux et reçus de cotisations.
              </p>
            </div>
            {isLoadingProfile && (
              <span className="text-xs text-brand-600 animate-pulse">Chargement...</span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Alice"
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Nom de famille *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: Bio"
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Téléphone Mobile Certifié (MTN MoMo / Moov Money)
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="tel"
                    readOnly
                    value={user?.phoneNumber || "+229 -- -- -- --"}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-100/70 px-3.5 text-xs font-medium text-gray-600 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400"
                  />
                  <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Certifié
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Le numéro de téléphone est verrouillé pour des raisons de sécurité juridique et financière.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Ville / Commune de Résidence Principale
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
                >
                  <option value="Abomey-Calavi">Abomey-Calavi (Atlantique)</option>
                  <option value="Cotonou">Cotonou (Littoral)</option>
                  <option value="Porto-Novo">Porto-Novo (Ouémé)</option>
                  <option value="Parakou">Parakou (Borgou)</option>
                  <option value="Ouidah">Ouidah (Atlantique)</option>
                  <option value="Bohicon">Bohicon (Zou)</option>
                  <option value="Abomey">Abomey (Zou)</option>
                  <option value="Natitingou">Natitingou (Atacora)</option>
                  <option value="Djougou">Djougou (Donga)</option>
                  <option value="Kandi">Kandi (Alibori)</option>
                  <option value="Lokossa">Lokossa (Mono)</option>
                  <option value="Allada">Allada (Atlantique)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Adresse Email de notification
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citoyen@example.com"
                className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Biographie / Présentation citoyenne
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Présentez vos engagements de quartier, votre cursus étudiant ou vos activités associatives..."
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Enregistrer mon profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onglet 2 : Habilitations & Permissions RBAC */}
      {activeTab === "permissions" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Matrice des Droits &amp; Habilitations Actives
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contrôle d&apos;accès basé sur les rôles (RBAC) conforme aux principes SOLID de sécurité.
              </p>
            </div>
            <Badge variant="light" color={roleMetadata.variant} size="sm">
              Rôle : {role}
            </Badge>
          </div>

          <div className="mt-6 divide-y divide-gray-100 dark:divide-gray-800">
            {permissionsList.map((item) => (
              <div
                key={item.code}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {item.label}
                    </span>
                    <code className="text-[10px] text-gray-400 font-mono">
                      {item.code}
                    </code>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-auto">
                  {item.granted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <Check className="size-3.5" />
                      <span>Autorisé</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      <Lock className="size-3" />
                      <span>Verrouillé</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 3 : Mes Communautés & Engagements */}
      {activeTab === "communities" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Associations &amp; Espaces de Vie Rejoints
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Vos adhésions citoyennes et vos éventuels mandats au sein des bureaux exécutifs.
              </p>
            </div>

            <Link
              href="/dashboard/associations"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
            >
              <span>Découvrir d&apos;autres associations</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(userAssociations.length > 0 ? userAssociations : associations.slice(0, 4)).map(
              (assoc) => {
                const isSelected = activeAssociation?.id === assoc.id;
                return (
                  <div
                    key={assoc.id}
                    className={`rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/30 dark:border-brand-600 dark:bg-brand-950/20"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-800/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 text-xs font-black text-white shadow-xs">
                          {(assoc.acronym || assoc.name).slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 dark:text-white">
                            {assoc.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {assoc.territory || "Bénin"}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Badge variant="light" color="primary" size="sm">
                          Active
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-700/60">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {isExecutive ? "Membre Exécutif" : "Adhérent Actif"}
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveAssociationId(assoc.id)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        {isSelected ? "Sélectionnée" : "Définir comme active"}
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Onglet 4 : Sécurité & Sessions */}
      {activeTab === "security" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:p-8 space-y-6">
          <div className="pb-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Sécurité du Compte &amp; Paramètres Cryptographiques
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Paramètres d&apos;authentification renforcée et gestion des jetons de session.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Authentification Forte Téléphonique
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Vérification par code OTP mobile compatible avec tous les réseaux du Bénin.
                  </p>
                </div>
                <Badge variant="light" color="success" size="sm">
                  Active
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Chiffrement des Mots de Passe
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Algorithme Argon2id / Bcrypt avec sel cryptographique fort.
                  </p>
                </div>
                <Badge variant="light" color="info" size="sm">
                  Sécurisé
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Durée de Validité de Session (JWT)
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    7 jours d&apos;activité continue avec renouvellement automatique.
                  </p>
                </div>
                <Badge variant="light" color="primary" size="sm">
                  7 Jours
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-red-700"
            >
              <LogOut className="size-4" />
              <span>Fermer la session sur cet appareil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
