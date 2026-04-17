'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import Badge from '@/components/shared/Badge';
import { taskApi, datasetApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Task, Dataset, PaginatedResponse } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, total: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [taskRes, datasetRes] = await Promise.all([
          taskApi.list({ per_page: '10' }),
          datasetApi.list({ per_page: '5' }),
        ]);
        setTasks(taskRes.data.data);
        setDatasets(datasetRes.data.data);

        // Calculate stats from tasks
        const allTasks = taskRes.data as PaginatedResponse<Task>;
        setStats({
          total: allTasks.total,
          pending: taskRes.data.data.filter((t: Task) => t.status === 'pending').length,
          inProgress: taskRes.data.data.filter((t: Task) => t.status === 'in_progress').length,
          completed: taskRes.data.data.filter((t: Task) => ['completed', 'approved'].includes(t.status)).length,
        });
      } catch {
        // Handle error silently on dashboard
      }
    };
    loadData();
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'bg-blue-500' },
    { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
  ];

  return (
    <Layout>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-center">
                <div className={`w-2 h-8 ${stat.color} rounded-full mr-3`} />
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Tasks</h3>
              <Link href="/tasks" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No tasks yet</p>
              ) : (
                tasks.slice(0, 5).map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks/${task.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.dataset?.name || 'Task'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {task.assignee?.name || 'Unassigned'}
                      </p>
                    </div>
                    <Badge status={task.status} />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Datasets */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Datasets</h3>
              <Link href="/datasets" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {datasets.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No datasets yet</p>
              ) : (
                datasets.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ds.name}</p>
                      <p className="text-xs text-gray-400">
                        {ds.record_count} records &middot; {formatDate(ds.created_at)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{ds.schema_type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
