'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const features = [
  {
    title: 'Clinical Text Annotation',
    description: 'Highlight-and-tag interface built for clinical notes. Multi-label support with DSM-5, ICD-10, and custom taxonomies.',
    icon: '🏷️',
  },
  {
    title: 'Multi-Stage Review',
    description: 'Clinician reviewer → QA reviewer → approval pipeline. Every edit tracked with full version history.',
    icon: '✅',
  },
  {
    title: 'Inter-Annotator Agreement',
    description: 'Automatic span-level agreement scoring. Conflicts flagged and routed to QA reviewers.',
    icon: '📊',
  },
  {
    title: 'HIPAA Audit Trail',
    description: 'Every action logged immutably. User, IP, timestamp, old/new values. Full compliance.',
    icon: '🔒',
  },
  {
    title: 'Smart Task Management',
    description: 'Auto-generate tasks from datasets. Assign to annotators. Track progress across thousands of records.',
    icon: '📋',
  },
  {
    title: 'Structured Export',
    description: 'Export labeled datasets as JSON or CSV with annotations, metadata, and review status. LLM-training ready.',
    icon: '📤',
  },
];

const stats = [
  { label: 'Records Processed', value: '50K+' },
  { label: 'Agreement Score', value: '94.2%' },
  { label: 'Active Annotators', value: '120' },
  { label: 'Taxonomies', value: 'DSM-5 / ICD-10' },
];

