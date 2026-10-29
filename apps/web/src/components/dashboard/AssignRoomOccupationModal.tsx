"use client";

import React, { useState } from "react";
import { BedIcon, CheckIcon, BuildingIcon } from "@/components/icons";
import { X, Check, Info } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { useAssignRoomOccupation } from "@/features/residences";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAssociationId?: string;
  initialQuarterId?: string;
  initialBuildingId?: string;
  initialRoomId?: string;
}

export const AssignRoomOccupationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAssociationId,
  initialQuarterId,
  initialBuildingId,
  initialRoomId,
}) => {
  const {
    associations,
    quarters,
    buildings,
    rooms,
    users,
    selectedQuarterId,
    setSelectedQuarterId,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedRoomId,
    setSelectedRoomId,
    selectedUserId,
    setSelectedUserId,
    formData,
    setFormData,
    isSubmitting,
    error,
    isSuccess,
    filteredBuildings,
    filteredRooms,
    submitAssignment,
  } = useAssignRoomOccupation({
    isOpen,
    initialQuarterId,
    initialBuildingId,
    initialRoomId,
  });

  const [showManualRoomSelect, setShowManualRoomSelect] = useState(false);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const u = users.find((usr) => usr.id === userId);
    if (u) {
      setFormData((prev) => ({
        ...prev,
        tenantName: u.name,
        tenantPhone: u.phone,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitAssignment();
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch {
      // Handled in hook
    }
  };

  if (!isOpen) return null;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const selectedBuilding = buildings.find(
    (b) => b.id === (selectedRoom?.buildingId || selectedBuildingId)
  );
  const selectedQuarter = quarters.find(
    (q) => q.id === (selectedBuilding?.quarterId || selectedQuarterId)
  );
  const activeAssociation =
    associations.find((a) => a.id === initialAssociationId) ||
    (selectedQuarterId
      ? associations.find((a) => a.id === quarters.find((q) => q.id === selectedQuarterId)?.associationId)
      : null);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom duration-200 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <BedIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Attribuer un Bail Résidentiel
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contrat d&apos;hébergement et affectation de chambre (ADR-010)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 animate-bounce">
              <CheckIcon className="size-8" />
            </div>
            <h4 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
              Bail Assigné avec Succès !
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Le contrat pour la {selectedRoom?.roomNumber || "chambre"} au nom de {formData.tenantName} est enregistré et actif.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Active Association Banner */}
            {activeAssociation && (
              <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/70 p-2.5 dark:border-brand-900/60 dark:bg-brand-950/40">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <BuildingIcon className="size-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      Association Gestionnaire
                    </span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {activeAssociation.name} {activeAssociation.acronym ? `(${activeAssociation.acronym})` : ""}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  Lié
                </span>
              </div>
            )}

            {/* 1. Bloc Chambre Auto-Remplie & Verrouillée (Facilité UX) */}
            {selectedRoom && !showManualRoomSelect ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <Check className="size-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Chambre Auto-Remplie &amp; Pré-Sélectionnée
                      </span>
                      <h4 className="text-sm font-bold text-gray-950 dark:text-white">
                        Chambre {selectedRoom.roomNumber} — {selectedRoom.type || "Chambre"}
                      </h4>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualRoomSelect(true)}
                    className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400 shrink-0"
                  >
                    Changer de chambre
                  </button>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs border-t border-emerald-200/60 pt-2 dark:border-emerald-900/60">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Campus :</span>{" "}
                    <strong className="text-gray-800 dark:text-gray-200">{selectedQuarter?.name || "Campus Universitaire"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Bâtiment :</span>{" "}
                    <strong className="text-gray-800 dark:text-gray-200">{selectedBuilding?.name || "Bâtiment Principal"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Loyer auto-rempli :</span>{" "}
                    <strong className="text-emerald-700 dark:text-emerald-300 font-bold">
                      {(selectedRoom.monthlyRentXOF || 35000).toLocaleString("fr-FR")} FCFA/mois
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Capacité :</span>{" "}
                    <strong className="text-gray-800 dark:text-gray-200">{selectedRoom.capacity} personne(s)</strong>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Sélectionner l&apos;emplacement :
                  </span>
                  {selectedRoom && (
                    <button
                      type="button"
                      onClick={() => setShowManualRoomSelect(false)}
                      className="text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      Revenir à la chambre pré-sélectionnée
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Quartier / Campus *
                    </label>
                    <Select2
                      value={selectedQuarterId}
                      onChange={(e) => setSelectedQuarterId(e.target.value)}
                      className="mt-1 w-full"
                    >
                      {quarters.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name} ({q.city})
                        </option>
                      ))}
                    </Select2>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Bâtiment *
                    </label>
                    <Select2
                      value={selectedBuildingId}
                      onChange={(e) => setSelectedBuildingId(e.target.value)}
                      className="mt-1 w-full"
                    >
                      {filteredBuildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.floorsCount} étages)
                        </option>
                      ))}
                    </Select2>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Chambre à attribuer *
                  </label>
                  <Select2
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      const room = rooms.find((r) => r.id === e.target.value);
                      if (room?.monthlyRentXOF) {
                        setFormData((prev) => ({
                          ...prev,
                          monthlyRentXOF: String(room.monthlyRentXOF),
                          depositXOF: String((room.monthlyRentXOF || 35000) * 2),
                        }));
                      }
                    }}
                    className="mt-1 w-full"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomNumber} — {r.type || "Chambre"} (Capacité: {r.capacity} lits{r.status === "OCCUPIED" ? " • Capacité nominale atteinte / Surplus admis" : " • Disponible"})
                      </option>
                    ))}
                  </Select2>
                </div>
              </>
            )}

              {/* Information de capacité et politique de surplus solidaire */}
              {selectedRoom && (
                <div className="mt-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-indigo-950 dark:text-indigo-200">
                        {selectedRoom.roomNumber} — {selectedRoom.type || "Chambre Partagée"}
                      </p>
                      <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300">
                        Capacité standard : <strong>{selectedRoom.capacity} place(s)</strong> • Statut :{" "}
                        <span className="font-semibold">
                          {selectedRoom.status === "OCCUPIED" ? "Capacité nominale atteinte (Surplus solidaire admis)" : "Places libres"}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Surplus Autorisé
                    </span>
                  </div>
                  <p className="mt-1 flex items-start gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                    <Info className="size-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Règle de solidarité :</strong> Une chambre définie pour 4 personnes (ou toute autre capacité) ne doit pas refuser de surplus en cas de besoin d&apos;hébergement étudiant.</span>
                  </p>

                  <div className="mt-2 flex items-center gap-2 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                    <input
                      type="checkbox"
                      id="allowSurplus"
                      checked={formData.allowSurplus ?? true}
                      onChange={(e) => setFormData({ ...formData, allowSurplus: e.target.checked })}
                      className="size-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="allowSurplus" className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                      Admettre en surplus solidaire si la capacité nominale est atteinte
                    </label>
                  </div>

                  {formData.allowSurplus && (
                    <input
                      type="text"
                      placeholder="Motif du surplus (ex: Entraide d'urgence rentrée, colocation fraternelle)..."
                      value={formData.surplusReason || ""}
                      onChange={(e) => setFormData({ ...formData, surplusReason: e.target.value })}
                      className="mt-2 h-8 w-full rounded-lg border border-indigo-200 bg-white px-2.5 text-[11px] text-gray-900 placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  )}
                </div>
              )}

            {/* Resident citizen selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Sélectionner un Résident Citoyen / Membre *
              </label>
              <Select2
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="mt-1 w-full"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.phone})
                  </option>
                ))}
              </Select2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Nom d&apos;Affichage *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Babatoundé Sossou"
                  value={formData.tenantName}
                  onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Téléphone de Contact *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+229 97 00 00 00"
                  value={formData.tenantPhone}
                  onChange={(e) => setFormData({ ...formData, tenantPhone: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Loyer Mensuel Standard (FCFA XOF)
                </label>
                <input
                  type="number"
                  required
                  value={formData.monthlyRentXOF}
                  onChange={(e) => setFormData({ ...formData, monthlyRentXOF: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Frais d&apos;Intégration / Caution (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.depositXOF}
                  onChange={(e) => setFormData({ ...formData, depositXOF: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date de Prise d&apos;Effet *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Date d&apos;Échéance Prévisionnelle
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="mt-1 h-9 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-xs text-gray-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-50"
              >
                {isSubmitting ? "Enregistrement en cours..." : "Valider l'Attribution"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignRoomOccupationModal;
