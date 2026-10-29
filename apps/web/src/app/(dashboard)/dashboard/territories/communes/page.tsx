"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { GlobeIcon, SearchIcon, MapPinIcon, BuildingIcon } from "@/components/icons";
import { Select2 } from "@/components/ui/Select2";
import { apiService, ApiTerritory } from "@/lib/api";

export default function CommunesPage() {
  const [departments, setDepartments] = useState<ApiTerritory[]>([]);
  const [communes, setCommunes] = useState<ApiTerritory[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const depts = await apiService.territories.getDepartments();
      setDepartments(depts);
      const allCommunes = await apiService.territories.getCommunes();
      setCommunes(allCommunes);
    } catch (err) {
      console.error("Failed to load territories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCommunes = communes.filter((c) => {
    const matchesDept = selectedDeptId === "all" || c.parentId === selectedDeptId;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Les 77 Communes de la République du Bénin
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Découpage Territorial Officiel
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Nomenclature administrative complète, rattachement aux 12 départements et couverture territoriale My Community.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Communes</span>
          <p className="mt-1 text-2xl font-black text-gray-900 dark:text-white">{communes.length || 77}</p>
          <span className="text-[11px] text-gray-400">100% du territoire national</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Départements</span>
          <p className="mt-1 text-2xl font-black text-brand-600 dark:text-brand-400">12</p>
          <span className="text-[11px] text-gray-400">Préfectures de tutelle</span>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Communes Actives</span>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {communes.length || 77}
          </p>
          <span className="text-[11px] text-emerald-600/80">Communes répertoriées</span>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Découpage Territorial</span>
          <p className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">Officiel</p>
          <span className="text-[11px] text-indigo-600/80">République du Bénin</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
            Filtrer par Département :
          </label>
          <div className="w-full sm:w-auto sm:min-w-[240px]">
            <Select2
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full"
            >
              <option value="all">Tous les Départements (12)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </Select2>
          </div>
        </div>

        <div className="relative w-full sm:w-auto sm:min-w-[240px]">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une commune..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Communes Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : filteredCommunes.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">Aucune commune trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCommunes.map((commune) => {
            const parentDept = departments.find((d) => d.id === commune.parentId);
            return (
              <div
                key={commune.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition hover:border-brand-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      {parentDept?.name || "Bénin"}
                    </span>
                    <Badge variant="light" color="light" size="sm">
                      {commune.code}
                    </Badge>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                    {commune.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Arrondissement &amp; collectivité territoriale
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="size-3.5 text-brand-600" />
                    <span>Type : COMMUNE</span>
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
