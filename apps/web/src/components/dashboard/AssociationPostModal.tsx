'use client';

import React, { useState, useEffect } from 'react';
import {
  AssociationPost,
  CreatePostInput,
  PostCategoryType,
  PostVisibilityType,
} from '@/features/associations';
import { Plus, Check, X } from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';

interface AssociationPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreatePostInput) => Promise<void>;
  post?: AssociationPost | null;
  isSubmitting?: boolean;
}

export function AssociationPostModal({
  isOpen,
  onClose,
  onSubmit,
  post,
  isSubmitting = false,
}: AssociationPostModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategoryType>('COMMUNIQUE');
  const [visibility, setVisibility] = useState<PostVisibilityType>('ASSOCIATION_MEMBERS');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setVisibility(post.visibility);
      setPinned(post.pinned);
    } else {
      setTitle('');
      setContent('');
      setCategory('COMMUNIQUE');
      setVisibility('ASSOCIATION_MEMBERS');
      setPinned(false);
    }
  }, [isOpen, post]);

  if (!isOpen) return null;

  const isEditing = Boolean(post);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      visibility,
      pinned,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-200">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Modifier le Communiqué Officiel' : 'Diffuser une Publication Officielle du Bureau'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEditing
                ? 'Mettez à jour le contenu, les résolutions ou la visibilité de cette publication.'
                : 'Communiqué, convocation d’AG, appel aux cotisations ou avis aux résidents.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Objet / Titre du Communiqué *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Convocation à l’Assemblée Générale Ordinaire 2026"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Catégorie d’Annonce
              </label>
              <Select2
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategoryType)}
                className="mt-1 w-full"
              >
                <option value="COMMUNIQUE">Communiqué Officiel</option>
                <option value="OPPORTUNITE_ETUDIANTE">Opportunité Étudiante (Stage, Bourse, Concours)</option>
                <option value="ASSEMBLEE_GENERALE">Convocation d’AG (Ordre du jour)</option>
                <option value="AVIS_RESIDENTS">Avis aux Résidents &amp; Locataires</option>
                <option value="APPEL_COTISATION">Appel aux Cotisations</option>
                <option value="EVENEMENT">Événement &amp; Mobilisation</option>
              </Select2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Visibilité &amp; Diffusion
              </label>
              <Select2
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as PostVisibilityType)}
                className="mt-1 w-full"
              >
                <option value="ASSOCIATION_MEMBERS">Adhérents uniquement (Privé)</option>
                <option value="COMMUNITY">Quartier &amp; Communauté rattachée</option>
                <option value="PUBLIC">Public (Tout citoyen)</option>
              </Select2>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Contenu du message ou résolution *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Rédigez ici le texte officiel de la note ou communication..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm leading-relaxed text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-800/40">
            <input
              type="checkbox"
              id="pinned"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="size-4 rounded-sm border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="pinned" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Épingler ce communiqué en tête de tableau d’affichage officiel
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isEditing ? <Check className="size-4" /> : <Plus className="size-4" />}
              <span>
                {isSubmitting
                  ? 'Traitement...'
                  : isEditing
                    ? 'Enregistrer les modifications'
                    : 'Publier le Communiqué'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
