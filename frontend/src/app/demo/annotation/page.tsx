'use client';

import { useState, useCallback } from 'react';
import TextAnnotator from '@/components/annotation/TextAnnotator';
import LabelPanel from '@/components/annotation/LabelPanel';
import Badge from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { useAnnotationShortcuts } from '@/hooks/useKeyboard';
import { demoTask, demoLabels, demoAnnotations } from '@/lib/demo-data';
import type { Annotation, Label } from '@/types';
import Link from 'next/link';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function DemoAnnotationPage() {
  const [annotations, setAnnotations] = useState<Annotation[]>(demoAnnotations);
  const [selectedLabel, setSelectedLabel] = useState<Label>(demoLabels[0]);
  const [showToast, setShowToast] = useState('');

  useAnnotationShortcuts({
    labels: demoLabels,
    onSelectLabel: setSelectedLabel,
    enabled: true,
  });

  const handleAnnotationCreate = useCallback((data: {
    label_id: string;
    start_offset: number;
    end_offset: number;
    selected_text: string;
  }) => {
    const label = demoLabels.find((l) => l.id === data.label_id);
    const newAnnotation: Annotation = {
      id: `demo-${Date.now()}`,
      task_id: demoTask.id,
      data_record_id: demoTask.data_record_id,
      label_id: data.label_id,
      annotator_id: 'demo-user-1',
      start_offset: data.start_offset,
      end_offset: data.end_offset,
      selected_text: data.selected_text,
      metadata: null,
      is_current: true,
      label: label || demoLabels[0],
      annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' },
      created_at: new Date().toISOString(),
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setShowToast(`Added "${data.selected_text}" as ${label?.name}`);
    setTimeout(() => setShowToast(''), 2000);
  }, []);

  const handleAnnotationDelete = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setShowToast('Annotation removed');
    setTimeout(() => setShowToast(''), 2000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <span className="font-medium">Interactive Demo</span> — highlight text and apply clinical labels.{' '}
        <Link href={basePath || '/'} className="underline hover:no-underline">
          Back to home
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={basePath || '/'} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-gray-900">EnnLabel</span>
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">Annotation Task</h1>
                <Badge status="in_progress" />
              </div>
              <p className="text-xs text-gray-500">
                Dataset: {demoTask.dataset?.name} · Taxonomy: {demoTask.taxonomy?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Chen</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <Button size="sm" onClick={() => {
              setShowToast('Demo: Task would be submitted for review');
              setTimeout(() => setShowToast(''), 3000);
            }}>
              Submit for Review
            </Button>
          </div>
        </div>
      </div>

      {/* Annotation Interface */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Panel */}
          <div className="lg:col-span-2">
            <TextAnnotator
              text={demoTask.data_record?.content || ''}
              annotations={annotations}
              labels={demoLabels}
              selectedLabel={selectedLabel}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationDelete={handleAnnotationDelete}
              readOnly={false}
            />
            <p className="text-xs text-gray-400 mt-3">
              Select a label from the right panel (or press 1-6), then highlight text to annotate. Click an annotation to remove it.
            </p>
          </div>

          {/* Label Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <LabelPanel
              labels={demoLabels}
              selectedLabel={selectedLabel}
              onSelectLabel={setSelectedLabel}
              annotations={annotations}
              onDeleteAnnotation={handleAnnotationDelete}
              readOnly={false}
            />
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-pulse">
          {showToast}
        </div>
      )}
    </div>
  );
}
