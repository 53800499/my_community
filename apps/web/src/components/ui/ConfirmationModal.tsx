"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, X } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isAlert?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "danger",
  isAlert = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus confirm button when opened & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Auto-focus confirm button
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Icon and theme config according to variant
  const variantConfig = {
    danger: {
      defaultTitle: "Confirmation requise",
      icon: AlertTriangle,
      iconContainer:
        "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/50 shadow-sm shadow-rose-500/10",
      button:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-2 focus:ring-rose-500/40",
    },
    warning: {
      defaultTitle: "Avertissement",
      icon: AlertCircle,
      iconContainer:
        "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50 shadow-sm shadow-amber-500/10",
      button:
        "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 focus:ring-2 focus:ring-amber-500/40",
    },
    info: {
      defaultTitle: "Information",
      icon: Info,
      iconContainer:
        "bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/50 shadow-sm shadow-brand-500/10",
      button:
        "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 focus:ring-2 focus:ring-brand-500/40",
    },
    success: {
      defaultTitle: "Succès",
      icon: CheckCircle2,
      iconContainer:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 shadow-sm shadow-emerald-500/10",
      button:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 focus:ring-2 focus:ring-emerald-500/40",
    },
  }[variant];

  const IconComponent = variantConfig.icon;
  const modalTitle = title || variantConfig.defaultTitle;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fermer"
            className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="size-4" />
          </button>
        )}

        {/* Content */}
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Icon Badge */}
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${variantConfig.iconContainer}`}
            >
              <IconComponent className="size-6" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h3
                id="confirm-modal-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                {modalTitle}
              </h3>
              <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {message}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          {!isAlert && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-gray-300 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-750 dark:focus:ring-gray-700 sm:w-auto"
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-hidden disabled:opacity-50 sm:w-auto ${variantConfig.button}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Traitement...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
