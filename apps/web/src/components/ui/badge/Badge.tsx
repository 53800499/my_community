import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium transition-colors";

  const sizeStyles = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-2.5",
  };

  const variants = {
    light: {
      primary:
        "bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800/40",
      success:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40",
      error:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40",
      warning:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40",
      info: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40",
      light:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700",
      dark: "bg-gray-800 text-gray-100 dark:bg-gray-900 dark:text-gray-200 border border-gray-700",
    },
    solid: {
      primary: "bg-brand-600 text-white shadow-xs",
      success: "bg-emerald-600 text-white shadow-xs",
      error: "bg-rose-600 text-white shadow-xs",
      warning: "bg-amber-600 text-white shadow-xs",
      info: "bg-sky-600 text-white shadow-xs",
      light: "bg-gray-200 text-gray-800",
      dark: "bg-gray-900 text-white",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles} ${className}`}>
      {startIcon && <span className="inline-flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="inline-flex items-center">{endIcon}</span>}
    </span>
  );
};

export default Badge;
