"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  HeartIcon,
  MessageSquareIcon,
  ShareIcon,
  ThumbsUpIcon,
  MapPinIcon,
} from "@/components/icons";
import { Camera, Lock } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useToast } from "@/features/errors";
import { useRouter } from "next/navigation";

export interface CommentItem {
  id: string;
  author: string;
  authorAvatar: string;
  timeAgo: string;
  text: string;
}

export interface PostData {
  id: string;
  communityId?: string;
  author: string;
  avatarText: string;
  authorRole: string;
  quarter: string;
  timeAgo: string;
  tag: string;
  tagColor: "primary" | "success" | "warning" | "info";
  content: string;
  hasImage?: boolean;
  imageCaption?: string;
  likes: number;
  supports: number;
  comments: CommentItem[];
  isLiked?: boolean;
  isSupported?: boolean;
}

interface CitizenPostCardProps {
  post: PostData;
  onLike: (id: string) => void;
  onSupport: (id: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCommunityDetail?: (communityId: string) => void;
}

export const CitizenPostCard: React.FC<CitizenPostCardProps> = ({
  post,
  onLike,
  onSupport,
  onAddComment,
  onOpenCommunityDetail,
}) => {
  const { isAuthenticated } = useAuth();
  const { showSuccess, showInfo } = useToast();
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [copiedShare, setCopiedShare] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/feed");
      return;
    }
    onLike(post.id);
    if (post.isLiked) {
      showInfo("Mention J'aime retirée.", "Réaction");
    } else {
      showSuccess("Vous aimez cette publication !", "Mention J'aime");
    }
  };

  const handleSupport = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/feed");
      return;
    }
    onSupport(post.id);
    if (post.isSupported) {
      showInfo("Soutien citoyen retiré.", "Soutien");
    } else {
      showSuccess("Vous avez soutenu cette initiative citoyenne !", "Soutien citoyen");
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/login?redirect=/feed");
      return;
    }
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText);
    setNewCommentText("");
    setShowComments(true);
    showSuccess("Votre commentaire a été publié avec succès !", "Commentaire ajouté");
  };

  const handleShare = () => {
    try {
      if (typeof window !== "undefined" && navigator?.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
      }
    } catch {
      // Ignorer
    }
    setCopiedShare(true);
    showSuccess("Lien de la publication copié dans le presse-papiers !", "Partagé");
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleToggleComments = () => {
    setShowComments((prev) => {
      const next = !prev;
      if (next) {
        showInfo(`Affichage des commentaires (${post.comments.length}).`, "Commentaires");
      }
      return next;
    });
  };

  return (
    <article className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-700 font-bold text-white shadow-xs">
            {post.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                {post.author}
              </h4>
              <span className="inline-flex size-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <button
                type="button"
                onClick={() => onOpenCommunityDetail?.(post.communityId || "4f79ff2c-c965-4af7-a99e-de4e4bf457dc")}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                {post.authorRole}
              </button>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <MapPinIcon className="size-3 text-rose-500" />
                {post.quarter}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="light" color={post.tagColor} size="sm">
            {post.tag}
          </Badge>
          <span className="text-[11px] text-gray-400 whitespace-nowrap">
            {post.timeAgo}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 text-xs leading-relaxed text-gray-800 dark:text-gray-200 space-y-2 whitespace-pre-line">
        {post.content}
      </div>

      {/* Attached Image Illustration Card if present */}
      {post.hasImage && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-brand-50 via-indigo-50/50 to-emerald-50/30 p-5 dark:border-gray-800 dark:from-brand-950/40 dark:via-indigo-950/20 dark:to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Camera className="size-3.5 text-brand-600 shrink-0" />
              <span>Action Citoyenne sur le Terrain</span>
            </span>
            <Badge variant="light" color="success" size="sm">Vérifiée</Badge>
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {post.imageCaption || "Prise de vue des travaux d'aménagement et de salubrité coordonnés par le comité de quartier."}
          </p>
        </div>
      )}

      {/* Reactions Bar */}
      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Heart / J'aime */}
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
              post.isLiked
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <HeartIcon className="size-4" />
            <span>{post.likes}</span>
          </button>

          {/* Soutien / Utile */}
          <button
            type="button"
            onClick={handleSupport}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
              post.isSupported
                ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <ThumbsUpIcon className="size-4" />
            <span className="hidden sm:inline">Utile</span>
            <span>({post.supports})</span>
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Comments Toggle */}
          <button
            type="button"
            onClick={handleToggleComments}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              showComments
                ? "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-bold"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <MessageSquareIcon className="size-4" />
            <span>{post.comments.length} avis</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
              copiedShare
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <ShareIcon className="size-4" />
            <span>{copiedShare ? "Lien copié !" : "Partager"}</span>
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="mt-4 space-y-3 border-t border-gray-100 pt-3 dark:border-gray-800">
          {/* Comments List */}
          {post.comments.length > 0 ? (
            <ul className="space-y-2.5">
              {post.comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 text-xs dark:border-gray-800 dark:bg-gray-800/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 text-[10px] dark:bg-indigo-950/60 dark:text-indigo-300">
                        {c.authorAvatar}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {c.author}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{c.timeAgo}</span>
                  </div>
                  <p className="mt-1.5 text-gray-700 dark:text-gray-300">
                    {c.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-xs text-gray-400 py-2">
              Soyez le premier voisin à réagir à cette publication !
            </p>
          )}

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={
                isAuthenticated
                  ? "Écrire une réponse bienveillante à votre voisin..."
                  : "Connectez-vous pour répondre à votre voisin..."
              }
              onClick={() => {
                if (!isAuthenticated) router.push("/login?redirect=/feed");
              }}
              readOnly={!isAuthenticated}
              className="h-9 flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={isAuthenticated && !newCommentText.trim()}
              className="rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700 disabled:opacity-40"
            >
              {isAuthenticated ? "Envoyer" : "Connexion"}
            </button>
          </form>
        </div>
      )}
    </article>
  );
};

export default CitizenPostCard;
