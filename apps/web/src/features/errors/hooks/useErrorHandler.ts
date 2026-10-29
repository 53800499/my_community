"use client";

import { useState, useCallback } from "react";
import { AppError } from "../types/error.types";
import { ErrorParserService } from "../services/error-parser.service";
import { useToast } from "../context/ToastContext";

export interface UseErrorHandlerOptions {
  showToastNotification?: boolean;
  logToConsole?: boolean;
}

export interface UseErrorHandlerReturn {
  error: AppError | null;
  hasError: boolean;
  handleError: (err: unknown, customTitle?: string) => AppError;
  clearError: () => void;
  setErrorDirectly: (error: AppError | null) => void;
}

/**
 * Hook modulaire pour capturer, analyser et présenter les erreurs aux utilisateurs.
 * Conforme SOLID (SRP & DIP) : délègue au parser et au service de notification.
 */
export function useErrorHandler(
  options: UseErrorHandlerOptions = { showToastNotification: true, logToConsole: true }
): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null);
  const { showError } = useToast();

  const handleError = useCallback(
    (err: unknown, customTitle?: string): AppError => {
      const parsed = ErrorParserService.parse(err);
      setError(parsed);

      if (options.logToConsole && process.env.NODE_ENV !== "production") {
        console.error("[useErrorHandler Captured]", parsed, err);
      }

      if (options.showToastNotification !== false) {
        showError(err, customTitle || parsed.title);
      }

      return parsed;
    },
    [options, showError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
    setErrorDirectly: setError,
  };
}

export default useErrorHandler;
