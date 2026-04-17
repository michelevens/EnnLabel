'use client';

import Badge from '@/components/shared/Badge';
import { demoDatasets, demoTasks } from '@/lib/demo-data';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const statCards = [
  { label: 'Total Tasks', value: '9,471', color: 'bg-blue-500' },
  { label: 'Pending', value: '3,204', color: 'bg-yellow-500' },
  { label: 'In Progress', value: '1,847', color: 'bg-purple-500' },
  { label: 'Completed', value: '4,420', color: 'bg-green-500' },
];

export default function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        <span className="font-medium">Dashboard Demo</span> — see the admin view.{' '}
        <Link href={basePath || '/'} className="underline hover:no-underline">Back to home</Link>
        {' · '}
        <Link href={`${basePath}/demo/annotation`} className="underline hover:no-underline">Try Annotation</Link>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 pt-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EnnLabel</span>
            </div>
          </div>
          <nav className="px-3">
            {[
              { name: 'Dashboard', active: true },
              { name: 'Datasets', active: false },
              { name: 'Tasks', active: false },
              { name: 'Taxonomies', active: false },
              { name: 'QA', active: false },
              { name: 'Users', active: false },
              { name: 'Audit Logs', active: false },
            ].map((item) => (
              <div
                key={item.name}
                className={`px-3 py-2 mb-1 rounded-md text-sm font-medium ${
                  item.active ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                }`}
              >
                {item.name}
              </div>
            ))}
          </nav>
          <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">Dr. Sarah Chen</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-5">
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
                <span className="text-sm text-blue-600">View all</span>
              </div>
              <div className="divide-y divide-gray-100">
                {demoTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.dataset?.name}</p>
                      <p className="text-xs text-gray-400">{task.assignee?.name || 'Unassigned'}</p>
                    </div>
                    <Badge status={task.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Datasets */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Datasets</h3>
                <span className="text-sm text-blue-600">View all</span>
              </div>
              <div className="divide-y divide-gray-100">
                {demoDatasets.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ds.name}</p>
                      <p className="text-xs text-gray-400">
                        {ds.record_count.toLocaleString()} records &middot; {formatDate(ds.created_at)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{ds.schema_type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QA Summary */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">QA Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Comparisons', value: '342' },
                { label: 'Avg Agreement', value: '94.2%' },
                { label: 'Flagged', value: '18' },
                { label: 'Resolved', value: '15' },
                { label: 'Pending', value: '3' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
