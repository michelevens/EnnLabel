'use client';

import { useEffect, useCallback } from 'react';
import type { Label } from '@/types';

interface UseAnnotationShortcutsProps {
  labels: Label[];
  onSelectLabel: (label: Label) => void;
  onSubmit?: () => void;
  enabled?: boolean;
}

export function useAnnotationShortcuts({
  labels,
  onSelectLabel,
  onSubmit,
  enabled = true,
}: UseAnnotationShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Label shortcuts
      const label = labels.find((l) => l.shortcut_key === e.key);
      if (label) {
        e.preventDefault();
        onSelectLabel(label);
        return;
      }

      // Submit shortcut (Ctrl+Enter)
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [labels, onSelectLabel, onSubmit, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
