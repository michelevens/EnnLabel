'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import Button from '@/components/shared/Button';
import { taxonomyApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { Taxonomy } from '@/types';
import toast from 'react-hot-toast';

interface NewLabel {
  name: string;
  code: string;
  color: string;
  shortcut_key: string;
}

export default function TaxonomiesPage() {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuthStore();

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  const [labels, setLabels] = useState<NewLabel[]>([
    { name: '', code: '', color: '#3B82F6', shortcut_key: '' },
  ]);
  const [creating, setCreating] = useState(false);

  const loadTaxonomies = async () => {
    try {
      const { data } = await taxonomyApi.list();
      setTaxonomies(data);
    } catch {
      toast.error('Failed to load taxonomies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomies();
  }, []);

  const addLabel = () => {
    setLabels([...labels, { name: '', code: '', color: '#3B82F6', shortcut_key: '' }]);
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, field: keyof NewLabel, value: string) => {
    const updated = [...labels];
    updated[index] = { ...updated[index], [field]: value };
    setLabels(updated);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await taxonomyApi.create({
        name,
        type,
        labels: labels.filter((l) => l.name.trim()),
      });
      toast.success('Taxonomy created');
      setShowCreate(false);
      setName('');
      setLabels([{ name: '', code: '', color: '#3B82F6', shortcut_key: '' }]);
      loadTaxonomies();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create taxonomy');
    } finally {
      setCreating(false);
    }
  };

  const isAdmin = user?.role.name === 'admin';

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Taxonomies</h2>
          {isAdmin && (
            <Button onClick={() => setShowCreate(!showCreate)}>
              {showCreate ? 'Cancel' : 'Create Taxonomy'}
            </Button>
          )}
        </div>

        {/* Create Form */}
        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taxonomy Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Mental Health Diagnoses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="custom">Custom</option>
                  <option value="dsm5">DSM-5</option>
                  <option value="icd10">ICD-10</option>
                </select>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mb-2">Labels</h4>
            <div className="space-y-2 mb-4">
              {labels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={label.name}
                    onChange={(e) => updateLabel(i, 'name', e.target.value)}
                    placeholder="Label name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    value={label.code}
                    onChange={(e) => updateLabel(i, 'code', e.target.value)}
                    placeholder="Code"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="color"
                    value={label.color}
                    onChange={(e) => updateLabel(i, 'color', e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={label.shortcut_key}
                    onChange={(e) => updateLabel(i, 'shortcut_key', e.target.value)}
                    placeholder="Key"
                    className="w-16 px-3 py-2 border border-gray-300 rounded-md text-sm text-center"
                  />
                  {labels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLabel(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLabel}
              className="text-sm text-primary-600 hover:underline mb-4"
            >
              + Add Label
            </button>

            <div className="flex justify-end">
              <Button type="submit" loading={creating}>
                Create Taxonomy
              </Button>
            </div>
          </form>
        )}

        {/* Taxonomy List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : taxonomies.length === 0 ? (
            <p className="col-span-3 p-8 text-center text-gray-400">
              No taxonomies yet
            </p>
          ) : (
            taxonomies.map((tax) => (
              <div
                key={tax.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{tax.name}</h3>
                  <span className="text-xs text-gray-400 uppercase">{tax.type}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tax.labels?.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  {tax.labels_count ?? tax.labels?.length ?? 0} labels
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
