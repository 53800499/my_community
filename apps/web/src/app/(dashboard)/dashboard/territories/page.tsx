"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import { GlobeIcon, BuildingIcon, UsersIcon, SearchIcon, MapPinIcon } from "@/components/icons";
import { CheckCircle2, X } from "lucide-react";
import { apiService, ApiTerritory } from "@/lib/api";

interface DepartmentData {
  id: string;
  code: string;
  name: string;
  prefecture: string;
  communesCount: number;
  residencesCount: number;
  associationsCount: number;
}

export default function TerritoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roots, setRoots] = useState<ApiTerritory[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDeptForCommunes, setSelectedDeptForCommunes] = useState<DepartmentData | null>(null);
  const [liveDeptCommunes, setLiveDeptCommunes] = useState<string[]>([]);

  useEffect(() => {
    if (selectedDeptForCommunes) {
      apiService.territories.getChildren(selectedDeptForCommunes.id).then((children) => {
        if (children && children.length > 0) {
          setLiveDeptCommunes(children.map((c) => c.name));
        } else {
          setLiveDeptCommunes([]);
        }
      });
    }
  }, [selectedDeptForCommunes]);

  useEffect(() => {
    apiService.territories.getRoots().then((res) => {
      setRoots(res);
    });
    apiService.territories.getDepartments().then((depts) => {
      if (depts && depts.length > 0) {
        setDepartments(
          depts.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            prefecture: d.prefecture || "Chef-lieu",
            communesCount: d.communesCount || 0,
            residencesCount: d.residencesCount || 0,
            associationsCount: d.associationsCount || 0,
          }))
        );
      } else {
        setDepartments([]);
      }
    });
  }, []);

  const filtered = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.prefecture.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Découpage Territorial &amp; Communes
            </h1>
            <Badge variant="light" color="primary" size="sm">
              République du Bénin
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Cartographie des 12 départements, 77 communes et répartition des logements citoyens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="solid" color="primary" size="md">
            12 Départements
          </Badge>
          <Badge variant="light" color="success" size="md">
            77 Communes
          </Badge>
        </div>
      </div>

      {/* Country Overview Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-indigo-50/50 p-4 dark:border-brand-900/60 dark:from-brand-950/40 dark:to-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <GlobeIcon className="size-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {roots[0]?.name || "République du Bénin"} (Code ISO: BEN)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Territoire racine actif • Monnaie légale : Franc CFA (XOF)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-1.5">
            <BuildingIcon className="size-4 text-brand-600 dark:text-brand-400" />
            <span>1 428 Chambres Gérées</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span>42 Associations Partenaires</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <SearchIcon className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher département ou préfecture..."
            className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-8 pr-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dept) => (
          <div
            key={dept.code}
            className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                  [{dept.code}]
                </span>
                <Badge variant="light" color="light" size="sm">
                  {dept.communesCount} communes
                </Badge>
              </div>

              <h3 className="mt-2 text-base font-bold text-gray-900 dark:text-white">
                {dept.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chef-lieu / Préfecture : <span className="font-semibold text-gray-700 dark:text-gray-300">{dept.prefecture}</span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800/50">
                  <span className="block text-[10px] text-gray-400">Chambres / Baux</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {dept.residencesCount}
                  </span>
                </div>
                <div className="rounded-xl bg-gray-50 p-2.5 dark:bg-gray-800/50">
                  <span className="block text-[10px] text-gray-400">Associations</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {dept.associationsCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="size-3.5" />
                <span>Territoire actif</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedDeptForCommunes(dept)}
                className="text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
              >
                Explorer communes &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Communes Details */}
      {selectedDeptForCommunes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-5 text-brand-600" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Communes du Département : {selectedDeptForCommunes.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDeptForCommunes(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Subdivisions administratives de rang 2 couvertes par la plateforme citoyenne My Community.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {liveDeptCommunes.length > 0 ? (
                liveDeptCommunes.map((commune, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 text-xs font-semibold text-gray-800 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-200"
                  >
                    <span className="text-brand-600 mr-1.5">•</span>
                    <span>{commune}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-6 text-center text-xs text-gray-500">
                  Aucune commune enregistrée pour ce département.
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDeptForCommunes(null)}
                className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
