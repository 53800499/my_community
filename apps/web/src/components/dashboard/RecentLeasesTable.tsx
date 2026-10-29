"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { BedIcon, SearchIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { useConfirm } from "@/context/ConfirmationContext";
import { useRecentLeases, EnrichedLeaseRow } from "@/features/residences";

/**
 * Composant de présentation pur affichant le tableau des baux récents (SOLID SRP/DIP)
 */
export const RecentLeasesTable: React.FC<{
  onOpenAssignModal?: () => void;
}> = ({ onOpenAssignModal }) => {
  const { confirm } = useConfirm();
  const {
    leases,
    isLoading,
    filter,
    setFilter,
    terminatingId,
    terminateLease,
  } = useRecentLeases();

  const handleTerminate = async (item: EnrichedLeaseRow) => {
    const ok = await confirm({
      title: "Clôturer le contrat",
      message: "Voulez-vous libérer cette chambre et clôturer le contrat d'occupation ?",
      confirmText: "Libérer la chambre",
      cancelText: "Annuler",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await terminateLease(item.occupation.id, item.occupation.roomId);
    } catch (err) {
      console.error("Failed to terminate occupation:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
      {/* Card Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Baux &amp; Attributions d&apos;Occupation
            </h3>
            <Badge variant="light" color="primary" size="sm">
              En Direct
            </Badge>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Derniers contrats d&apos;habitation enregistrés et actifs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <SearchIcon className="size-3.5" />
            </span>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Rechercher résident, chambre..."
              className="rounded-xl border border-gray-200 bg-gray-50 py-1.5 pr-3 pl-8 text-xs text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* New Lease Action */}
          {onOpenAssignModal && (
            <button
              type="button"
              onClick={onOpenAssignModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
            >
              <PlusIcon className="size-3.5" />
              <span>Nouveau Bail</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div className="flex h-36 items-center justify-center p-6">
          <div className="size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : leases.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-500">
          Aucun bail enregistré dans la base de données.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3">Chambre &amp; Résidence</th>
                <th className="px-5 py-3">Résident Titulaire</th>
                <th className="px-5 py-3">Loyer Mensuel</th>
                <th className="px-5 py-3">Période du Séjour</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {leases.map((item) => {
                const { occupation: occ, room, building, quarter } = item;
                const isProcessing = terminatingId === occ.id;

                return (
                  <tr
                    key={occ.id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                          <BedIcon className="size-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {room?.roomNumber || "Chambre"}
                          </span>
                          <p className="text-[10px] text-gray-400">
                            {building?.name || "Bâtiment"} • {quarter?.name || "Zone"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {occ.occupantName || "Résident Citoyen"}
                      </span>
                      <p className="text-[10px] text-gray-400">{occ.occupantPhone || "+229"}</p>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-brand-600 dark:text-brand-400">
                      {(room?.monthlyRentXOF || 35000).toLocaleString("fr-FR")} F CFA
                    </td>

                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                      {new Date(occ.startDate).toLocaleDateString("fr-FR")} &rarr;{" "}
                      {occ.endDate ? new Date(occ.endDate).toLocaleDateString("fr-FR") : "Indéterminé"}
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant="light"
                        color={occ.isActive ? "success" : "light"}
                        size="sm"
                      >
                        {occ.isActive ? "Actif" : "Terminé"}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {occ.isActive ? (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleTerminate(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                        >
                          <TrashIcon className="size-3" />
                          <span>{isProcessing ? "..." : "Clôturer"}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400">Libéré</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentLeasesTable;
