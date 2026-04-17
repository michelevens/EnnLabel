'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/shared/Layout';
import TextAnnotator from '@/components/annotation/TextAnnotator';
import LabelPanel from '@/components/annotation/LabelPanel';
import Badge from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { taskApi, annotationApi, reviewApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useAnnotationShortcuts } from '@/hooks/useKeyboard';
import type { Task, Annotation, Label, Review } from '@/types';
import toast from 'react-hot-toast';

export default function TaskAnnotationPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { user } = useAuthStore();

  const [task, setTask] = useState<Task | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Review state
  const [showReview, setShowReview] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);

  // Keyboard shortcuts for label selection
  useAnnotationShortcuts({
    labels: task?.taxonomy?.labels || [],
    onSelectLabel: setSelectedLabel,
    enabled: task?.status === 'pending' || task?.status === 'in_progress',
  });

  const loadTask = async () => {
    try {
      const { data } = await taskApi.get(taskId);
      setTask(data);
      setAnnotations(data.annotations || []);
      if (data.taxonomy?.labels?.length) {
        setSelectedLabel(data.taxonomy.labels[0]);
      }

      const reviewRes = await reviewApi.getByTask(taskId);
      setReviews(reviewRes.data);
    } catch {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const handleAnnotationCreate = async (data: {
    label_id: string;
    start_offset: number;
    end_offset: number;
    selected_text: string;
  }) => {
    try {
      const { data: annotation } = await annotationApi.create({
        task_id: taskId,
        ...data,
      });
      setAnnotations((prev) => [...prev, annotation]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create annotation');
    }
  };

  const handleAnnotationDelete = async (id: string) => {
    try {
      await annotationApi.delete(id);
      setAnnotations((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('Failed to delete annotation');
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    try {
      await taskApi.updateStatus(taskId, 'completed');
      toast.success('Task submitted for review');
      loadTask();
    } catch {
      toast.error('Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewDecision) return;
    setSubmitting(true);
    try {
      await reviewApi.create({
        task_id: taskId,
        decision: reviewDecision,
        comments: reviewComments || undefined,
      });
      toast.success('Review submitted');
      setShowReview(false);
      setReviewDecision('');
      setReviewComments('');
      loadTask();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const isReviewer =
    user?.role.name === 'clinician_reviewer' ||
    user?.role.name === 'qa_reviewer' ||
    user?.role.name === 'admin';

  const canAnnotate =
    task?.status === 'pending' ||
    task?.status === 'in_progress';

  const canReview =
    isReviewer && (task?.status === 'completed' || task?.status === 'under_review');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <p className="text-gray-500">Task not found</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Annotation Task
              </h2>
              <Badge status={task.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Dataset: {task.dataset?.name} &middot; Taxonomy: {task.taxonomy?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canAnnotate && annotations.length > 0 && (
              <Button onClick={handleSubmitForReview} loading={submitting}>
                Submit for Review
              </Button>
            )}
            {canReview && (
              <Button onClick={() => setShowReview(true)}>
                Review
              </Button>
            )}
          </div>
        </div>

        {/* Review Panel */}
        {showReview && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Submit Review</h3>
            <div className="flex gap-3 mb-4">
              {['approved', 'rejected', 'needs_revision'].map((d) => (
                <button
                  key={d}
                  onClick={() => setReviewDecision(d)}
                  className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                    reviewDecision === d
                      ? d === 'approved'
                        ? 'bg-green-600 text-white border-green-600'
                        : d === 'rejected'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {d.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <textarea
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              rows={3}
              placeholder="Comments (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleReviewSubmit} loading={submitting} disabled={!reviewDecision}>
                Submit Review
              </Button>
              <Button variant="secondary" onClick={() => setShowReview(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Previous Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Review History</h3>
            <div className="space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-3 text-sm">
                  <Badge status={review.decision} />
                  <div>
                    <span className="font-medium">{review.reviewer?.name}</span>
                    {review.comments && (
                      <p className="text-gray-500 mt-0.5">{review.comments}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annotation Interface - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Text Panel */}
          <div className="lg:col-span-2">
            <TextAnnotator
              text={task.data_record?.content || ''}
              annotations={annotations}
              labels={task.taxonomy?.labels || []}
              selectedLabel={selectedLabel}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationDelete={handleAnnotationDelete}
              readOnly={!canAnnotate}
            />
          </div>

          {/* Right: Label Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <LabelPanel
              labels={task.taxonomy?.labels || []}
              selectedLabel={selectedLabel}
              onSelectLabel={setSelectedLabel}
              annotations={annotations}
              onDeleteAnnotation={handleAnnotationDelete}
              readOnly={!canAnnotate}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
