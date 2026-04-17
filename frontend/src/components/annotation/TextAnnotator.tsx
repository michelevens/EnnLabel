'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Annotation, Label } from '@/types';
import { cn } from '@/lib/utils';

interface TextAnnotatorProps {
  text: string;
  annotations: Annotation[];
  labels: Label[];
  selectedLabel: Label | null;
  onAnnotationCreate: (data: {
    label_id: string;
    start_offset: number;
    end_offset: number;
    selected_text: string;
  }) => void;
  onAnnotationDelete: (id: string) => void;
  readOnly?: boolean;
}

export default function TextAnnotator({
  text,
  annotations,
  labels,
  selectedLabel,
  onAnnotationCreate,
  onAnnotationDelete,
  readOnly = false,
}: TextAnnotatorProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);

  const handleMouseUp = useCallback(() => {
    if (readOnly || !selectedLabel) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !textRef.current) return;

    const range = selection.getRangeAt(0);
    const textNode = textRef.current;

    // Calculate offsets relative to the text content
    const preRange = document.createRange();
    preRange.setStart(textNode, 0);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const endOffset = startOffset + selectedText.length;

    onAnnotationCreate({
      label_id: selectedLabel.id,
      start_offset: startOffset,
      end_offset: endOffset,
      selected_text: selectedText,
    });

    selection.removeAllRanges();
  }, [selectedLabel, onAnnotationCreate, readOnly]);

  // Build rendered segments with annotation highlights
  const renderAnnotatedText = () => {
    if (annotations.length === 0) {
      return <span>{text}</span>;
    }

    // Sort annotations by start offset
    const sorted = [...annotations].sort((a, b) => a.start_offset - b.start_offset);
    const segments: JSX.Element[] = [];
    let lastEnd = 0;

    sorted.forEach((ann) => {
      // Add unannotated text before this annotation
      if (ann.start_offset > lastEnd) {
        segments.push(
          <span key={`text-${lastEnd}`}>{text.slice(lastEnd, ann.start_offset)}</span>
        );
      }

      // Add annotated span
      const label = labels.find((l) => l.id === ann.label_id);
      segments.push(
        <span
          key={ann.id}
          className={cn(
            'relative cursor-pointer rounded px-0.5 transition-all',
            hoveredAnnotation === ann.id && 'ring-2 ring-offset-1'
          )}
          style={{
            backgroundColor: `${label?.color || '#3B82F6'}30`,
            borderBottom: `2px solid ${label?.color || '#3B82F6'}`,
          }}
          onMouseEnter={() => setHoveredAnnotation(ann.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
          title={`${label?.name || 'Unknown'} — click to remove`}
          onClick={() => {
            if (!readOnly) onAnnotationDelete(ann.id);
          }}
        >
          {text.slice(ann.start_offset, ann.end_offset)}
          {hoveredAnnotation === ann.id && (
            <span
              className="absolute -top-6 left-0 text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap z-10"
              style={{ backgroundColor: label?.color || '#3B82F6' }}
            >
              {label?.name}
              {label?.code && ` (${label.code})`}
            </span>
          )}
        </span>
      );

      lastEnd = ann.end_offset;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      segments.push(<span key={`text-${lastEnd}`}>{text.slice(lastEnd)}</span>);
    }

    return segments;
  };

  // Keyboard shortcuts for labels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const label = labels.find((l) => l.shortcut_key === e.key);
      if (label) {
        // This would need to be lifted to parent for full implementation
        // For now, labels with shortcuts are highlighted in the panel
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [labels, readOnly]);

  return (
    <div
      ref={textRef}
      onMouseUp={handleMouseUp}
      className={cn(
        'text-base leading-relaxed whitespace-pre-wrap p-6 rounded-lg border',
        'bg-white select-text',
        readOnly ? 'cursor-default' : 'cursor-text',
        !selectedLabel && !readOnly && 'border-yellow-300 bg-yellow-50/30'
      )}
    >
      {!selectedLabel && !readOnly && (
        <p className="text-sm text-yellow-600 mb-4 font-medium">
          Select a label from the right panel before highlighting text
        </p>
      )}
      {renderAnnotatedText()}
    </div>
  );
}
