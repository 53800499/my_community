"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useActiveAssociation } from "@/context/AssociationContext";
import { usePermissions } from "@/features/auth";
import {
  GridIcon,
  BuildingIcon,
  UsersIcon,
  BanknoteIcon,
  GlobeIcon,
  ChevronDownIcon,
} from "@/components/icons";
import Badge from "@/components/ui/badge/Badge";
import { Check, Search, Globe2, ChevronDown, Lock, Compass, ShieldCheck } from "lucide-react";

type NavSubItem = {
  name: string;
  path: string;
  executiveOnly?: boolean;
  adminOnly?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  executiveOnly?: boolean;
  adminOnly?: boolean;
  subItems?: NavSubItem[];
};

const navigationGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "VUE GÉNÉRALE",
    items: [
      {
        name: "Tableau de Bord",
        icon: <GridIcon className="size-5" />,
        path: "/dashboard",
      },
    ],
  },
  {
    title: "VIE ASSOCIATIVE",
    items: [
      {
        name: "Associations & Bureaux",
        icon: <UsersIcon className="size-5" />,
        path: "/dashboard/associations",
        subItems: [
          { name: "Annuaire des Associations", path: "/dashboard/associations" },
          { name: "Règles & Mandats Dirigeants", path: "/dashboard/associations/governance", executiveOnly: true },
          { name: "Conventions d'Intégration", path: "/dashboard/associations/contracts", executiveOnly: true },
          { name: "Organigramme & Postes", path: "/dashboard/associations/bureau" },
          { name: "Habilitations & Droits", path: "/dashboard/associations/permissions", executiveOnly: true },
          { name: "Communiqués & Annonces", path: "/dashboard/associations/posts" },
          { name: "Adhésions & Membres", path: "/dashboard/associations/members" },
        ],
      },
      {
        name: "Résidences & Chambres",
        icon: <BuildingIcon className="size-5" />,
        path: "/dashboard/residences",
        badge: "Logements",
        subItems: [
          { name: "Quartiers & Campus", path: "/dashboard/residences" },
          { name: "Règles & Délégués Résidents", path: "/dashboard/residences/governance", executiveOnly: true },
          { name: "Conventions Bailleurs", path: "/dashboard/residences/contracts", executiveOnly: true },
          { name: "Chambres & Disponibilités", path: "/dashboard/residences/rooms" },
          { name: "Attribution des Baux", path: "/dashboard/residences/occupations", executiveOnly: true },
          { name: "Résidents & Contrats", path: "/dashboard/residences/residents" },
        ],
      },
      {
        name: "Trésorerie & Transactions",
        icon: <BanknoteIcon className="size-5" />,
        path: "/dashboard/finance",
        badge: "XOF",
        subItems: [
          { name: "Tableau de Bord Trésorerie", path: "/dashboard/finance" },
          { name: "Journal des Transactions", path: "/dashboard/finance?tab=ledger", executiveOnly: true },
          { name: "Cotisations des Membres", path: "/dashboard/finance?tab=cotisations" },
          { name: "Dépenses & Factures", path: "/dashboard/finance?tab=expenses", executiveOnly: true },
          { name: "Dons & Mécénat Citoyen", path: "/dashboard/finance?tab=donations" },
          { name: "Frais d'Adhésion & Dues", path: "/dashboard/finance?tab=integration" },
          { name: "Baux & Loyers d'Association", path: "/dashboard/finance?tab=leases", executiveOnly: true },
        ],
      },
    ],
  },
  {
    title: "TERRITOIRES DU BÉNIN",
    items: [
      {
        name: "Espaces Communautaires",
        icon: <Compass className="size-5" />,
        path: "/dashboard/communities",
        badge: "Citoyen",
        subItems: [
          { name: "Supervision des Espaces", path: "/dashboard/communities" },
          { name: "Instruction des Propositions", path: "/dashboard/communities?tab=proposals", adminOnly: true },
          { name: "Modération & Rôles", path: "/dashboard/communities?tab=moderation", executiveOnly: true },
        ],
      },
      {
        name: "Départements & Villes",
        icon: <GlobeIcon className="size-5" />,
        path: "/dashboard/territories",
        subItems: [
          { name: "Départements du Bénin", path: "/dashboard/territories" },
          { name: "Communes & Localités", path: "/dashboard/territories/communes" },
        ],
      },
    ],
  },
  {
    title: "ADMINISTRATION SYSTÈME",
    items: [
      {
        name: "Tour de Contrôle Plateforme",
        icon: <ShieldCheck className="size-5 text-amber-500" />,
        path: "/dashboard/admin",
        badge: "Super-Admin",
        adminOnly: true,
      },
    ],
  },
];

