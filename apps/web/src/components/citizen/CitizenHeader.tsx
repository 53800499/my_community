"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import {
  SearchIcon,
  BellIcon,
  BuildingIcon,
  ChevronDownIcon,
  MapPinIcon,
} from "@/components/icons";
import { Check } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/features/auth";
import { useToast } from "@/features/errors";

interface CitizenHeaderProps {
  activeQuarter: string;
  onQuarterChange: (quarter: string) => void;
}

export const CitizenHeader: React.FC<CitizenHeaderProps> = ({
  activeQuarter,
  onQuarterChange,
}) => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const userFullName = currentUser
    ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || currentUser.phoneNumber
    : "Mon Compte";
  const userInitials = currentUser?.firstName
    ? `${currentUser.firstName[0]}${currentUser.lastName?.[0] || ""}`.toUpperCase()
    : "MC";
  const userRoleDisplay = currentUser?.isSuperAdmin
    ? "Super Administrateur"
    : currentUser?.role || "Citoyen";
  const userEmailOrPhone = currentUser?.email || currentUser?.phoneNumber || "Citoyen Béninois";
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifs, setNotifs] = useState([
    { id: 1, title: "Journée de salubrité ce samedi", detail: "Quartier Bidossessi • Rendez-vous 07h30", read: false },
    { id: 2, title: "Maintenance réseau eau Campus UAC", detail: "Bâtiment Hibiscus • Demain 10h-14h", read: false },
  ]);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    showSuccess("Toutes les alertes ont été marquées comme lues.", "Alertes & Notifications");
  };

  const handleNotificationClick = (item: (typeof notifs)[0]) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    showInfo(`${item.title} — ${item.detail}`, "Alerte de proximité");
    setIsNotifOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      router.push("/feed");
      showInfo("Affichage de l'ensemble du fil d'actualité.", "Recherche");
    } else {
      router.push(`/feed?q=${encodeURIComponent(searchQuery.trim())}`);
      showInfo(`Filtrage des publications pour : "${searchQuery.trim()}"`, "Recherche citoyenne");
    }
    setIsMobileSearchOpen(false);
  };

  const locationRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const quarters = [
    { id: "calavi-bidossessi", name: "Bidossessi", city: "Abomey-Calavi", dept: "Atlantique" },
    { id: "calavi-uac", name: "Campus UAC", city: "Tankpè / Calavi", dept: "Atlantique" },
    { id: "cotonou-cadjehoun", name: "Cadjehoun", city: "Cotonou", dept: "Littoral" },
    { id: "godomey-centre", name: "Godomey Centre", city: "Abomey-Calavi", dept: "Atlantique" },
    { id: "parakou-centre", name: "Parakou Centre", city: "Parakou", dept: "Borgou" },
  ];

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setIsLocationMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLocationMenuOpen(false);
        setIsNotifOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex flex-col w-full border-b border-gray-200/90 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 transition-colors">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Left: Brand & Territorial Location Switcher */}
        <div className="flex items-center gap-2 sm:gap-4 truncate">
          <Link href="/feed" className="flex items-center gap-2 shrink-0">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-700 to-indigo-800 font-black text-white shadow-md shadow-brand-500/20">
              MC
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white">
                  My Community
                </span>
                <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" title="Bénin En Ligne" />
              </div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Espace Citoyen
              </span>
            </div>
          </Link>

          {/* Interactive Territorial Selector */}
          <div className="relative shrink-0" ref={locationRef}>
            <button
              type="button"
              onClick={() => {
                setIsLocationMenuOpen((prev) => !prev);
                setIsNotifOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/70 px-2.5 py-1.5 text-xs font-semibold text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <MapPinIcon className="size-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[110px] xs:max-w-[140px] sm:max-w-none">
                {activeQuarter}
              </span>
              <ChevronDownIcon className="size-3 text-gray-400 shrink-0" />
            </button>

            {isLocationMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50">
                <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Changer de localité
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Affiche le fil et les alertes du quartier
                  </p>
                </div>
                <div className="mt-1 space-y-1">
                  {quarters.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onQuarterChange(`${q.name} (${q.city})`);
                        setIsLocationMenuOpen(false);
                        showSuccess(`Territoire actif : ${q.name} (${q.city})`, "Localité Citoyenne");
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 active:scale-95 transition"
                    >
                      <div>
                        <p className="font-bold">{q.name}</p>
                        <span className="text-[10px] text-gray-400">
                          {q.city} • {q.dept}
                        </span>
                      </div>
                      {activeQuarter.includes(q.name) && (
                        <Check className="size-4 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block flex-1 max-w-md mx-2">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des voisins, alertes, entraides ou associations (Entrée pour valider)..."
            className="h-9 w-full rounded-2xl border border-gray-200 bg-gray-50/70 pl-8 pr-4 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:focus:bg-gray-900"
          />
        </form>

        {/* Right: Search Toggle (Mobile) + Console Switcher + Notifications + Theme + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen((prev) => !prev);
              if (!isMobileSearchOpen) {
                setTimeout(() => mobileSearchRef.current?.focus(), 100);
              }
            }}
            aria-label="Recherche mobile"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden active:scale-95"
          >
            <SearchIcon className="size-4" />
          </button>

          {/* Switch to Dashboard */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-indigo-50/50 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-2xs transition hover:bg-brand-100 dark:border-brand-800 dark:from-brand-950/40 dark:to-indigo-950/20 dark:text-brand-300 active:scale-95"
          >
            <BuildingIcon className="size-4" />
            <span className="hidden lg:inline">Console </span>Gestionnaire
          </Link>

          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotifOpen((prev) => !prev);
                setIsLocationMenuOpen(false);
                setIsUserMenuOpen(false);
              }}
              aria-label="Notifications Citoyennes"
              className="relative inline-flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 active:scale-95"
            >
              <BellIcon className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Alertes de Proximité
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-brand-600 hover:underline dark:text-brand-400 active:scale-95 transition"
                    >
                      Tout marquer comme lu
                    </button>
                  ) : (
                    <Badge variant="light" color="success" size="sm">À jour</Badge>
                  )}
                </div>
                <ul className="mt-2 divide-y divide-gray-100 text-xs dark:divide-gray-800 max-h-72 overflow-y-auto">
                  {notifs.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`py-2.5 px-2 rounded-xl cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                        !n.read ? "bg-brand-50/40 dark:bg-brand-950/20 font-semibold" : "opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 dark:text-white text-xs">{n.title}</p>
                        {!n.read && <span className="size-2 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">{n.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Citizen Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                setIsLocationMenuOpen(false);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-bold text-white shadow-xs">
                {userInitials}
              </div>
              <ChevronDownIcon className="hidden size-3.5 text-gray-400 sm:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in">
                <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {userFullName}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">{userRoleDisplay} &bull; {userEmailOrPhone}</p>
                </div>
                <div className="py-1 text-xs text-gray-700 dark:text-gray-300">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Mon Compte Citoyen
                  </Link>
                  <Link
                    href="/communities"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Mes Communautés
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/40"
                  >
                    Aller à la Console Gestion
                  </Link>
                </div>
                <div className="border-t border-gray-100 pt-1 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      showInfo("Vous avez été déconnecté avec succès.", "Session fermée");
                      router.push("/login");
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 active:scale-95 transition"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {isMobileSearchOpen && (
        <div className="border-t border-gray-100 bg-gray-50/90 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/90 md:hidden animate-in slide-in-from-top duration-150">
          <form onSubmit={handleSearchSubmit} className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="size-3.5" />
            </span>
            <input
              ref={mobileSearchRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des voisins, alertes, entraides..."
              className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-9 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Fermer la recherche"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </header>
  );
};

export default CitizenHeader;
