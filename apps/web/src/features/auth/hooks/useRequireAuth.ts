"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";
import { usePermissions } from "./usePermissions";
import { AppPermission, PlatformRole } from "../types/permissions.types";

export interface UseRequireAuthOptions {
  redirectTo?: string;
  requiredRoles?: PlatformRole[];
  requiredPermissions?: AppPermission[];
}

export interface UseRequireAuthReturn {
  isAuthorized: boolean;
  isLoading: boolean;
}

/**
 * Hook de garde d'authentification et d'autorisation client (SRP).
 * Intercepte les pages sensibles, vérifie les habilitations et redirige avec URL de retour.
 */
export function useRequireAuth(
  options: UseRequireAuthOptions = {}
): UseRequireAuthReturn {
  const { redirectTo = "/login", requiredRoles, requiredPermissions } = options;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasRole, can } = usePermissions();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRoleAuthorized = !requiredRoles || hasRole(requiredRoles);
  const isPermissionAuthorized =
    !requiredPermissions || requiredPermissions.every((p) => can(p));

  const isAuthorized =
    isAuthenticated && isRoleAuthorized && isPermissionAuthorized;

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?redirect=${returnUrl}`);
    } else if (!isRoleAuthorized || !isPermissionAuthorized) {
      // Authentifié mais rôle insuffisant : redirection vers le dashboard d'accueil
      router.replace("/dashboard");
    }
  }, [
    mounted,
    authLoading,
    isAuthenticated,
    isRoleAuthorized,
    isPermissionAuthorized,
    router,
    redirectTo,
    pathname,
  ]);

  return {
    isAuthorized: mounted && !authLoading && isAuthorized,
    isLoading: !mounted || authLoading,
  };
}

export default useRequireAuth;
