"use client";

import React, { useState, useEffect } from "react";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import RecentLeasesTable from "@/components/dashboard/RecentLeasesTable";
import AssignRoomOccupationModal from "@/components/dashboard/AssignRoomOccupationModal";
import Badge from "@/components/ui/badge/Badge";
import { BuildingIcon, PlusIcon, UsersIcon } from "@/components/icons";
import { apiService, ApiQuarter, ApiRoom, ApiOccupation } from "@/lib/api";

export default function DashboardPage() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [quarters, setQuarters] = useState<ApiQuarter[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [occupations, setOccupations] = useState<ApiOccupation[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiService.residences.getQuarters(),
      apiService.residences.getRooms(),
      apiService.residences.getOccupations(),
    ]).then(([qList, rList, oList]) => {
      if (!isMounted) return;
      setQuarters(qList);
      setRooms(rList);
      setOccupations(oList);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalRooms = rooms.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-700 via-indigo-700 to-indigo-900 p-6 text-white shadow-xl dark:border-brand-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Système Territorial &amp; Résidentiel du Bénin</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Tableau de Bord Gestionnaire
            </h1>
            <p className="max-w-2xl text-xs text-white/80 sm:text-sm">
              Supervision unifiée des résidences, affectations des baux, trésorerie associative et coordination territoriale.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-800 shadow-md transition hover:bg-brand-50"
            >
              <PlusIcon className="size-4" />
              <span>Attribuer une Chambre</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute right-32 -bottom-24 size-48 rounded-full bg-brand-400/10 blur-xl" />
      </div>

      {/* KPI Metrics row */}
      <DashboardMetrics />

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Leases Table */}
        <div className="lg:col-span-2">
          <RecentLeasesTable onOpenAssignModal={() => setIsAssignModalOpen(true)} />
        </div>

        {/* Right Col: Territorial Breakdown & Action Center */}
        <div className="space-y-6">
          {/* Territorial Distribution Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <BuildingIcon className="size-4 text-brand-600 dark:text-brand-400" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Répartition Territoriale
                </h4>
              </div>
              <Badge variant="light" color="primary" size="sm">
                Bénin • En Direct
              </Badge>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {quarters.length === 0 ? (
                <div>
                  <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300">
                    <span>Abomey-Calavi (Campus &amp; Résidences)</span>
                    <span className="font-bold">{totalRooms} chambres</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-brand-600" style={{ width: "100%" }} />
                  </div>
                </div>
              ) : (
                quarters.map((q, idx) => {
                  const colors = ["bg-brand-600", "bg-indigo-600", "bg-emerald-600", "bg-amber-500"];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={q.id}>
                      <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300">
                        <span>{q.name} ({q.city})</span>
                        <span className="font-bold">Zone Active</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(30, 100 / (idx + 1))}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Alertes & Échéances Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-rose-600 dark:text-rose-400" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Baux &amp; Contrats en Cours
                </h4>
              </div>
              <Badge variant="light" color={occupations.length > 0 ? "success" : "light"} size="sm">
                {occupations.filter((o) => o.isActive).length} actif(s)
              </Badge>
            </div>

            <ul className="mt-3 divide-y divide-gray-100 text-xs dark:divide-gray-800">
              {occupations.slice(0, 3).map((occ) => {
                const room = rooms.find((r) => r.id === occ.roomId);
                return (
                  <li key={occ.id} className="py-2.5">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {room?.roomNumber || "Chambre"} • Statut : {occ.isActive ? "Actif" : "Terminé"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Titulaire : {occ.occupantName || "Résident"} • Jusqu&apos;au {occ.endDate ? new Date(occ.endDate).toLocaleDateString("fr-FR") : "31/08/2027"}
                    </p>
                  </li>
                );
              })}
              {occupations.length === 0 && (
                <li className="py-2.5 text-gray-400">Aucun bail enregistré.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for Assigning Room Occupation */}
      <AssignRoomOccupationModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
    </div>
  );
}
