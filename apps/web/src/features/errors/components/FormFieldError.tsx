"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export interface FormFieldErrorProps {
  error?: string | string[] | null;
  className?: string;
}

export const FormFieldError: React.FC<FormFieldErrorProps> = ({
  error,
  className = "",
}) => {
  if (!error) return null;

  const messages = Array.isArray(error) ? error : [error];
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-1.5 pt-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 animate-in fade-in-50 duration-150 ${className}`}
    >
      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {messages.map((msg, idx) => (
          <p key={idx} className="leading-tight">
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
};

export default FormFieldError;
