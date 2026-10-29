"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  ConfirmationModal,
  ConfirmVariant,
} from "@/components/ui/ConfirmationModal";

export interface ConfirmOptions {
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface AlertOptions {
  title?: string;
  message: ReactNode;
  buttonText?: string;
  variant?: ConfirmVariant;
}

export interface ConfirmationContextType {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

interface ModalState {
  isOpen: boolean;
  isAlert: boolean;
  title?: string;
  message: ReactNode;
  confirmText: string;
  cancelText: string;
  variant: ConfirmVariant;
}

const initialModalState: ModalState = {
  isOpen: false,
  isAlert: false,
  title: undefined,
  message: "",
  confirmText: "Confirmer",
  cancelText: "Annuler",
  variant: "danger",
};

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  // Store promise resolvers in refs to avoid re-renders and stale closures
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const alertResolverRef = useRef<(() => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;

      if (typeof options === "string") {
        setModalState({
          isOpen: true,
          isAlert: false,
          title: "Confirmation requise",
          message: options,
          confirmText: "Confirmer",
          cancelText: "Annuler",
          variant: "danger",
        });
      } else {
        setModalState({
          isOpen: true,
          isAlert: false,
          title: options.title,
          message: options.message,
          confirmText: options.confirmText || "Confirmer",
          cancelText: options.cancelText || "Annuler",
          variant: options.variant || "danger",
        });
      }
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      alertResolverRef.current = resolve;

      if (typeof options === "string") {
        setModalState({
          isOpen: true,
          isAlert: true,
          title: "Information",
          message: options,
          confirmText: "Compris",
          cancelText: "",
          variant: "info",
        });
      } else {
        setModalState({
          isOpen: true,
          isAlert: true,
          title: options.title,
          message: options.message,
          confirmText: options.buttonText || "Compris",
          cancelText: "",
          variant: options.variant || "info",
        });
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }
    if (alertResolverRef.current) {
      alertResolverRef.current();
      alertResolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
    if (alertResolverRef.current) {
      alertResolverRef.current();
      alertResolverRef.current = null;
    }
  }, []);

  return (
    <ConfirmationContext.Provider value={{ confirm, alert }}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        isAlert={modalState.isAlert}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmationProvider");
  }
  return context;
}

export default ConfirmationContext;
