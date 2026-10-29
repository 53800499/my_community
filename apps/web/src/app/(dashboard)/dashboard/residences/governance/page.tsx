import React, { Suspense } from 'react';
import { ResidenceGovernanceClient } from './ResidenceGovernanceClient';

export default function ResidenceGovernancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-xs font-medium text-gray-500">Chargement de la gouvernance...</p>
          </div>
        </div>
      }
    >
      <ResidenceGovernanceClient />
    </Suspense>
  );
}
