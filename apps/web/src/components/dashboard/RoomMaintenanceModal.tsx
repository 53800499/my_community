"use client";

import React, { useState } from "react";
import { WrenchIcon, CheckIcon } from "@/components/icons";
import { X } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { ApiRoom, useRoomMaintenance } from "@/features/residences";

interface RoomMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: ApiRoom | null;
  onSuccess: () => void;
}

export default function RoomMaintenanceModal({
  isOpen,
  onClose,
  room,
  onSuccess,
}: RoomMaintenanceModalProps) {
  const [category, setCategory] = useState("PLUMBING");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT" | "CRITICAL">("NORMAL");
  const [description, setDescription] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [technicianPhone, setTechnicianPhone] = useState("");
  const [estimatedCostXOF, setEstimatedCostXOF] = useState<number>(15000);
  const [setInMaintenance, setSetInMaintenance] = useState(true);

  const { isSubmitting, error, submitMaintenance } = useRoomMaintenance();

  if (!isOpen || !room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMaintenance(room, {
        category,
        priority,
        description,
        technicianName,
        technicianPhone,
        estimatedCostXOF,
        setInMaintenance,
      });
      onSuccess();
      onClose();
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-4 sm:p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <WrenchIcon className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Fiche de Maintenance &amp; Incident
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chambre {room.roomNumber} ({room.type || "Chambre"})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Catégorie d&apos;intervention *
              </label>
              <Select2
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full"
              >
                <option value="PLUMBING">Plomberie &amp; Sanitaires (WC, robinet)</option>
                <option value="ELECTRICITY">Électricité &amp; Éclairage</option>
                <option value="LOCKSMITH">Serrurerie &amp; Accès porte</option>
                <option value="CARPENTRY">Menuiserie &amp; Mobilier (Lit, table)</option>
                <option value="PAINTING">Peinture &amp; Maçonnerie</option>
                <option value="OTHER">Autre intervention générale</option>
              </Select2>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Priorité du diagnostic *
              </label>
              <Select2
                value={priority}
                onChange={(e) => setPriority(e.target.value as "NORMAL" | "URGENT" | "CRITICAL")}
                className="w-full"
              >
                <option value="NORMAL">Normal — Entretien programmé</option>
                <option value="URGENT">Urgent — Inconfort locataire</option>
                <option value="CRITICAL">Critique — Logement inhabitable</option>
              </Select2>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description de l&apos;avarie / Travaux à réaliser *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Remplacement du robinet mitigeur défectueux et vérification de l'évacuation de la douche..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Artisan / Technicien mandaté
              </label>
              <input
                type="text"
                placeholder="Ex: M. Gandonou (Plombier)"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Téléphone de l&apos;artisan (+229)
              </label>
              <input
                type="text"
                placeholder="Ex: 97 00 11 22"
                value={technicianPhone}
                onChange={(e) => setTechnicianPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Coût estimé des travaux (FCFA)
            </label>
            <input
              type="number"
              step="1000"
              value={estimatedCostXOF}
              onChange={(e) => setEstimatedCostXOF(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Toggle Mise en maintenance */}
          {room.status !== "OCCUPIED" && (
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
              <input
                type="checkbox"
                id="maintenanceToggle"
                checked={setInMaintenance}
                onChange={(e) => setSetInMaintenance(e.target.checked)}
                className="size-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="maintenanceToggle" className="cursor-pointer text-xs font-semibold text-amber-900 dark:text-amber-300">
                Passer immédiatement la chambre en statut &quot;En Travaux / Maintenance&quot;
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50"
            >
              <CheckIcon className="size-3.5" />
              <span>{isSubmitting ? "Enregistrement..." : "Valider l'intervention"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
