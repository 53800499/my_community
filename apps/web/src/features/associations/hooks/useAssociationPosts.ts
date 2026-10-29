'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AssociationPost, CreatePostInput, UpdatePostInput } from '../domain/association.types';
import { associationApiService } from '../services/association-api.service';

/**
 * Hook Découplé : Gestion des Publications Officielles & Communiqués de l'Association (SRP)
 */
export function useAssociationPosts(associationId?: string) {
  const [posts, setPosts] = useState<AssociationPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!associationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await associationApiService.listPosts(associationId);
      setPosts(list);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement des communiqués.');
    } finally {
      setIsLoading(false);
    }
  }, [associationId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(
    async (input: CreatePostInput): Promise<AssociationPost> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const created = await associationApiService.createPost(associationId, input);
        setPosts((prev) => [created, ...prev]);
        return created;
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const updatePost = useCallback(
    async (postId: string, input: UpdatePostInput): Promise<AssociationPost> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const updated = await associationApiService.updatePost(associationId, postId, input);
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const deletePost = useCallback(
    async (postId: string): Promise<void> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        await associationApiService.deletePost(associationId, postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const togglePinPost = useCallback(
    async (postId: string): Promise<AssociationPost> => {
      if (!associationId) throw new Error('Association introuvable.');
      setIsSubmitting(true);
      try {
        const updated = await associationApiService.togglePinPost(associationId, postId);
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
        return updated;
      } finally {
        setIsSubmitting(false);
      }
    },
    [associationId],
  );

  const pinnedPosts = useMemo(() => posts.filter((p) => p.pinned), [posts]);
  const regularPosts = useMemo(() => posts.filter((p) => !p.pinned), [posts]);

  return {
    posts,
    pinnedPosts,
    regularPosts,
    isLoading,
    isSubmitting,
    error,
    createPost,
    updatePost,
    deletePost,
    togglePinPost,
    reload: loadPosts,
  };
}
