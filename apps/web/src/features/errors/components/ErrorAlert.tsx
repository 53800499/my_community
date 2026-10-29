"use client";

import React, { useState } from "react";
import { AppError } from "../types/error.types";
import {
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

export interface ErrorAlertProps {
  error: AppError | string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  onRetry,
  className = "",
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const title = typeof error === "string" ? "Attention" : error.title;
  const message = typeof error === "string" ? error : error.message;
  const severity = typeof error === "string" ? "warning" : error.severity;
  const technicalDetail =
    typeof error === "object" && error !== null ? error.technicalDetail : undefined;
  const action = typeof error === "object" && error !== null ? error.action : undefined;

  const handleCopy = () => {
    if (technicalDetail) {
      navigator.clipboard.writeText(technicalDetail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isError = severity === "error";

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 text-xs transition-all animate-in fade-in-50 duration-200 ${
        isError
          ? "border-rose-200 bg-rose-50/70 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
          : "border-amber-200 bg-amber-50/70 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-lg ${
            isError
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          }`}
        >
          {isError ? <AlertCircle className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
        </span>

        <div className="flex-1 space-y-1">
          <h4 className="font-bold text-xs">{title}</h4>
          <p className="leading-relaxed opacity-90">{message}</p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 font-bold shadow-2xs transition hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <RefreshCw className="size-3" />
                <span>Réessayer</span>
              </button>
            )}

            {action?.onClick && (
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 font-bold shadow-2xs transition hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <span>{action.label}</span>
              </button>
            )}

            {technicalDetail && (
              <button
                type="button"
                onClick={() => setShowTechnicalDetails((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold opacity-75 hover:opacity-100 transition underline underline-offset-2"
              >
                <span>Détails techniques</span>
                <ChevronDown
                  className={`size-3 transition-transform ${
                    showTechnicalDetails ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* Expandable Technical Details */}
          {showTechnicalDetails && technicalDetail && (
            <div className="mt-2.5 rounded-xl border border-black/5 bg-black/5 p-3 font-mono text-[10px] dark:border-white/5 dark:bg-black/30">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-gray-500">Rapport d&apos;anomalie</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  <span>{copied ? "Copié !" : "Copier"}</span>
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all pt-1 leading-normal">
                {technicalDetail}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