const comparisons = [
  { feature: 'Healthcare-native design', ennlabel: true, labelStudio: false, labelbox: false, scaleAI: false },
  { feature: 'Built-in HIPAA compliance', ennlabel: true, labelStudio: false, labelbox: 'Enterprise', scaleAI: 'Enterprise' },
  { feature: 'Clinical review pipeline', ennlabel: true, labelStudio: false, labelbox: false, scaleAI: false },
  { feature: 'DSM-5 / ICD-10 taxonomies', ennlabel: true, labelStudio: false, labelbox: false, scaleAI: false },
  { feature: 'Inter-annotator agreement', ennlabel: true, labelStudio: 'Plugin', labelbox: true, scaleAI: true },
  { feature: 'Self-hosted option', ennlabel: true, labelStudio: true, labelbox: false, scaleAI: false },
  { feature: 'Open pricing', ennlabel: true, labelStudio: true, labelbox: false, scaleAI: false },
  { feature: 'Immutable audit logs', ennlabel: true, labelStudio: false, labelbox: 'Enterprise', scaleAI: false },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EnnLabel</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#comparison" className="hover:text-gray-900 transition-colors">Compare</a>
            <a href="#demo" className="hover:text-gray-900 transition-colors">Demo</a>
            <Link
              href={`${basePath}/demo/annotation`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            HIPAA-Compliant · Healthcare-Native · Production-Ready
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Label clinical data
            <br />
            <span className="text-blue-600">for AI that heals</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            The annotation platform built for behavioral health AI. Ingest clinical notes, annotate with DSM-5/ICD-10 codes, review with clinicians, and export training-ready datasets.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`${basePath}/demo/annotation`}
              className="px-8 py-3.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
            >
              Try the Demo
            </Link>
            <a
              href="https://github.com/michelevens/EnnLabel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-lg"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for clinical workflows</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Every feature designed for healthcare data teams. Not a generic tool with a medical skin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Annotation Demo Preview */}
      <section id="demo" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">See it in action</h2>
            <p className="text-lg text-gray-500">Highlight text, apply clinical labels, review annotations</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-gray-400 bg-gray-200 px-4 py-1 rounded-md">app.ennlabel.com/tasks/annotate</span>
              </div>
            </div>
            {/* Mock annotation UI */}
            <div className="grid grid-cols-3 gap-0">
              <div className="col-span-2 p-8 border-r border-gray-100">
                <p className="text-sm text-gray-400 mb-4 font-medium">Clinical Note #1847</p>
                <p className="text-base leading-relaxed text-gray-800">
                  Patient presents with a 3-month history of{' '}
                  <span className="bg-blue-100 border-b-2 border-blue-500 px-0.5 rounded relative">
                    persistent low mood
                    <span className="absolute -top-5 left-0 text-[10px] text-white bg-blue-500 px-1 rounded whitespace-nowrap">Depression (F32)</span>
                  </span>
                  ,{' '}
                  <span className="bg-yellow-100 border-b-2 border-yellow-500 px-0.5 rounded">decreased energy</span>
                  , and{' '}
                  <span className="bg-yellow-100 border-b-2 border-yellow-500 px-0.5 rounded">difficulty concentrating</span>
                  {' '}at work. She reports significant{' '}
                  <span className="bg-yellow-100 border-b-2 border-yellow-500 px-0.5 rounded">sleep disturbance</span>
                  ...
                </p>
                <p className="text-base leading-relaxed text-gray-800 mt-4">
                  ...occasional{' '}
                  <span className="bg-red-100 border-b-2 border-red-500 px-0.5 rounded relative">
                    flashbacks
                    <span className="absolute -top-5 left-0 text-[10px] text-white bg-red-500 px-1 rounded whitespace-nowrap">PTSD (F43.1)</span>
                  </span>
                  {' '}and{' '}
                  <span className="bg-red-100 border-b-2 border-red-500 px-0.5 rounded">hypervigilance</span>
                  {' '}when driving. Current medications include{' '}
                  <span className="bg-green-100 border-b-2 border-green-500 px-0.5 rounded relative">
                    Sertraline 50mg daily
                    <span className="absolute -top-5 left-0 text-[10px] text-white bg-green-500 px-1 rounded whitespace-nowrap">Medication</span>
                  </span>
                  ...
                </p>
              </div>
              <div className="p-6 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Labels</p>
                {[
                  { name: 'Depression', code: 'F32', color: '#3B82F6', key: '1', count: 1 },
                  { name: 'Anxiety', code: 'F41', color: '#8B5CF6', key: '2', count: 0 },
                  { name: 'PTSD', code: 'F43.1', color: '#EF4444', key: '3', count: 2 },
                  { name: 'Medication', code: null, color: '#10B981', key: '4', count: 1 },
                  { name: 'Symptom', code: null, color: '#F59E0B', key: '5', count: 3 },
                ].map((l) => (
                  <div key={l.name} className="flex items-center justify-between py-2 px-2 rounded text-sm hover:bg-white transition-colors cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-gray-800">{l.name}</span>
                      {l.code && <span className="text-[10px] text-gray-400">{l.code}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded border text-gray-500">{l.key}</kbd>
                      {l.count > 0 && <span className="text-[10px] text-gray-400">{l.count}</span>}
                    </div>
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Annotations (7)</p>
                  <div className="space-y-1.5">
                    {[
                      { text: 'persistent low mood', label: 'Depression', color: '#3B82F6' },
                      { text: 'flashbacks', label: 'PTSD', color: '#EF4444' },
                      { text: 'Sertraline 50mg', label: 'Medication', color: '#10B981' },
                    ].map((a) => (
                      <div key={a.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="truncate">&ldquo;{a.text}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href={`${basePath}/demo/annotation`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Interactive Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why EnnLabel wins</h2>
            <p className="text-lg text-gray-500">Purpose-built for healthcare vs. generic tools</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-bold text-blue-600">EnnLabel</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">Label Studio</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">Labelbox</th>
                  <th className="text-center py-4 px-4 text-sm font-medium text-gray-500">Scale AI</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{row.feature}</td>
                    {[row.ennlabel, row.labelStudio, row.labelbox, row.scaleAI].map((val, i) => (
                      <td key={i} className="py-3 px-4 text-center text-sm">
                        {val === true ? (
                          <span className={`${i === 0 ? 'text-blue-600' : 'text-green-600'}`}>&#10003;</span>
                        ) : val === false ? (
                          <span className="text-gray-300">&mdash;</span>
                        ) : (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to label healthcare data?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Deploy EnnLabel on your infrastructure in minutes. Docker, Railway, or bare metal.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`${basePath}/demo/annotation`}
              className="px-8 py-3.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Try Demo
            </Link>
            <a
              href="https://github.com/michelevens/EnnLabel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-blue-300 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Deploy Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">EnnLabel</span>
          </div>
          <p className="text-xs text-gray-400">
            Clinician-grade annotation for behavioral health AI
          </p>
        </div>
      </footer>
    </div>
  );
}
