'use client';

import React, { useState, useMemo } from 'react';
import Badge from '@/components/ui/badge/Badge';
import { PlusIcon, SearchIcon, CheckIcon, UsersIcon } from '@/components/icons';
import {
  Lock,
  Users,
  Globe,
  Pin,
  PinOff,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Calendar,
  Megaphone,
  Building,
  RotateCcw,
} from 'lucide-react';
import { Select2 } from '@/components/ui/Select2';
import {
  useAssociations,
  useAssociationPosts,
  AssociationPost,
  CreatePostInput,
  PostCategoryType,
  PostVisibilityType,
} from '@/features/associations';
import { AssociationPostModal } from '@/components/dashboard/AssociationPostModal';
import { OfficialPostPreviewModal } from '@/components/dashboard/OfficialPostPreviewModal';
import { useConfirm } from '@/context/ConfirmationContext';

export default function AssociationPostsPage() {
  const { confirm } = useConfirm();

  const {
    associations,
    selectedAssociation,
    selectedAssocId,
    selectAssociation,
    isLoading: isLoadingAssocs,
  } = useAssociations();

  const {
    posts,
    pinnedPosts,
    regularPosts,
    isLoading: isLoadingPosts,
    isSubmitting,
    createPost,
    updatePost,
    deletePost,
    togglePinPost,
  } = useAssociationPosts(selectedAssocId);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AssociationPost | null>(null);
  const [previewPost, setPreviewPost] = useState<AssociationPost | null>(null);

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterVisibility, setFilterVisibility] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Actions
  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: AssociationPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleOpenPreview = (post: AssociationPost) => {
    setPreviewPost(post);
  };

  const handleSubmitPost = async (input: CreatePostInput) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, input);
        showToast('Communiqué officiel mis à jour avec succès !');
      } else {
        await createPost(input);
        showToast('Communiqué officiel publié avec succès !');
      }
    } catch {
      showToast('Erreur lors de l’enregistrement de la publication.');
    }
  };

  const handleTogglePin = async (post: AssociationPost) => {
    try {
      const updated = await togglePinPost(post.id);
      showToast(
        updated.pinned
          ? 'Communiqué épinglé en tête du tableau d’affichage officiel.'
          : 'Communiqué détaché de la section prioritaire.',
      );
    } catch {
      showToast('Erreur lors du changement d’épinglage.');
    }
  };

  const handleDeletePost = async (post: AssociationPost) => {
    const ok = await confirm({
      title: 'Supprimer le communiqué',
      message: `Confirmez-vous la suppression définitive du communiqué officiel « ${post.title} » ? Cette action est irréversible.`,
      confirmText: 'Supprimer définitivement',
      cancelText: 'Annuler',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deletePost(post.id);
      showToast('Communiqué supprimé de l’historique des publications.');
    } catch {
      showToast('Erreur lors de la suppression.');
    }
  };

  // Filtrage combiné
  const filterList = (items: typeof posts) => {
    return items.filter((p) => {
      if (filterCategory !== 'ALL' && p.category !== filterCategory) return false;
      if (filterVisibility !== 'ALL' && p.visibility !== filterVisibility) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchContent = p.content.toLowerCase().includes(q);
        const matchAuthor = p.authorName.toLowerCase().includes(q);
        const matchRole = p.authorRole.toLowerCase().includes(q);
        return matchTitle || matchContent || matchAuthor || matchRole;
      }
      return true;
    });
  };

  const displayedPinned = useMemo(() => filterList(pinnedPosts), [pinnedPosts, filterCategory, filterVisibility, search]);
  const displayedRegular = useMemo(() => filterList(regularPosts), [regularPosts, filterCategory, filterVisibility, search]);

  const hasActiveFilters = filterCategory !== 'ALL' || filterVisibility !== 'ALL' || search.trim() !== '';

  const handleResetFilters = () => {
    setFilterCategory('ALL');
    setFilterVisibility('ALL');
    setSearch('');
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = posts.length;
    const pinned = posts.filter((p) => p.pinned).length;
    const residents = posts.filter((p) => p.category === 'AVIS_RESIDENTS').length;
    const assemblies = posts.filter((p) => p.category === 'ASSEMBLEE_GENERALE').length;
    const publicPosts = posts.filter((p) => p.visibility === 'PUBLIC').length;
    return { total, pinned, residents, assemblies, publicPosts };
  }, [posts]);

  const getCategoryLabel = (cat: PostCategoryType) => {
    switch (cat) {
      case 'COMMUNIQUE':
        return 'Communiqué Officiel';
      case 'ASSEMBLEE_GENERALE':
        return 'Assemblée Générale';
      case 'AVIS_RESIDENTS':
        return 'Avis aux Résidents';
      case 'APPEL_COTISATION':
        return 'Appel aux Cotisations';
      case 'EVENEMENT':
        return 'Événement Civique';
      default:
        return cat;
    }
  };

  const getVisibilityBadge = (vis: PostVisibilityType) => {
    switch (vis) {
      case 'ASSOCIATION_MEMBERS':
        return (
          <Badge variant="light" color="warning" size="sm">
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3" />
              <span>Réservé Membres</span>
            </span>
          </Badge>
        );
      case 'COMMUNITY':
        return (
          <Badge variant="light" color="primary" size="sm">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              <span>Quartier &amp; Communauté</span>
            </span>
          </Badge>
        );
      case 'PUBLIC':
        return (
          <Badge variant="light" color="success" size="sm">
            <span className="inline-flex items-center gap-1">
              <Globe className="size-3" />
              <span>Public</span>
            </span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-white dark:text-gray-900 animate-in fade-in slide-in-from-top-3">
          <CheckIcon className="size-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Communiqués &amp; Publications Officielles
            </h1>
            <Badge variant="light" color="primary" size="sm">
              Canal Officiel
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Gestion intégrale des actes officiels, convocations aux Assemblées Générales et avis pour les résidents.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 active:scale-95"
        >
          <PlusIcon className="size-4" />
          <span>Rédiger un Communiqué</span>
        </button>
      </div>

      {/* Sélecteur d'Association Active */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 shrink-0">
              <Building className="size-4 text-brand-600" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Association émettrice :
              </span>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[260px]">
              <Select2
                value={selectedAssocId}
                onChange={(e) => selectAssociation(e.target.value)}
                disabled={isLoadingAssocs}
                className="w-full"
              >
                {associations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.acronym || 'ASSO'})
                  </option>
                ))}
              </Select2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Actes enregistrés : <strong className="text-gray-900 dark:text-white">{posts.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPIs Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Total Publications</span>
            <FileText className="size-3.5 text-gray-400" />
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{kpis.total}</p>
          <span className="text-[10px] text-gray-400">Registres officiels</span>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-3.5 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
            <span>Épinglés au Tableau</span>
            <Pin className="size-3.5 text-amber-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-amber-800 dark:text-amber-300">{kpis.pinned}</p>
          <span className="text-[10px] text-amber-600/80">Prioritaires en haut</span>
        </div>

        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-3.5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400">
            <span>Avis Résidents &amp; Baux</span>
            <Building className="size-3.5 text-blue-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-300">{kpis.residents}</p>
          <span className="text-[10px] text-blue-600/80">Pavillons &amp; Logements</span>
        </div>

        <div className="rounded-2xl border border-purple-200/60 bg-purple-50/40 p-3.5 shadow-xs dark:border-purple-900/40 dark:bg-purple-950/20">
          <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-400">
            <span>Convocations d&apos;AG</span>
            <Calendar className="size-3.5 text-purple-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-purple-800 dark:text-purple-300">{kpis.assemblies}</p>
          <span className="text-[10px] text-purple-600/80">Démocratie interne</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400">
            <span>Diffusion Publique</span>
            <Globe className="size-3.5 text-emerald-600" />
          </div>
          <p className="mt-1 text-xl font-bold text-emerald-800 dark:text-emerald-300">{kpis.publicPosts}</p>
          <span className="text-[10px] text-emerald-600/80">Tout citoyen du Bénin</span>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par objet, contenu ou signataire..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pr-4 pl-9 text-xs text-gray-900 focus:border-brand-500 focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-gray-500 shrink-0">Visibilité :</span>
            <div className="w-full sm:w-auto sm:min-w-[190px]">
              <Select2
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value)}
                className="w-full"
              >
                <option value="ALL">Toutes les visibilités</option>
                <option value="ASSOCIATION_MEMBERS">Membres uniquement</option>
                <option value="COMMUNITY">Quartier &amp; Communauté</option>
                <option value="PUBLIC">Public</option>
              </Select2>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition"
              >
                <RotateCcw className="size-3" />
                <span>Réinitialiser</span>
              </button>
            )}
          </div>
        </div>

        {/* Pilules Catégories */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-800">
          {[
            { id: 'ALL', label: 'Toutes les Catégories' },
            { id: 'COMMUNIQUE', label: 'Communiqué Officiel' },
            { id: 'ASSEMBLEE_GENERALE', label: 'Assemblée Générale' },
            { id: 'AVIS_RESIDENTS', label: 'Avis aux Résidents' },
            { id: 'APPEL_COTISATION', label: 'Appel Cotisations' },
            { id: 'EVENEMENT', label: 'Événement Civique' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                filterCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publications Pinned (Épinglées en tête) */}
      {displayedPinned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Pin className="size-4 text-amber-500 fill-amber-500" />
            <span>Tableau d’Affichage Officiel — Annonces Épinglées</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {displayedPinned.map((post) => (
              <div
                key={post.id}
                className="relative rounded-3xl border-2 border-brand-500/50 bg-gradient-to-br from-brand-50/30 to-amber-50/20 p-6 shadow-sm dark:from-brand-950/30 dark:to-gray-900 transition hover:shadow-md"
              >
                {/* Header Carte */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-200/60 pb-3 dark:border-brand-900/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <Pin className="size-3 fill-amber-500" />
                      Épinglé
                    </span>
                    <Badge variant="solid" color="primary" size="sm">
                      {getCategoryLabel(post.category)}
                    </Badge>
                    {getVisibilityBadge(post.visibility)}
                  </div>

                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    Publié le {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Titre & Contenu */}
                <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line text-justify">
                  {post.content}
                </p>

                {/* Footer Signataire & Actions */}
                <div className="mt-5 flex flex-col gap-3 border-t border-brand-200/60 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-brand-900/60">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <span>
                      Signataire : <strong className="text-gray-900 dark:text-white">{post.authorName}</strong> ({post.authorRole})
                    </span>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(post)}
                      title="Consulter et imprimer l'acte officiel"
                      className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700 shadow-xs transition hover:bg-brand-50 dark:border-brand-800 dark:bg-gray-800 dark:text-brand-300 dark:hover:bg-gray-700"
                    >
                      <Eye className="size-3.5" />
                      <span>Voir Acte</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(post)}
                      title="Détacher du tableau officiel"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <PinOff className="size-3.5" />
                      <span>Détacher</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      title="Modifier ce communiqué"
                      className="rounded-xl border border-gray-200 bg-white p-1.5 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      title="Supprimer définitivement"
                      className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:bg-gray-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications Récentes (Regular Posts) */}
      <div className="space-y-4">
        {displayedPinned.length > 0 && (
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Toutes les Publications &amp; Notes d&apos;Information
          </h3>
        )}

        {isLoadingPosts ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900">
            <span className="inline-block size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <p className="mt-3">Chargement des actes et communiqués...</p>
          </div>
        ) : displayedRegular.length === 0 && displayedPinned.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
            <Megaphone className="mx-auto size-10 text-gray-400" />
            <p className="mt-3 text-sm font-bold text-gray-700 dark:text-gray-300">
              Aucun communiqué officiel trouvé
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {hasActiveFilters
                ? 'Aucun résultat ne correspond à vos filtres de recherche.'
                : 'Publiez une première note d’information ou convocation d’AG pour vos adhérents et résidents.'}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                <RotateCcw className="size-3.5" />
                <span>Effacer les filtres</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700"
              >
                <PlusIcon className="size-4" />
                <span>Rédiger le premier communiqué</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedRegular.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="light" color="light" size="sm">
                      {getCategoryLabel(post.category)}
                    </Badge>
                    {getVisibilityBadge(post.visibility)}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Titre & Contenu */}
                <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line text-justify">
                  {post.content}
                </p>

                {/* Footer & Actions */}
                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                    Émis par : <strong className="text-gray-800 dark:text-gray-200">{post.authorName}</strong> ({post.authorRole})
                  </span>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(post)}
                      title="Consulter et imprimer l'acte officiel"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                    >
                      <Eye className="size-3.5" />
                      <span>Voir Acte</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTogglePin(post)}
                      title="Épingler en tête de tableau d'affichage"
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750"
                    >
                      <Pin className="size-3.5" />
                      <span>Épingler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(post)}
                      title="Modifier ce communiqué"
                      className="rounded-xl border border-gray-200 bg-white p-1.5 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white"
                    >
                      <Pencil className="size-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePost(post)}
                      title="Supprimer définitivement"
                      className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:bg-gray-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Création & Modification de Communiqué */}
      <AssociationPostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={handleSubmitPost}
        post={editingPost}
        isSubmitting={isSubmitting}
      />

      {/* Modal Prévisualisation Acte Officiel Certifié & Impression */}
      <OfficialPostPreviewModal
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
        post={previewPost}
        association={selectedAssociation}
      />
    </div>
  );
}
