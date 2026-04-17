'use client';

import { useState } from 'react';
import Badge from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { demoLabels, demoAnnotations } from '@/lib/demo-data';
import Link from 'next/link';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const clinicalNote = `Patient presents with a 3-month history of persistent low mood, decreased energy, and difficulty concentrating at work. She reports significant sleep disturbance, waking at 3 AM most nights and unable to return to sleep. Appetite has decreased with an approximate 8-pound weight loss over the past 6 weeks.

Patient describes feelings of worthlessness and guilt related to her inability to perform at her previous level at work. She denies suicidal ideation but reports passive thoughts of "not wanting to be here anymore."`;

export default function DemoReviewPage() {
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const renderAnnotatedText = () => {
    const annotations = demoAnnotations.filter(a => a.start_offset < clinicalNote.length);
    const sorted = [...annotations].sort((a, b) => a.start_offset - b.start_offset);
    const segments: JSX.Element[] = [];
    let lastEnd = 0;

    sorted.forEach((ann) => {
      if (ann.start_offset > lastEnd) {
        segments.push(<span key={`t-${lastEnd}`}>{clinicalNote.slice(lastEnd, ann.start_offset)}</span>);
      }
      const label = demoLabels.find(l => l.id === ann.label_id);
      segments.push(
        <span
          key={ann.id}
          className="px-0.5 rounded"
          style={{
            backgroundColor: `${label?.color}30`,
            borderBottom: `2px solid ${label?.color}`,
          }}
        >
          {clinicalNote.slice(ann.start_offset, Math.min(ann.end_offset, clinicalNote.length))}
        </span>
      );
      lastEnd = Math.min(ann.end_offset, clinicalNote.length);
    });

    if (lastEnd < clinicalNote.length) {
      segments.push(<span key={`t-${lastEnd}`}>{clinicalNote.slice(lastEnd)}</span>);
    }

    return segments;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-purple-600 text-white text-center py-2 text-sm">
        <span className="font-medium">Clinical Review Demo</span> — approve or reject annotations.{' '}
        <Link href={basePath || '/'} className="underline hover:no-underline">Back to home</Link>
        {' · '}
        <Link href={`${basePath}/demo/annotation`} className="underline hover:no-underline">Try Annotation</Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">Clinical Review</h1>
              <Badge status="under_review" />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Annotated by: Maria Santos · Dataset: Clinical Notes Q1 · Record #1847
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Dr. James Wilson</p>
            <p className="text-xs text-gray-500">Clinician Reviewer</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">&#10003;</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Submitted</h2>
            <p className="text-gray-500 mb-6">
              Decision: <span className="font-medium capitalize">{decision.replace(/_/g, ' ')}</span>
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={() => { setSubmitted(false); setDecision(''); setComments(''); }}>
                Review Another
              </Button>
              <Link href={`${basePath}/demo/dashboard`}>
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Annotated Text */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Annotated Clinical Note</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-base leading-relaxed whitespace-pre-wrap">
                {renderAnnotatedText()}
              </div>
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Annotations Summary</h4>
                <div className="space-y-2">
                  {demoAnnotations.filter(a => a.start_offset < clinicalNote.length).map((ann) => {
                    const label = demoLabels.find(l => l.id === ann.label_id);
                    return (
                      <div key={ann.id} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: label?.color }} />
                        <span className="text-gray-600 font-medium">{label?.name}</span>
                        {label?.code && <span className="text-xs text-gray-400">({label.code})</span>}
                        <span className="text-gray-300">—</span>
                        <span className="text-gray-500 truncate">&ldquo;{ann.selected_text}&rdquo;</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Review Panel */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Review</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-4">Evaluate the quality and accuracy of annotations:</p>

                <div className="flex gap-3 mb-6">
                  {[
                    { value: 'approved', label: 'Approve', color: 'bg-green-600 border-green-600' },
                    { value: 'rejected', label: 'Reject', color: 'bg-red-600 border-red-600' },
                    { value: 'needs_revision', label: 'Needs Revision', color: 'bg-yellow-500 border-yellow-500' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDecision(opt.value)}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                        decision === opt.value
                          ? `${opt.color} text-white`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinical Comments
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add clinical notes about annotation accuracy, missing labels, or corrections needed..."
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={!decision}
                  onClick={() => setSubmitted(true)}
                >
                  Submit Review
                </Button>
              </div>

              {/* Review Guidelines */}
              <div className="mt-4 bg-blue-50 rounded-lg border border-blue-100 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Review Guidelines</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>&#8226; Verify all diagnostic codes (ICD-10) are correctly applied</li>
                  <li>&#8226; Check that symptom spans are precise and not overlapping</li>
                  <li>&#8226; Ensure medication mentions include dosage when available</li>
                  <li>&#8226; Flag any PHI that should have been redacted</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
