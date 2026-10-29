"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastMessage, AppError } from "../types/error.types";
import { ErrorParserService } from "../services/error-parser.service";
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => string;
  showError: (error: unknown, fallbackTitle?: string) => AppError;
  showSuccess: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastMessage, "id">): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const duration = toast.duration ?? 5000;

      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const showError = useCallback(
    (error: unknown, fallbackTitle?: string): AppError => {
      const parsed = ErrorParserService.parse(error);
      const title = fallbackTitle || parsed.title;

      showToast({
        title,
        message: parsed.message,
        type: parsed.severity,
        action: parsed.action,
        duration: 7000,
      });

      return parsed;
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, title = "Opération réussie"): string => {
      return showToast({
        title,
        message,
        type: "success",
        duration: 4000,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = "Attention"): string => {
      return showToast({
        title,
        message,
        type: "warning",
        duration: 6000,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = "Information"): string => {
      return showToast({
        title,
        message,
        type: "info",
        duration: 4500,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        dismissToast,
      }}
    >
      {children}

      {/* Floating Toast Container (Top-Right, Ergonomic & Accessible) */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:max-w-md"
      >
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 ${
                isError
                  ? "border-rose-200/90 bg-white/95 text-gray-900 dark:border-rose-900/60 dark:bg-gray-900/95 dark:text-white"
                  : isSuccess
                  ? "border-emerald-200/90 bg-white/95 text-gray-900 dark:border-emerald-900/60 dark:bg-gray-900/95 dark:text-white"
                  : isWarning
                  ? "border-amber-200/90 bg-white/95 text-gray-900 dark:border-amber-900/60 dark:bg-gray-900/95 dark:text-white"
                  : "border-sky-200/90 bg-white/95 text-gray-900 dark:border-sky-900/60 dark:bg-gray-900/95 dark:text-white"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                  isError
                    ? "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                    : isSuccess
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    : isWarning
                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                    : "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
                }`}
              >
                {isError && <AlertCircle className="size-4" />}
                {isSuccess && <CheckCircle2 className="size-4" />}
                {isWarning && <AlertTriangle className="size-4" />}
                {!isError && !isSuccess && !isWarning && <Info className="size-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-0.5 pt-0.5">
                <h4 className="text-xs font-bold leading-tight tracking-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                  {toast.message}
                </p>

                {/* Optional Action Button */}
                {toast.action && (
                  <div className="pt-1.5">
                    {toast.action.href ? (
                      <Link
                        href={toast.action.href}
                        onClick={() => dismissToast(toast.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        <span>{toast.action.label}</span>
                        <ExternalLink className="size-3" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          toast.action?.onClick?.();
                          dismissToast(toast.id);
                        }}
                        className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
                      >
                        {toast.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-1 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Fermer la notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé à l'intérieur d'un <ToastProvider />");
  }
  return context;
};
