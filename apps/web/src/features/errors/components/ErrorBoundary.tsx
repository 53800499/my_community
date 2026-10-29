"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary caught an unhandled crash]", error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="size-7" />
          </div>

          <h2 className="mt-4 text-xl font-black tracking-tight text-gray-950 dark:text-white">
            Une anomalie inattendue s&apos;est produite
          </h2>

          <p className="mt-2 max-w-md text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            L&apos;application a rencontré une interruption temporaire. Vos données enregistrées demeurent en sécurité.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand-700"
            >
              <RefreshCw className="size-3.5" />
              <span>Recharger l&apos;application</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
            >
              <Home className="size-3.5" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
