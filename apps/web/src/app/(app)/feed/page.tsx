"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import CitizenFeedComposer, {
  NewPostPayload,
} from "@/components/citizen/CitizenFeedComposer";
import CitizenPostCard, {
  PostData,
  CommentItem,
} from "@/components/citizen/CitizenPostCard";
import CommunityDetailModal from "@/components/citizen/CommunityDetailModal";
import {
  Sprout,
  Handshake,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useCommunities } from "@/features/communities";
import { useToast } from "@/features/errors";
import { useRouter, useSearchParams } from "next/navigation";
import { STORAGE_KEYS, getLocalState, setLocalState } from "@/lib/api-client";

function FeedContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { communities } = useCommunities();
  const { showSuccess, showInfo } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filterTag, setFilterTag] = useState<"ALL" | "ACTION" | "ENTRAIDE" | "AVIS">("ALL");
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedModalCommunityId, setSelectedModalCommunityId] = useState<string | null>(null);

  const searchQuery = searchParams.get("q")?.trim() || "";

  // Load posts from LocalStorage with rich initial Benin community content
  useEffect(() => {
    setMounted(true);
    const stored = getLocalState<PostData[]>(STORAGE_KEYS.FEED_POSTS, []);
    if (stored && stored.length > 0) {
      setPosts(stored);
    } else {
      const initialPosts: PostData[] = [
        {
          id: "post-benin-01",
          author: "Aline Dossou",
          avatarText: "AD",
          authorRole: "Comité de Quartier",
          quarter: "Haie-Vive (Cotonou)",
          timeAgo: "Il y a 25 min",
          tag: "Action Citoyenne",
          tagColor: "success",
          content: "🌿 Grande matinée salubrité & curage des caniveaux ce samedi matin dès 07h30 ! Tous les résidents sont invités avec leurs gants. Les sacs poubelles et le petit matériel sont déjà prêts.",
          hasImage: true,
          imageUrl: "/images/landing-community-hero.jpg",
          imageCaption: "Riverains et bénévoles mobilisés pour le verdissement et la propreté de l'avenue.",
          likes: 34,
          supports: 19,
          isLiked: false,
          comments: [
            {
              id: "c-01",
              author: "Romuald Kpodan",
              authorAvatar: "RK",
              timeAgo: "Il y a 10 min",
              text: "Excellente initiative ! Je serai présent avec mes deux apprentis.",
            },
          ],
        },
        {
          id: "post-benin-02",
          author: "Marc Agbodjan",
          avatarText: "MA",
          authorRole: "Résident Foyer 12",
          quarter: "Fidjrossè (Cotonou)",
          timeAgo: "Il y a 1 heure",
          tag: "Entraide Locale",
          tagColor: "info",
          content: "💡 Installation réussie de 2 lampadaires solaires communautaires au carrefour pharmacie ! Un grand merci aux cotisations des riverains qui ont permis de sécuriser le passage du soir.",
          hasImage: true,
          imageUrl: "/images/feed-solidarity.jpg",
          imageCaption: "Installation et réglage des nouveaux panneaux solaires avec les jeunes du quartier.",
          likes: 47,
          supports: 28,
          isLiked: true,
          comments: [],
        },
        {
          id: "post-benin-03",
          author: "Dossou Fiacre",
          avatarText: "DF",
          authorRole: "Délégué Étudiant UAC",
          quarter: "Tankpè (Abomey-Calavi)",
          timeAgo: "Il y a 2 heures",
          tag: "Résidences & Cité U",
          tagColor: "primary",
          content: "📚 Résidence Étudiante UAC : Rappel pour tous les colocataires du Pavillon Étoile, la distribution des quittances de loyer numérisées du mois est effective dans vos espaces personnels My Community.",
          hasImage: true,
          imageUrl: "/images/landing-residence-campus.jpg",
          imageCaption: "Espace de travail et chambres étudiantes au campus d'Abomey-Calavi.",
          likes: 22,
          supports: 15,
          isLiked: false,
          comments: [],
        },
      ];
      setPosts(initialPosts);
      setLocalState(STORAGE_KEYS.FEED_POSTS, initialPosts);
    }
  }, []);

  // Save posts to LocalStorage
  const updatePosts = (newPosts: PostData[]) => {
    setPosts(newPosts);
    setLocalState(STORAGE_KEYS.FEED_POSTS, newPosts);
  };

  // Sync community filter from URL query param if provided
  useEffect(() => {
    const urlCommunityId = searchParams.get("communityId");
    if (urlCommunityId) {
      setSelectedCommunityId(urlCommunityId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent("/feed")}`);
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  const requireAuth = (callback: () => void) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/feed")}`);
      return;
    }
    callback();
  };

  const handleSelectCommunity = (commId: string | null) => {
    setSelectedCommunityId(commId);
    if (!commId) {
      showInfo("Filtre réinitialisé : tous les espaces citoyens affichés.", "Espaces & Communautés");
    } else {
      const found = communities.find((c) => c.id === commId);
      showInfo(`Filtré sur l'espace : ${found?.name || "Communauté"}`, "Espace Citoyen");
    }
  };

  const handleSelectCategory = (cat: "ALL" | "ACTION" | "ENTRAIDE" | "AVIS") => {
    setFilterTag(cat);
    const labels = {
      ALL: "Toutes les catégories",
      ACTION: "Actions Citoyennes",
      ENTRAIDE: "Entraides & Dons",
      AVIS: "Avis & Alertes",
    };
    showInfo(`Filtré par : ${labels[cat]}`, "Catégories");
  };

  const handlePostCreated = (payload: NewPostPayload) => {
    requireAuth(() => {
      const authorName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.phoneNumber || "Citoyen"
        : "Citoyen";
      const initials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "MC"
        : "MC";
      const authorRole =
        user?.role === "ADMIN"
          ? "Administrateur"
          : user?.role === "PRESIDENT"
          ? "Bureau Association"
          : user?.role === "SYNDIC"
          ? "Gestionnaire Résidence"
          : "Citoyen Résident";

      const newPost: PostData = {
        id: `p-${Date.now()}`,
        communityId: payload.communityId || selectedCommunityId || undefined,
        author: authorName,
        avatarText: initials,
        authorRole: authorRole,
        quarter: payload.quarter,
        timeAgo: "À l'instant",
        tag: payload.tag,
        tagColor: payload.tagColor,
        content: payload.content,
        hasImage: payload.hasImage,
        imageUrl: payload.imageUrl,
        imageCaption: payload.hasImage
          ? `Photo partagée par ${authorName} dans ${payload.quarter}.`
          : undefined,
        likes: 1,
        supports: 1,
        isLiked: true,
        comments: [],
      };

      updatePosts([newPost, ...posts]);
      showSuccess("Votre message citoyen est désormais en ligne dans le quartier !", "Publication partagée");
    });
  };

  const handleLike = (id: string) => {
    requireAuth(() => {
      let willLike = false;
      const updated = posts.map((post) => {
        if (post.id === id) {
          const isLiked = !post.isLiked;
          willLike = isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      });
      updatePosts(updated);
      if (willLike) {
        showSuccess("Vous avez aimé cette publication !", "Mention J'aime");
      } else {
        showInfo("Mention J'aime retirée.", "Mention J'aime");
      }
    });
  };

  const handleSupport = (id: string) => {
    requireAuth(() => {
      let willSupport = false;
      const updated = posts.map((post) => {
        if (post.id === id) {
          const isSupported = !post.isSupported;
          willSupport = isSupported;
          return {
            ...post,
            isSupported,
            supports: isSupported ? post.supports + 1 : post.supports - 1,
          };
        }
        return post;
      });
      updatePosts(updated);
      if (willSupport) {
        showSuccess("Vous avez soutenu cette initiative citoyenne !", "Soutien citoyen");
      } else {
        showInfo("Soutien citoyen retiré.", "Soutien");
      }
    });
  };

  const handleAddComment = (postId: string, text: string) => {
    requireAuth(() => {
      const authorName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.phoneNumber || "Citoyen"
        : "Citoyen";
      const initials = user
        ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "MC"
        : "MC";

      const newComment: CommentItem = {
        id: `c-${Date.now()}`,
        author: authorName,
        authorAvatar: initials,
        timeAgo: "À l'instant",
        text,
      };

      const updated = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      });
      updatePosts(updated);
      showSuccess("Votre commentaire a été publié avec succès !", "Commentaire ajouté");
    });
  };

  // Filter posts by selected community, category tag, and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.content.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.quarter.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Community filter
      if (selectedCommunityId && p.communityId !== selectedCommunityId) {
        return false;
      }
      // Category tag filter
      if (filterTag === "ACTION") return p.tagColor === "success";
      if (filterTag === "ENTRAIDE") return p.tagColor === "info";
      if (filterTag === "AVIS") return p.tagColor === "warning";
      return true;
    });
  }, [posts, selectedCommunityId, filterTag, searchQuery]);

  const activeCommunityObj = useMemo(() => {
    if (!selectedCommunityId) return null;
    return communities.find((c) => c.id === selectedCommunityId) || null;
  }, [communities, selectedCommunityId]);

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Vérification de l&apos;accès au fil citoyen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Community Filter Pills Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Users className="size-3.5" />
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Espaces &amp; Communautés
            </span>
          </div>
          {selectedCommunityId && (
            <button
              type="button"
              onClick={() => handleSelectCommunity(null)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400 active:scale-95 transition"
            >
              <X className="size-3" />
              <span>Afficher tout</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => handleSelectCommunity(null)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
              selectedCommunityId === null
                ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/20"
                : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            <Sparkles className="size-3" />
            <span>Tous les espaces ({posts.length})</span>
          </button>

          {communities.map((c) => {
            const countInCom = posts.filter((p) => p.communityId === c.id).length;
            const isSelected = selectedCommunityId === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCommunity(isSelected ? null : c.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                  isSelected
                    ? "bg-brand-600 text-white shadow-xs ring-2 ring-brand-500/20"
                    : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <MapPin className="size-3 text-brand-500" />
                <span>{c.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {countInCom}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Community Context Banner if filtered */}
      {activeCommunityObj && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-4 text-xs text-brand-950 dark:border-brand-900/50 dark:bg-brand-950/40 dark:text-brand-200 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
              <Building2 className="size-4" />
            </span>
            <div>
              <div className="font-bold text-sm text-gray-950 dark:text-white flex items-center gap-2">
                <span>{activeCommunityObj.name}</span>
                <span className="rounded-full bg-brand-200/80 px-2 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                  {activeCommunityObj.type === "TERRITORIAL" ? "Territoire Citoyen" : "Thématique"}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1 mt-0.5">
                {activeCommunityObj.description || "Espace citoyen officiel de partage et d'entraide."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedModalCommunityId(activeCommunityObj.id)}
              className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-1.5 font-bold text-brand-700 shadow-2xs hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-gray-800 active:scale-95 transition"
            >
              Fiche &amp; Associations &rarr;
            </button>
            <button
              type="button"
              onClick={() => handleSelectCommunity(null)}
              className="rounded-xl p-1.5 text-gray-500 hover:bg-brand-100 hover:text-gray-800 dark:hover:bg-brand-900/50 active:scale-95 transition"
              title="Retirer le filtre"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active Search Filter Banner if query param is set */}
      {searchQuery && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 text-xs text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Résultats de recherche pour : <strong>&laquo; {searchQuery} &raquo;</strong> ({filteredPosts.length} publication{filteredPosts.length > 1 ? "s" : ""})
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              router.push("/feed");
              showInfo("Filtre de recherche réinitialisé.");
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-sky-700 shadow-2xs hover:bg-sky-50 dark:bg-gray-900 dark:text-sky-300 active:scale-95 transition shrink-0"
          >
            <X className="size-3" />
            <span>Effacer</span>
          </button>
        </div>
      )}

      {/* Feed Composer Box */}
      <CitizenFeedComposer
        activeQuarter={activeCommunityObj?.name || "Bidossessi (Abomey-Calavi)"}
        selectedCommunityId={selectedCommunityId || undefined}
        onPostCreated={handlePostCreated}
      />

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => handleSelectCategory("ALL")}
          className={`rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
            filterTag === "ALL"
              ? "bg-brand-600 text-white shadow-xs"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          Toutes Catégories ({filteredPosts.length})
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory("ACTION")}
          className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
            filterTag === "ACTION"
              ? "bg-emerald-600 text-white shadow-xs"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          <Sprout className="size-3.5" />
          <span>Actions Citoyennes</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory("ENTRAIDE")}
          className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
            filterTag === "ENTRAIDE"
              ? "bg-sky-600 text-white shadow-xs"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          <Handshake className="size-3.5" />
          <span>Entraides &amp; Dons</span>
        </button>
        <button
          type="button"
          onClick={() => handleSelectCategory("AVIS")}
          className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition active:scale-95 ${
            filterTag === "AVIS"
              ? "bg-amber-600 text-white shadow-xs"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          }`}
        >
          <AlertTriangle className="size-3.5" />
          <span>Avis &amp; Alertes</span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <Users className="mx-auto size-8 text-gray-400" />
            <h4 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
              Aucune publication pour ce filtre
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              Soyez le premier à partager une initiative, un appel à l&apos;entraide ou un avis aux voisins !
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <CitizenPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSupport={handleSupport}
              onAddComment={handleAddComment}
              onOpenCommunityDetail={(communityId) => setSelectedModalCommunityId(communityId)}
            />
          ))
        )}
      </div>

      {/* Community Detail Modal */}
      <CommunityDetailModal
        communityId={selectedModalCommunityId}
        onClose={() => setSelectedModalCommunityId(null)}
      />
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
