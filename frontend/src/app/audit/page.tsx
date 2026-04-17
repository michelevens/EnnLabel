'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import { auditApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { AuditLogEntry } from '@/types';

const actionColors: Record<string, string> = {
  login: 'text-green-600 bg-green-50',
  logout: 'text-gray-600 bg-gray-50',
  create: 'text-blue-600 bg-blue-50',
  update: 'text-yellow-600 bg-yellow-50',
  delete: 'text-red-600 bg-red-50',
  access: 'text-purple-600 bg-purple-50',
  export: 'text-indigo-600 bg-indigo-50',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: '50' };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;

      const { data } = await auditApi.list(params);
      setLogs(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, resourceFilter, page]);

  const actions = ['', 'login', 'logout', 'create', 'update', 'delete', 'access', 'export'];
  const resources = ['', 'user', 'dataset', 'task', 'annotation', 'review', 'qa_score', 'taxonomy'];

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-500 mt-1">
              Immutable record of all system activity (HIPAA compliance)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {actions.map((a) => (
                <option key={a} value={a}>{a || 'All Actions'}</option>
              ))}
            </select>
            <select
              value={resourceFilter}
              onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {resources.map((r) => (
                <option key={r} value={r}>{r || 'All Resources'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No audit logs found</p>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">IP</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.user?.name || 'System'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || 'text-gray-600 bg-gray-50'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {log.resource_type}
                        {log.resource_id && (
                          <span className="text-xs text-gray-300 ml-1">
                            {log.resource_id.slice(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                        {log.new_values ? JSON.stringify(log.new_values).slice(0, 80) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-gray-600 disabled:text-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-sm text-gray-600 disabled:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
