"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import SuccessModal from "../SuccessModal";
import DeleteConfirmModal from "../DeleteConfirmModal";
import ErrorModal from "../ErrorModal";

type SuccessState = {
  open: boolean;
  title?: string;
  message?: string;
};

type ErrorState = {
  open: boolean;
  title?: string;
  message?: string;
};

type DeleteState = {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm?: () => void;
};

type ModalContextType = {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  confirmDelete: (title: string, description: string, onConfirm: () => void) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [success, setSuccess] = useState<SuccessState>({ open: false });
  const [error, setError] = useState<ErrorState>({ open: false });
  const [deleteState, setDeleteState] = useState<DeleteState>({ open: false });

  const successModal = (title: string, message?: string) => {
    setSuccess({ open: true, title, message });
  };

  const errorModal = (title: string, message?: string) => {
    setError({ open: true, title, message });
  };

  const confirmDelete = (title: string, description: string, onConfirm: () => void) => {
    setDeleteState({
      open: true,
      title,
      description,
      onConfirm,
    });
  };

  return (
    <ModalContext.Provider
      value={{
        success: successModal,
        error: errorModal,
        confirmDelete,
      }}
    >
      {children}

      {/* Success */}
      <SuccessModal
        open={success.open}
        title={success.title}
        message={success.message}
        onClose={() => setSuccess({ open: false })}
      />

      {/* Error */}
      <ErrorModal
        open={error.open}
        title={error.title}
        message={error.message}
        onClose={() => setError({ open: false })}
      />

      {/* Delete */}
      <DeleteConfirmModal
        open={deleteState.open}
        title={deleteState.title}
        description={deleteState.description}
        onClose={() => setDeleteState({ open: false })}
        onConfirm={() => {
          // đóng trước để UI mượt hơn
          const fn = deleteState.onConfirm;
          setDeleteState({ open: false });
          fn?.();
        }}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
}
