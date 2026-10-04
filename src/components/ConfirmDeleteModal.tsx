import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  message,
  confirmText = 'Yes, Delete Permanently',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  // Handle keyboard Escape to cancel and Enter to confirm
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-[#0E141B] border border-[#FF4655]/40 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3.5 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-red-500/15 border border-red-500/40 text-[#FF4655]'
                : 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
            }`}
          >
            {isDestructive ? (
              <Trash2 className="w-5 h-5 text-[#FF4655]" />
            ) : (
              <RefreshCw className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-white font-display"
            >
              {title}
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              Admin Confirmation Required
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2 mb-6">
          {itemName && (
            <div className="p-2.5 rounded-lg bg-[#080B0F] border border-[#1F2833] text-xs font-mono text-white flex items-center gap-2">
              <span className="text-[#FF4655] font-bold">Target:</span>
              <span className="truncate">{itemName}</span>
            </div>
          )}

          <p className="text-xs text-zinc-300 leading-relaxed">
            {message ||
              `Are you sure you want to permanently remove this item from your portfolio? This action cannot be undone.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1F2833]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono text-zinc-300 hover:text-white bg-[#080B0F] hover:bg-zinc-800 border border-[#1F2833] rounded-lg transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white rounded-lg shadow-lg transition-all ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/25 active:scale-98'
                : 'bg-[#FF4655] hover:bg-[#ff5a68] shadow-[#FF4655]/25 active:scale-98'
            }`}
          >
            {isDestructive ? <Trash2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
