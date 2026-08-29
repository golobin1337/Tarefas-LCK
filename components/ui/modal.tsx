"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerActions?: React.ReactNode;
  maxWidthClassName?: string;
  children: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  headerActions,
  maxWidthClassName,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10 sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
        tabIndex={-1}
      />
      <div
        className={`relative z-10 w-full ${maxWidthClassName ?? "max-w-md"} rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-xl`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-3.5">
          <div className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-text)]">
            {title}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
