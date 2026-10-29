import React, { Suspense } from "react";
import { ModernAuthContainer } from "@/components/auth/ModernAuthContainer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | My Community Bénin",
  description:
    "Rejoignez la plateforme citoyenne et territoriale officielle du Bénin. Participez aux concertations locales et accédez à vos services de proximité.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        </div>
      }
    >
      <ModernAuthContainer initialMode="register" />
    </Suspense>
  );
}
