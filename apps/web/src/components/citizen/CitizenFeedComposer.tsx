"use client";

import React, { useState, useEffect } from "react";
import {
  MapPinIcon,
  ImageIcon,
} from "@/components/icons";
import { HeartHandshake, Megaphone, AlertOctagon, Lightbulb, Lock } from "lucide-react";
import { Select2 } from "@/components/ui/Select2";
import { useCommunities } from "@/features/communities";
import { useAuth } from "@/features/auth";
import { useToast } from "@/features/errors";
import { useRouter } from "next/navigation";

export interface NewPostPayload {
  content: string;
  tag: string;
  tagColor: "primary" | "success" | "warning" | "info";
  quarter: string;
  communityId?: string;
  hasImage?: boolean;
}

interface CitizenFeedComposerProps {
  activeQuarter: string;
  selectedCommunityId?: string;
  onPostCreated: (payload: NewPostPayload) => void;
}

type CategoryId = "ENTRAIDE" | "ANNONCE" | "ALERTE" | "PROPOSITION";

interface CategoryOption {
  id: CategoryId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  color: "primary" | "success" | "warning" | "info";
}

const categories: CategoryOption[] = [
  { id: "ENTRAIDE", label: "Entraide & Dons", icon: HeartHandshake, tag: "Entraide Locale", color: "success" },
  { id: "ANNONCE", label: "Annonce de Quartier", icon: Megaphone, tag: "Action Citoyenne", color: "primary" },
  { id: "ALERTE", label: "Alerte Vigilance", icon: AlertOctagon, tag: "Alerte de Sécurité", color: "warning" },
  { id: "PROPOSITION", label: "Idée Citoyenne", icon: Lightbulb, tag: "Proposition Citoyenne", color: "info" },
];

export const CitizenFeedComposer: React.FC<CitizenFeedComposerProps> = ({
  activeQuarter,
  selectedCommunityId,
  onPostCreated,
}) => {
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("ENTRAIDE");
  const [selectedTargetId, setSelectedTargetId] = useState<string>(selectedCommunityId || "default");
  const [includeImage, setIncludeImage] = useState(false);
  const { communities } = useCommunities();
  const { isAuthenticated, currentUser } = useAuth();
  const { showSuccess, showInfo, showWarning } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (selectedCommunityId) {
      setSelectedTargetId(selectedCommunityId);
    }
  }, [selectedCommunityId]);

  const userInitials = currentUser?.firstName
    ? `${currentUser.firstName[0]}${currentUser.lastName?.[0] || ""}`.toUpperCase()
    : "CB";

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-brand-200/70 bg-gradient-to-r from-brand-50/80 via-white to-brand-50/40 p-5 shadow-xs dark:border-brand-900/40 dark:from-brand-950/40 dark:via-gray-900 dark:to-gray-900 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
                <Lock className="size-3.5" />
              </span>
              <h4 className="text-sm font-bold text-gray-950 dark:text-white">
                Participez aux échanges de votre quartier
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Vous devez être connecté pour publier une annonce, une idée ou un appel à l&apos;entraide.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login?redirect=/feed")}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            Se connecter pour publier
          </button>
        </div>
      </div>
    );
  }

  const handleCategorySelect = (cat: CategoryOption) => {
    setSelectedCategory(cat.id);
    showInfo(`Thème sélectionné : ${cat.label}`, "Type de publication");
  };

  const handleToggleImage = () => {
    setIncludeImage((prev) => {
      const next = !prev;
      if (next) {
        showInfo("Photo d'illustration ajoutée au message.", "Pièce jointe");
      } else {
        showInfo("Photo d'illustration retirée.");
      }
      return next;
    });
  };

  const handleRemoveImage = () => {
    setIncludeImage(false);
    showInfo("Photo d'illustration retirée.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showWarning("Veuillez saisir votre message citoyen avant de publier.", "Contenu requis");
      return;
    }

    const currentCat = categories.find((c) => c.id === selectedCategory)!;
    const targetCommunity = communities.find((c) => c.id === selectedTargetId);
    const quarterName = targetCommunity ? targetCommunity.name : activeQuarter;
    const resolvedCommunityId = targetCommunity?.id || (selectedTargetId !== "default" ? selectedTargetId : undefined);

    onPostCreated({
      content,
      tag: currentCat.tag,
      tagColor: currentCat.color,
      quarter: quarterName,
      communityId: resolvedCommunityId,
      hasImage: includeImage,
    });

    setContent("");
    setIncludeImage(false);
    showSuccess("Votre message citoyen a été partagé dans le fil !", "Publication en ligne");
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top: Avatar + Textarea */}
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-bold text-white shadow-xs">
            {userInitials}
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Que se passe-t-il dans votre quartier (${activeQuarter}) ? Partagez une entraide, alerte ou initiative...`}
              className="w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800/60 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  selectedCategory === cat.id
                    ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/20"
                    : "border border-gray-200 bg-gray-50/80 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Attachment preview banner if selected */}
        {includeImage && (
          <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-800 dark:bg-brand-950/40 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-brand-800 dark:text-brand-300">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4" />
                <span>Photo jointe : initiative_quartier_calavi.jpg</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-rose-600 hover:underline active:scale-95 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Scope target */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 w-full sm:w-auto">
              <MapPinIcon className="size-3.5 text-rose-500 shrink-0" />
              <div className="flex-1 sm:w-[200px]">
                <Select2
                  value={selectedTargetId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedTargetId(val);
                    const found = communities.find((c) => c.id === val);
                    showInfo(
                      found
                        ? `Périmètre : ${found.name}`
                        : `Périmètre : Mon quartier (${activeQuarter})`,
                      "Espace de diffusion"
                    );
                  }}
                  className="w-full"
                >
                  <option value="default">Mon quartier ({activeQuarter})</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select2>
              </div>
            </div>

            {/* Photo Attachment Toggle */}
            <button
              type="button"
              onClick={handleToggleImage}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 sm:py-1.5 text-xs font-semibold transition active:scale-95 ${
                includeImage
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 shadow-2xs"
                  : "border-gray-200 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <ImageIcon className="size-3.5 text-brand-600 dark:text-brand-400" />
              <span>{includeImage ? "Photo ajoutée" : "Ajouter photo"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="w-full sm:w-auto rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 disabled:opacity-40"
          >
            Publier dans le quartier
          </button>
        </div>
      </form>
    </div>
  );
};

export default CitizenFeedComposer;
