"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { MoonIcon, SunIcon } from "@/components/icons";

export const ThemeToggleButton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Basculer le mode sombre / clair"
      className={`relative inline-flex items-center justify-center size-10 rounded-xl border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
    >
      {theme === "dark" ? (
        <SunIcon className="size-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-90" />
      ) : (
        <MoonIcon className="size-5 text-gray-600 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
