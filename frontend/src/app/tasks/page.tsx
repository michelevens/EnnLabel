'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import Badge from '@/components/shared/Badge';
import { taskApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Task } from '@/types';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: '20' };
      if (statusFilter) params.status = statusFilter;

      const { data } = await taskApi.list(params);
      setTasks(data.data);
      setTotalPages(data.last_page);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, page]);

  const statuses = ['', 'pending', 'in_progress', 'completed', 'under_review', 'approved', 'rejected'];

  return (
    <Layout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <div className="flex items-center gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {s ? s.replace(/_/g, ' ') : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="p-8 text-center text-gray-400">No tasks found</p>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Dataset
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Assignee
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {task.dataset?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {task.assignee?.name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={task.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(task.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {task.status === 'pending' || task.status === 'in_progress'
                            ? 'Annotate'
                            : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-sm text-gray-600 disabled:text-gray-300"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {totalPages}
                  </span>
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
