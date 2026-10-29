import React, { Suspense } from "react";
import { ModernAuthContainer } from "@/components/auth/ModernAuthContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | My Community Bénin",
  description:
    "Espace de connexion unifié et souverain pour les citoyens, délégués territoriaux et gestionnaires de résidences de la République du Bénin.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <ModernAuthContainer initialMode="login" />
    </Suspense>
  );
}
