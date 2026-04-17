import TaskAnnotationClient from './TaskAnnotationClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function TaskPage() {
  return <TaskAnnotationClient />;
}
