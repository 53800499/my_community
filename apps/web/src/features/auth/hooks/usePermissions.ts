"use client";

import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
  AppPermission,
  PlatformRole,
  ROLE_PERMISSIONS,
} from "../types/permissions.types";

export interface UsePermissionsReturn {
  // Helpers booléens de rôles
  role: PlatformRole;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isSyndic: boolean;
  isPresident: boolean;
  isCitizen: boolean;

  // Contrôles d'habilitation granulaires (ISP & DIP)
  can: (permission: AppPermission) => boolean;
  canAny: (permissions: AppPermission[]) => boolean;
  canAll: (permissions: AppPermission[]) => boolean;
  hasRole: (roles: PlatformRole | PlatformRole[]) => boolean;

  // Raccourcis métier fréquemment sollicités
  isExecutive: boolean;
  canViewAssociationSecrets: boolean;
  canManageResidences: boolean;
  canManageAssociations: boolean;
  canManageFinances: boolean;
  canReviewProposals: boolean;
  canManageTerritories: boolean;
  canPublish: boolean;
  canComment: boolean;
}

/**
 * Hook dédié à la gestion fine des autorisations et des permissions (SRP & ISP).
 * Découple les écrans de la hiérarchie brute des rôles en exposant des prédicats expressifs.
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuth();

  const userRole: PlatformRole = useMemo(() => {
    if (!isAuthenticated || !user) return "CITIZEN";
    if (user.isSuperAdmin) return "SUPER_ADMIN";
    const rawRole = (user.role || "").toUpperCase();
    if (rawRole === "SUPER_ADMIN") return "SUPER_ADMIN";
    if (rawRole === "ADMIN") return "ADMIN";
    if (rawRole === "SYNDIC") return "SYNDIC";
    if (rawRole === "PRESIDENT") return "PRESIDENT";
    return "CITIZEN";
  }, [user, isAuthenticated]);

  const permissionsSet = useMemo(() => {
    const list = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.CITIZEN;
    return new Set<AppPermission>(list);
  }, [userRole]);

  const can = (permission: AppPermission): boolean => {
    if (!isAuthenticated) return false;
    return permissionsSet.has(permission);
  };

  const canAny = (permissions: AppPermission[]): boolean => {
    if (!isAuthenticated) return false;
    return permissions.some((p) => permissionsSet.has(p));
  };

  const canAll = (permissions: AppPermission[]): boolean => {
    if (!isAuthenticated) return false;
    return permissions.every((p) => permissionsSet.has(p));
  };

  const hasRole = (roles: PlatformRole | PlatformRole[]): boolean => {
    if (!isAuthenticated) return false;
    const array = Array.isArray(roles) ? roles : [roles];
    return array.includes(userRole);
  };

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdmin = userRole === "ADMIN" || isSuperAdmin;
  const isPresident = userRole === "PRESIDENT" || isSuperAdmin;
  const isExecutive = isSuperAdmin || isAdmin || isPresident || can("ASSOCIATION_VIEW_SECRETS");

  return {
    role: userRole,
    isSuperAdmin,
    isAdmin,
    isSyndic: userRole === "SYNDIC" || isSuperAdmin,
    isPresident,
    isCitizen: userRole === "CITIZEN",
    isExecutive,

    can,
    canAny,
    canAll,
    hasRole,

    canViewAssociationSecrets: can("ASSOCIATION_VIEW_SECRETS"),
    canManageResidences: can("RESIDENCE_MANAGE_ROOMS") || can("RESIDENCE_MANAGE_CONTRACTS"),
    canManageAssociations: can("ASSOCIATION_MANAGE_MEMBERS") || can("ASSOCIATION_MANAGE_FINANCE"),
    canManageFinances: can("ASSOCIATION_MANAGE_FINANCE") || can("FINANCE_MANAGE_EXPENSES"),
    canReviewProposals: can("COMMUNITY_REVIEW"),
    canManageTerritories: can("TERRITORIES_MANAGE"),
    canPublish: can("FEED_PUBLISH"),
    canComment: can("FEED_COMMENT"),
  };
}

export default usePermissions;
