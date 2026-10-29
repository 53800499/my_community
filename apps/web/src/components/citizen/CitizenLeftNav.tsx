"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquareIcon,
  UsersIcon,
  GlobeIcon,
  BuildingIcon,
  BanknoteIcon,
  MapPinIcon,
} from "@/components/icons";
import Badge from "@/components/ui/badge/Badge";
import { useMyMemberships } from "@/features/communities";
import { useAuth } from "@/features/auth";

interface CitizenLeftNavProps {
  activeQuarter: string;
}

export const CitizenLeftNav: React.FC<CitizenLeftNavProps> = ({ activeQuarter }) => {
  const pathname = usePathname();
  const { memberships: myMemberships } = useMyMemberships();
  const { currentUser } = useAuth();

  const userFullName = currentUser
    ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || currentUser.phoneNumber
    : "Citoyen Béninois";
  const userInitials = currentUser?.firstName
    ? `${currentUser.firstName[0]}${currentUser.lastName?.[0] || ""}`.toUpperCase()
    : "CB";

  const navLinks = [
    {
      name: "Fil d'Actualité",
      path: "/feed",
      icon: <MessageSquareIcon className="size-4" />,
    },
    {
      name: "Mes Communautés",
      path: "/communities",
      icon: <UsersIcon className="size-4" />,
      badge: myMemberships.length > 0 ? String(myMemberships.length) : undefined,
    },
    {
      name: "Agenda & Événements",
      path: "/events",
      icon: <GlobeIcon className="size-4" />,
      badge: "Samedi",
    },
    {
      name: "Mes Baux & Résidence",
      path: "/dashboard/residences",
      icon: <BuildingIcon className="size-4" />,
      badge: "Baux",
    },
    {
      name: "Cotisations & Trésorerie",
      path: "/dashboard/finance",
      icon: <BanknoteIcon className="size-4" />,
      badge: "XOF",
    },
  ];

  return (
    <div className="sticky top-20 space-y-4">
      {/* Citizen Mini Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-bold text-white shadow-xs">
            {userInitials}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              {userFullName}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <MapPinIcon className="size-3 text-rose-500" />
              <span>{activeQuarter}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-800">
          <Badge variant="light" color="success" size="sm">
            NPI Citoyen Validé
          </Badge>
          <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
            Adhérent Actif
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <nav className="space-y-1 text-xs font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 font-bold dark:bg-brand-950/60 dark:text-brand-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-500"}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <Badge
                    variant="light"
                    color={isActive ? "primary" : "light"}
                    size="sm"
                  >
                    {link.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Pinned Communities */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Mes Groupes Épinglés
          </span>
          <Link href="/communities" className="text-[11px] font-bold text-brand-600 hover:underline">
            Gérer
          </Link>
        </div>

        <ul className="mt-2.5 space-y-1.5 text-xs">
          {myMemberships.slice(0, 4).map((m) => (
            <li key={m.id}>
              <Link
                href="/communities"
                className="flex items-center justify-between rounded-xl p-2 transition hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">
                  {m.communityName || "Espace Citoyen"}
                </span>
                <Badge
                  variant="light"
                  color={m.roles?.includes("MANAGER") ? "primary" : "success"}
                  size="sm"
                >
                  {m.roles?.includes("MANAGER") ? "Gestionnaire" : "Membre"}
                </Badge>
              </Link>
            </li>
          ))}
          {myMemberships.length === 0 && (
            <li className="p-2 text-xs text-gray-400 italic">
              Aucun espace rattaché pour le moment.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CitizenLeftNav;