const AppSidebarContent: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const { isExecutive, isAdmin } = usePermissions();

  const {
    isExpanded,
    isMobileOpen,
    isMobile,
    closeMobileSidebar,
    openSubmenu,
    toggleSubmenu,
    setIsHovered,
  } = useSidebar();

  const {
    associations,
    userAssociations,
    activeAssociationId,
    activeAssociation,
    setActiveAssociationId,
  } = useActiveAssociation();

  const [isAssocOpen, setIsAssocOpen] = useState(false);
  const [assocSearch, setAssocSearch] = useState("");
  const assocDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        assocDropdownRef.current &&
        !assocDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAssocOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter associations by search
  const filteredAssocs = (userAssociations.length > 0 ? userAssociations : associations).filter(
    (a) =>
      a.name.toLowerCase().includes(assocSearch.toLowerCase()) ||
      (a.acronym && a.acronym.toLowerCase().includes(assocSearch.toLowerCase()))
  );

  // Filtrage granulaire des menus selon les habilitations (SOLID: SRP & OCP)
  const filteredNavigationGroups = useMemo(() => {
    return navigationGroups
      .map((group) => {
        const items = group.items
          .filter((item) => (!item.executiveOnly || isExecutive) && (!item.adminOnly || isAdmin))
          .map((item) => {
            if (!item.subItems) return item;
            const subItems = item.subItems.filter(
              (sub) => (!sub.executiveOnly || isExecutive) && (!sub.adminOnly || isAdmin)
            );
            return { ...item, subItems };
          })
          .filter((item) => !item.subItems || item.subItems.length > 0);
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [isExecutive, isAdmin]);

  // Helper pour vérifier l'activation exacte de l'élément (chemin ou onglet ?tab=...)
  const isSubItemActive = (subPath: string) => {
    if (subPath.includes("?")) {
      const [pathPart, queryPart] = subPath.split("?");
      const targetTab = new URLSearchParams(queryPart).get("tab");
      return pathname === pathPart && currentTab === targetTab;
    }
    return pathname === subPath && (!currentTab || pathname !== "/dashboard/finance");
  };

  // On mobile drawer, always show text & items. On desktop, respect collapsed state.
  const showText = isMobile ? true : isExpanded;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 w-72 max-w-[85vw] ${
        isExpanded ? "lg:w-64" : "lg:w-20"
      } ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <Link
          href="/dashboard"
          onClick={closeMobileSidebar}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-brand-700 to-indigo-800 text-white shadow-md">
            <span className="font-bold text-lg tracking-wider">MC</span>
          </div>
          {showText && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white truncate">
                My Community
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
                Console Gestion
              </span>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={closeMobileSidebar}
          aria-label="Fermer le menu"
          className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Centralized Permanent Association Switcher (Un seul endroit visible pour toutes les pages) */}
      <div className="relative border-b border-gray-200/80 p-2.5 dark:border-gray-800" ref={assocDropdownRef}>
        {showText ? (
          <div>
            <div className="mb-1 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Communauté Active
              </span>
              {activeAssociation?.acronym && (
                <span className="rounded bg-brand-50 px-1 py-0.2 text-[9px] font-bold text-brand-700 dark:bg-brand-950/70 dark:text-brand-300">
                  {activeAssociation.acronym}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAssocOpen((prev) => !prev)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/70 p-2 text-left transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
              title="Changer d'association pour tout le dashboard"
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-700 text-[10px] font-bold text-white shadow-xs">
                  {activeAssociation?.acronym
                    ? activeAssociation.acronym.slice(0, 3)
                    : activeAssociationId === "ALL"
                    ? "ALL"
                    : "MC"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-gray-900 dark:text-white">
                    {activeAssociation
                      ? activeAssociation.name
                      : activeAssociationId === "ALL"
                      ? "Toutes les associations"
                      : "Sélectionner..."}
                  </p>
                  <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                    {activeAssociation?.territory || "Vue consolidée"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`size-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                  isAssocOpen ? "rotate-180 text-brand-600" : ""
                }`}
              />
            </button>
          </div>
        ) : (
          /* Mode sidebar repliée (icône compacte) */
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsAssocOpen((prev) => !prev)}
              className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300 shadow-xs"
              title={`Association active : ${activeAssociation?.name || "Toutes les associations"}`}
            >
              <span className="text-xs font-bold">
                {activeAssociation?.acronym
                  ? activeAssociation.acronym.slice(0, 2)
                  : "AS"}
              </span>
            </button>
          </div>
        )}

        {/* Dropdown Menu Flottant */}
        {isAssocOpen && (
          <div
            className={`absolute z-50 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-150 ${
              showText
                ? "left-2.5 right-2.5 top-full mt-1.5"
                : "left-full top-0 ml-2 w-64"
            }`}
          >
            {/* Champ de recherche rapide */}
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une association..."
                value={assocSearch}
                onChange={(e) => setAssocSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/70 py-1.5 pl-8 pr-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-white"
                autoFocus
              />
            </div>

            <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
              {/* Option 1 : Toutes les associations */}
              <button
                type="button"
                onClick={() => {
                  setActiveAssociationId("ALL");
                  setIsAssocOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                  activeAssociationId === "ALL"
                    ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-950/80 dark:text-brand-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <Globe2 className="size-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="truncate font-semibold">Toutes les associations</p>
                    <p className="truncate text-[10px] text-gray-400">Vue globale consolidée</p>
                  </div>
                </div>
                {activeAssociationId === "ALL" && (
                  <Check className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                )}
              </button>

              {/* Associations individuelles */}
              {filteredAssocs.map((assoc) => {
                const isActive = activeAssociationId === assoc.id;
                return (
                  <button
                    key={assoc.id}
                    type="button"
                    onClick={() => {
                      setActiveAssociationId(assoc.id);
                      setIsAssocOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                      isActive
                        ? "bg-brand-50 font-bold text-brand-700 dark:bg-brand-950/80 dark:text-brand-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                          isActive
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {(assoc.acronym || assoc.name).slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{assoc.name}</p>
                        <p className="truncate text-[10px] text-gray-400">
                          {assoc.acronym ? `${assoc.acronym} • ` : ""}
                          {assoc.territory || "Bénin"}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <Check className="size-4 shrink-0 text-brand-600 dark:text-brand-400" />
                    )}
                  </button>
                );
              })}

              {filteredAssocs.length === 0 && (
                <p className="py-3 text-center text-xs text-gray-400">
                  Aucune association trouvée
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {filteredNavigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {showText && (
              <p className="px-3 text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                {group.title}
              </p>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
              const isSubmenuOpen = openSubmenu === item.name;

              return (
                <div key={item.name} className="space-y-1">
                  {item.subItems ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.name)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className={`shrink-0 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>
                            {item.icon}
                          </span>
                          {showText && <span className="truncate">{item.name}</span>}
                        </div>
                        {showText && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.badge && (
                              <Badge variant="light" color="primary" size="sm">
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronDownIcon
                              className={`size-4 transition-transform duration-200 ${
                                isSubmenuOpen ? "rotate-180 text-brand-600" : "text-gray-400"
                              }`}
                            />
                          </div>
                        )}
                      </button>

                      {/* Sub-menu items */}
                      {showText && isSubmenuOpen && (
                        <div className="mt-1 ml-9 space-y-1 border-l-2 border-brand-200 pl-3 dark:border-brand-800">
                          {item.subItems.map((subItem) => {
                            const isSubActive = isSubItemActive(subItem.path);
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.path}
                                onClick={closeMobileSidebar}
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                                  isSubActive
                                    ? "text-brand-600 font-semibold bg-brand-50/60 dark:bg-brand-950/40 dark:text-brand-400"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                }`}
                              >
                                <span className="truncate">{subItem.name}</span>
                                {subItem.executiveOnly && (
                                  <span title="Réservé aux dirigeants" className="shrink-0 ml-1">
                                    <Lock className="size-3 text-amber-500/80" />
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={closeMobileSidebar}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`shrink-0 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-500 dark:text-gray-400"}`}>
                          {item.icon}
                        </span>
                        {showText && <span className="truncate">{item.name}</span>}
                      </div>
                      {showText && item.badge && (
                        <Badge variant="light" color="info" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Switcher Card */}
      {showText && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/70 to-indigo-50/40 p-3.5 dark:border-brand-900/50 dark:from-brand-950/40 dark:to-indigo-950/20">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold text-gray-900 dark:text-white">Plateforme Synchronisée</p>
            </div>
            <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
              Services connectés : baux, cotisations et adhésions.
            </p>
            <Link
              href="/feed"
              onClick={closeMobileSidebar}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
            >
              <span>Voir le Fil Citoyen</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
};

export const AppSidebar: React.FC = () => {
  return (
    <Suspense
      fallback={
        <aside className="fixed top-0 left-0 z-50 flex h-full w-20 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:w-64" />
      }
    >
      <AppSidebarContent />
    </Suspense>
  );
};

export default AppSidebar;
