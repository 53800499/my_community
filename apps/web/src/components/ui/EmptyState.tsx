import React from "react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center backdrop-blur-xs transition dark:border-gray-800 dark:bg-gray-900/40 sm:p-12 ${className}`}
    >
      {Icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-50 to-indigo-50/80 text-brand-600 shadow-xs ring-8 ring-brand-50/50 dark:from-brand-950/60 dark:to-indigo-950/40 dark:text-brand-400 dark:ring-brand-950/20">
          <Icon className="size-7" />
        </div>
      )}

      <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 transition hover:from-brand-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              {action.icon && <action.icon className="size-4" />}
              <span>{action.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
