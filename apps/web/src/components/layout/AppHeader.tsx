"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useActiveAssociation } from "@/context/AssociationContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import { BellIcon, SearchIcon, ChevronDownIcon, UsersIcon } from "@/components/icons";
import Badge from "@/components/ui/badge/Badge";
import { useAuth } from "@/features/auth";

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const {
    activeAssociation,
    activeAssociationId,
    setActiveAssociationId,
    userAssociations,
  } = useActiveAssociation();

  const userFullName = currentUser
    ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || currentUser.phoneNumber
    : "Mon Compte";
  const userInitials = currentUser?.firstName
    ? `${currentUser.firstName[0]}${currentUser.lastName?.[0] || ""}`.toUpperCase()
    : "MC";
  const userRoleDisplay = currentUser?.isSuperAdmin
    ? "Super Administrateur"
    : currentUser?.role || "Gestionnaire";
  const userEmailOrPhone = currentUser?.email || currentUser?.phoneNumber || "Non renseigné";

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isAssocMenuOpen, setIsAssocMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const assocMenuRef = useRef<HTMLDivElement>(null);

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth >= 768) {
          searchInputRef.current?.focus();
        } else {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
        }
      } else if (e.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileSearchOpen(false);
        setIsAssocMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        assocMenuRef.current &&
        !assocMenuRef.current.contains(e.target as Node)
      ) {
        setIsAssocMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 transition-colors">
      <div className="flex h-16 w-full items-center justify-between px-3 sm:px-6">
        {/* Left: Sidebar Toggle + Search */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleToggleSidebar}
            aria-label="Menu de navigation"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {isMobileOpen ? (
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop Search Input */}
          <div className="relative hidden md:block">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="size-4" />
            </span>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Rechercher une résidence, un bail, une association..."
              className="h-10 w-72 lg:w-96 rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-14 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-800 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 dark:focus:bg-gray-900"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-2.5 inline-flex h-5 select-none items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 shadow-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              Ctrl K
            </kbd>
          </div>

          {/* Mobile Search Button (< md) */}
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen((prev) => !prev);
              if (!isMobileSearchOpen) {
                setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
              }
            }}
            aria-label="Recherche mobile"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
          >
            <SearchIcon className="size-4" />
          </button>
        </div>

        {/* Right Controls: Active Association + Switch to Citoyen + Notifs + Theme + User */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Active Association Switcher */}
          {/* <div className="relative" ref={assocMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsAssocMenuOpen((prev) => !prev);
                setIsNotificationsOpen(false);
                setIsUserMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/80 px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition hover:bg-brand-100 dark:border-brand-800/60 dark:bg-brand-950/50 dark:text-brand-300 dark:hover:bg-brand-900/60"
              title="Changer d'association active"
            >
              <div className="flex size-6 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-[10px]">
                {activeAssociation?.acronym ? activeAssociation.acronym.slice(0, 3) : "AS"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[9px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider leading-none">
                  Association Active
                </span>
                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px] lg:max-w-[180px]">
                  {activeAssociation ? (activeAssociation.acronym || activeAssociation.name) : "Sélectionner..."}
                </span>
              </div>
              <ChevronDownIcon className="size-3.5 text-gray-500" />
            </button>

            {isAssocMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-gray-200 bg-white p-2.5 shadow-2xl dark:border-gray-800 dark:bg-gray-900 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-gray-100 pb-2 px-2 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Changer d&apos;association active</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Le module Résidences s&apos;aligne immédiatement sur l&apos;association choisie</p>
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                  {userAssociations.map((assoc) => {
                    const isActive = assoc.id === activeAssociationId;
                    return (
                      <button
                        key={assoc.id}
                        type="button"
                        onClick={() => {
                          setActiveAssociationId(assoc.id);
                          setIsAssocMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                          isActive
                            ? "bg-brand-600 text-white font-medium shadow-sm"
                            : "hover:bg-gray-100 text-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                            isActive ? "bg-white text-brand-700" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}>
                            {(assoc.acronym || assoc.name).slice(0, 2)}
                          </span>
                          <div className="truncate">
                            <p className="font-semibold truncate">{assoc.name}</p>
                            <p className={`text-[10px] truncate ${isActive ? "text-brand-100" : "text-gray-400"}`}>
                              {assoc.territory || "Bénin"}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div> */}

          {/* Switch to Espace Citoyen */}
          <Link
            href="/feed"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300 dark:hover:bg-brand-900/50"
          >
            <UsersIcon className="size-4" />
            <span className="hidden md:inline">Espace </span>Citoyen
          </Link>

          {/* Theme Toggle */}
          <ThemeToggleButton />

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsUserMenuOpen(false);
              }}
              aria-label="Notifications"
              className="relative inline-flex size-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <BellIcon className="size-5" />
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                3
              </span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:w-96 sm:max-w-none z-50">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications de gestion</h4>
                  <Badge variant="light" color="primary" size="sm">3 récentes</Badge>
                </div>
                <ul className="divide-y divide-gray-100 text-xs dark:divide-gray-800 max-h-72 overflow-y-auto">
                  <li className="py-2.5">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      Bail signé : Quartier Bidossessi, Bâtiment B
                    </p>
                    <span className="text-gray-500 dark:text-gray-400">Il y a 14 minutes • Chambre 204</span>
                  </li>
                  <li className="py-2.5">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      Paiement de cotisation reçu : Ass. Des Jeunes d&apos;Abomey-Calavi
                    </p>
                    <span className="text-gray-500 dark:text-gray-400">Il y a 1 heure • 25 000 FCFA</span>
                  </li>
                  <li className="py-2.5">
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      Chambre libérée : Résidence Universitaire UAC
                    </p>
                    <span className="text-gray-500 dark:text-gray-400">Hier • Chambre 108</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl p-1 text-left transition hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-semibold text-white shadow-xs">
                {userInitials}
              </div>
              <div className="hidden text-left xl:block">
                <span className="block text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {userFullName}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {userRoleDisplay}
                </span>
              </div>
              <ChevronDownIcon className="hidden size-3.5 text-gray-400 xl:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50">
                <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{userFullName}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{userEmailOrPhone}</p>
                </div>
                <div className="py-1 text-xs text-gray-700 dark:text-gray-300">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Mon Profil &amp; Habilitations
                  </Link>
                  <Link
                    href="/dashboard/residences"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Mes Résidences &amp; Baux
                  </Link>
                  <Link
                    href="/feed"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Basculer vers Espace Citoyen
                  </Link>
                </div>
                <div className="border-t border-gray-100 pt-1 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      router.push("/login");
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
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
        <div className="border-t border-gray-100 bg-gray-50/90 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/90 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="size-4" />
            </span>
            <input
              ref={mobileSearchInputRef}
              type="search"
              placeholder="Rechercher une résidence, un bail, une association..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              aria-label="Fermer la recherche"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
