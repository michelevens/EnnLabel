'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import Button from '@/components/shared/Button';
import Badge from '@/components/shared/Badge';
import { qaApi, datasetApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { QaScore, Dataset } from '@/types';
import toast from 'react-hot-toast';

export default function QaPage() {
  const [flaggedScores, setFlaggedScores] = useState<QaScore[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [calculating, setCalculating] = useState(false);

  const loadFlagged = async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedDataset) params.dataset_id = selectedDataset;

      const { data } = await qaApi.flagged(params);
      setFlaggedScores(data.data || []);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const loadDatasets = async () => {
    try {
      const { data } = await datasetApi.list({ per_page: '100' });
      setDatasets(data.data);
    } catch {
      // handle
    }
  };

  useEffect(() => {
    loadDatasets();
    loadFlagged();
  }, []);

  useEffect(() => {
    loadFlagged();
    if (selectedDataset) {
      loadStats();
    } else {
      setStats(null);
    }
  }, [selectedDataset]);

  const loadStats = async () => {
    if (!selectedDataset) return;
    try {
      const { data } = await qaApi.datasetStats(selectedDataset);
      setStats(data);
    } catch {
      // handle
    }
  };

  const handleCalculateDataset = async () => {
    if (!selectedDataset) return;
    setCalculating(true);
    try {
      const { data } = await qaApi.calculateDataset(selectedDataset);
      toast.success(data.message);
      loadFlagged();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await qaApi.resolve(id);
      toast.success('Conflict resolved');
      loadFlagged();
      if (selectedDataset) loadStats();
    } catch {
      toast.error('Failed to resolve');
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quality Assurance</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Datasets</option>
              {datasets.map((ds) => (
                <option key={ds.id} value={ds.id}>{ds.name}</option>
              ))}
            </select>
            {selectedDataset && (
              <Button onClick={handleCalculateDataset} loading={calculating} size="sm">
                Calculate Agreement
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Comparisons', value: (stats as any).total_comparisons },
              { label: 'Avg Agreement', value: (stats as any).average_agreement ? `${((stats as any).average_agreement * 100).toFixed(1)}%` : 'N/A' },
              { label: 'Flagged', value: (stats as any).flagged_count },
              { label: 'Resolved', value: (stats as any).resolved_count },
              { label: 'Unresolved', value: (stats as any).unresolved_count },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Flagged Conflicts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Flagged Conflicts</h3>
            <p className="text-xs text-gray-400 mt-1">
              Tasks where annotator agreement is below 70% or has label mismatches
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : flaggedScores.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No flagged conflicts</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {flaggedScores.map((score) => (
                <div key={score.id} className="p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Agreement: {(score.agreement_score * 100).toFixed(1)}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            score.agreement_score >= 0.8
                              ? 'bg-green-500'
                              : score.agreement_score >= 0.5
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${score.agreement_score * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {score.annotatorA?.name} vs {score.annotatorB?.name}
                    </p>
                    {score.conflict_details && score.conflict_details.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {score.conflict_details.slice(0, 3).map((conflict, i) => (
                          <p key={i} className="text-xs text-gray-400">
                            <span className="font-medium text-gray-600">{conflict.type}:</span>{' '}
                            &ldquo;{conflict.text}&rdquo; [{conflict.span}]
                          </p>
                        ))}
                        {score.conflict_details.length > 3 && (
                          <p className="text-xs text-gray-300">
                            +{score.conflict_details.length - 3} more conflicts
                          </p>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-300 mt-1">{formatDate(score.created_at)}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(score.id)}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
