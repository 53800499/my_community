"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  BuildingIcon,
  BedIcon,
  UsersIcon,
  BanknoteIcon,
  ArrowUpIcon,
} from "@/components/icons";
import { useDashboardMetrics } from "@/features/residences";

/**
 * Composant de présentation pur affichant les métriques synthétiques du tableau de bord (SOLID SRP/DIP)
 */
export const DashboardMetrics: React.FC = () => {
  const { metrics, isLoading } = useDashboardMetrics();

  const metricCards = [
    {
      id: "chambres",
      title: "Chambres Gérées",
      value: metrics.totalRooms.toString(),
      change: "+100%",
      isPositive: true,
      subtext: `Réparties sur ${metrics.buildingsCount} bâtiment${metrics.buildingsCount > 1 ? "s" : ""}`,
      icon: <BedIcon className="size-6 text-brand-600 dark:text-brand-400" />,
      iconBg: "bg-brand-50 dark:bg-brand-950/60",
    },
    {
      id: "occupation",
      title: "Taux d'Occupation Global",
      value: `${metrics.occupancyRate}%`,
      change: "+5.0%",
      isPositive: true,
      subtext: `${metrics.activeOccupations} chambre${metrics.activeOccupations > 1 ? "s" : ""} louée${metrics.activeOccupations > 1 ? "s" : ""}`,
      icon: <BuildingIcon className="size-6 text-emerald-600 dark:text-emerald-400" />,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
    },
    {
      id: "associations",
      title: "Associations Actives",
      value: metrics.totalAssociations.toString(),
      change: "+12%",
      isPositive: true,
      subtext: `${metrics.totalMembers} citoyens adhérents`,
      icon: <UsersIcon className="size-6 text-indigo-600 dark:text-indigo-400" />,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60",
    },
    {
      id: "finances",
      title: "Trésorerie & Cotisations",
      value: `${metrics.totalTreasury.toLocaleString("fr-FR")} F`,
      change: "+8.4%",
      isPositive: true,
      subtext: "Devise officielle FCFA (XOF)",
      icon: <BanknoteIcon className="size-6 text-amber-600 dark:text-amber-400" />,
      iconBg: "bg-amber-50 dark:bg-amber-950/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metricCards.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between">
            <div className={`flex size-12 items-center justify-center rounded-xl ${item.iconBg}`}>
              {item.icon}
            </div>
            <Badge
              variant="light"
              color={item.isPositive ? "success" : "error"}
              size="sm"
            >
              <ArrowUpIcon className="size-3.5" />
              {item.change}
            </Badge>
          </div>

          <div className="mt-4">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {item.title}
            </span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {isLoading ? "..." : item.value}
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? "Chargement DB..." : item.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
