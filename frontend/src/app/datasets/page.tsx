'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import Button from '@/components/shared/Button';
import { datasetApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import type { Dataset } from '@/types';
import toast from 'react-hot-toast';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuthStore();

  // Upload form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('');
  const [schemaType, setSchemaType] = useState('text');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadDatasets = async () => {
    try {
      const { data } = await datasetApi.list();
      setDatasets(data.data);
    } catch {
      toast.error('Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('source', source);
    formData.append('schema_type', schemaType);
    formData.append('file', file);

    try {
      await datasetApi.create(formData);
      toast.success('Dataset uploaded successfully');
      setShowUpload(false);
      setName('');
      setDescription('');
      setFile(null);
      loadDatasets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isAdmin = user?.role.name === 'admin';

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Datasets</h2>
          {isAdmin && (
            <Button onClick={() => setShowUpload(!showUpload)}>
              {showUpload ? 'Cancel' : 'Upload Dataset'}
            </Button>
          )}
        </div>

        {/* Upload Form */}
        {showUpload && (
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dataset Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Clinical Notes DB"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schema Type
                </label>
                <select
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                >
                  <option value="text">Text</option>
                  <option value="ner">Named Entity Recognition</option>
                  <option value="classification">Classification</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File (CSV or JSON) *
                </label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" loading={uploading}>
                Upload
              </Button>
            </div>
          </form>
        )}

        {/* Dataset List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : datasets.length === 0 ? (
            <p className="p-8 text-center text-gray-400">
              No datasets yet. Upload one to get started.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Records
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Tasks
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{ds.name}</p>
                      {ds.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">
                          {ds.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ds.schema_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {ds.record_count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {ds.tasks_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(ds.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
