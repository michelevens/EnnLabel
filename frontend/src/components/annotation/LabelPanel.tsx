'use client';

import type { Annotation, Label } from '@/types';
import { cn } from '@/lib/utils';

interface LabelPanelProps {
  labels: Label[];
  selectedLabel: Label | null;
  onSelectLabel: (label: Label) => void;
  annotations: Annotation[];
  onDeleteAnnotation: (id: string) => void;
  readOnly?: boolean;
}

export default function LabelPanel({
  labels,
  selectedLabel,
  onSelectLabel,
  annotations,
  onDeleteAnnotation,
  readOnly = false,
}: LabelPanelProps) {
  // Count annotations per label
  const labelCounts = annotations.reduce<Record<string, number>>((acc, ann) => {
    acc[ann.label_id] = (acc[ann.label_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Label Selection */}
      {!readOnly && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Labels</h3>
          <div className="space-y-1">
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => onSelectLabel(label)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all',
                  selectedLabel?.id === label.id
                    ? 'ring-2 ring-offset-1 font-medium'
                    : 'hover:bg-gray-50'
                )}
                style={{
                  backgroundColor:
                    selectedLabel?.id === label.id ? `${label.color}20` : undefined,
                  ringColor: selectedLabel?.id === label.id ? label.color : undefined,
                }}
              >
                <div className="flex items-center">
                  <span
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-gray-900">{label.name}</span>
                  {label.code && (
                    <span className="ml-1.5 text-xs text-gray-400">{label.code}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {label.shortcut_key && (
                    <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border text-gray-500">
                      {label.shortcut_key}
                    </kbd>
                  )}
                  {labelCounts[label.id] && (
                    <span className="text-xs text-gray-400">{labelCounts[label.id]}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Annotations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Annotations ({annotations.length})
        </h3>
        {annotations.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No annotations yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {annotations.map((ann) => {
              const label = labels.find((l) => l.id === ann.label_id);
              return (
                <div
                  key={ann.id}
                  className="flex items-start justify-between p-2 rounded border bg-white text-sm group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: label?.color }}
                      />
                      <span className="font-medium text-gray-700 truncate">
                        {label?.name}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-0.5 truncate">
                      &ldquo;{ann.selected_text}&rdquo;
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      [{ann.start_offset}:{ann.end_offset}]
                    </p>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => onDeleteAnnotation(ann.id)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      title="Remove annotation"
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
