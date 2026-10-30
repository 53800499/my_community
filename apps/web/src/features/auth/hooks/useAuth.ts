import { useState, useCallback, useEffect } from "react";
import { authApiService } from "../services/auth-api.service";
import { ApiAuthSuccess, RegisterInput } from "../types/auth.types";
import { ErrorParserService } from "@/features/errors";

export interface UseAuthReturn {
  currentUser: ApiAuthSuccess["user"] | null;
  user: ApiAuthSuccess["user"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  login: (identifier: string, password: string) => Promise<ApiAuthSuccess>;
  register: (input: RegisterInput) => Promise<ApiAuthSuccess>;
  logout: () => void;
}

/**
 * Custom Hook gérant la session, la connexion et l'inscription (SRP & DIP)
 * Découple les composants d'interface des appels réseau d'authentification.
 */
export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<ApiAuthSuccess["user"] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authApiService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticated(!!user || authApiService.isAuthenticated());
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<ApiAuthSuccess> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApiService.login(identifier, password);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err: unknown) {
      const parsed = ErrorParserService.parse(
        err,
        "Identifiants incorrects. Vérifiez votre numéro ou mot de passe."
      );
      setError(parsed.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<ApiAuthSuccess> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApiService.register(input);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      return res;
    } catch (err: unknown) {
      const parsed = ErrorParserService.parse(
        err,
        "Erreur lors de l'inscription. Vérifiez les informations saisies."
      );
      setError(parsed.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authApiService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    currentUser,
    user: currentUser,
    isAuthenticated,
    isLoading,
    error,
    setError,
    login,
    register,
    logout,
  };
}
