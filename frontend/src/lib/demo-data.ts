import type { Annotation, Dataset, Label, Task, Taxonomy, User, Review, QaScore } from '@/types';

export const demoUser: User = {
  id: 'demo-user-1',
  name: 'Dr. Sarah Chen',
  email: 'sarah@ennlabel.com',
  role: { id: 'role-1', name: 'admin', display_name: 'Administrator' },
  totp_enabled: true,
  is_active: true,
  last_login_at: new Date().toISOString(),
  created_at: '2024-01-15T00:00:00Z',
};

export const demoLabels: Label[] = [
  { id: 'l1', taxonomy_id: 't1', name: 'Depression', code: 'F32', color: '#3B82F6', description: 'Major depressive disorder', shortcut_key: '1', sort_order: 0 },
  { id: 'l2', taxonomy_id: 't1', name: 'Anxiety', code: 'F41', color: '#8B5CF6', description: 'Generalized anxiety disorder', shortcut_key: '2', sort_order: 1 },
  { id: 'l3', taxonomy_id: 't1', name: 'PTSD', code: 'F43.1', color: '#EF4444', description: 'Post-traumatic stress disorder', shortcut_key: '3', sort_order: 2 },
  { id: 'l4', taxonomy_id: 't1', name: 'Medication', code: null, color: '#10B981', description: 'Medication reference', shortcut_key: '4', sort_order: 3 },
  { id: 'l5', taxonomy_id: 't1', name: 'Symptom', code: null, color: '#F59E0B', description: 'Clinical symptom', shortcut_key: '5', sort_order: 4 },
  { id: 'l6', taxonomy_id: 't1', name: 'Diagnosis', code: null, color: '#EC4899', description: 'Clinical diagnosis', shortcut_key: '6', sort_order: 5 },
];

export const demoTaxonomy: Taxonomy = {
  id: 't1',
  name: 'Behavioral Health (ICD-10)',
  description: 'Mental health and behavioral diagnosis codes',
  type: 'icd10',
  labels: demoLabels,
  labels_count: 6,
};

const clinicalNote = `Patient presents with a 3-month history of persistent low mood, decreased energy, and difficulty concentrating at work. She reports significant sleep disturbance, waking at 3 AM most nights and unable to return to sleep. Appetite has decreased with an approximate 8-pound weight loss over the past 6 weeks.

Patient describes feelings of worthlessness and guilt related to her inability to perform at her previous level at work. She denies suicidal ideation but reports passive thoughts of "not wanting to be here anymore." She has a history of a motor vehicle accident 2 years ago which she describes as "life-changing" and reports occasional flashbacks and hypervigilance when driving.

Current medications include Sertraline 50mg daily, which was started 4 weeks ago by her primary care physician. She reports minimal improvement in symptoms since starting the medication. She denies alcohol or substance use.

Assessment: Patient meets criteria for Major Depressive Disorder, moderate severity, with comorbid features consistent with Post-Traumatic Stress Disorder related to prior MVA. Current SSRI dose may be subtherapeutic.

Plan: Increase Sertraline to 100mg daily. Initiate cognitive behavioral therapy with trauma-focused component. Follow up in 2 weeks to assess medication response. PHQ-9 score today: 18 (moderately severe).`;

export const demoAnnotations: Annotation[] = [
  { id: 'a1', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l1', annotator_id: 'demo-user-1', start_offset: 32, end_offset: 51, selected_text: 'persistent low mood', metadata: null, is_current: true, label: demoLabels[0], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:30:00Z' },
  { id: 'a2', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l5', annotator_id: 'demo-user-1', start_offset: 53, end_offset: 69, selected_text: 'decreased energy', metadata: null, is_current: true, label: demoLabels[4], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:30:15Z' },
  { id: 'a3', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l5', annotator_id: 'demo-user-1', start_offset: 75, end_offset: 99, selected_text: 'difficulty concentrating', metadata: null, is_current: true, label: demoLabels[4], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:30:30Z' },
  { id: 'a4', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l5', annotator_id: 'demo-user-1', start_offset: 125, end_offset: 143, selected_text: 'sleep disturbance', metadata: null, is_current: true, label: demoLabels[4], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:31:00Z' },
  { id: 'a5', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l3', annotator_id: 'demo-user-1', start_offset: 502, end_offset: 512, selected_text: 'flashbacks', metadata: null, is_current: true, label: demoLabels[2], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:32:00Z' },
  { id: 'a6', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l3', annotator_id: 'demo-user-1', start_offset: 517, end_offset: 531, selected_text: 'hypervigilance', metadata: null, is_current: true, label: demoLabels[2], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:32:15Z' },
  { id: 'a7', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l4', annotator_id: 'demo-user-1', start_offset: 567, end_offset: 587, selected_text: 'Sertraline 50mg daily', metadata: null, is_current: true, label: demoLabels[3], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:33:00Z' },
  { id: 'a8', task_id: 'task-1', data_record_id: 'dr1', label_id: 'l6', annotator_id: 'demo-user-1', start_offset: 726, end_offset: 752, selected_text: 'Major Depressive Disorder', metadata: null, is_current: true, label: demoLabels[5], annotator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, created_at: '2024-03-10T14:34:00Z' },
];

export const demoTask: Task = {
  id: 'task-1',
  dataset_id: 'ds1',
  data_record_id: 'dr1',
  taxonomy_id: 't1',
  assigned_to: 'demo-user-1',
  status: 'in_progress',
  priority: 1,
  started_at: '2024-03-10T14:30:00Z',
  completed_at: null,
  notes: null,
  dataset: { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1' } as any,
  data_record: { id: 'dr1', dataset_id: 'ds1', content: clinicalNote, metadata: null, sequence_index: 0 },
  taxonomy: demoTaxonomy,
  assignee: { id: 'demo-user-1', name: 'Dr. Sarah Chen' },
  annotations: demoAnnotations,
  reviews: [],
  created_at: '2024-03-10T14:00:00Z',
};

export const demoDatasets: Dataset[] = [
  { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1', description: 'De-identified clinical notes from behavioral health encounters', source: 'EHR Export', schema_type: 'text', created_by: 'demo-user-1', record_count: 2847, status: 'active', metadata: null, creator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, tasks_count: 2847, created_at: '2024-01-20T00:00:00Z', updated_at: '2024-03-10T00:00:00Z' },
  { id: 'ds2', name: 'Therapy Session Transcripts', description: 'Anonymized therapy session transcripts for sentiment analysis', source: 'Transcription Service', schema_type: 'text', created_by: 'demo-user-1', record_count: 1203, status: 'active', metadata: null, creator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, tasks_count: 1203, created_at: '2024-02-05T00:00:00Z', updated_at: '2024-03-08T00:00:00Z' },
  { id: 'ds3', name: 'PHQ-9 Assessment Responses', description: 'Patient health questionnaire responses with free-text', source: 'Survey Platform', schema_type: 'classification', created_by: 'demo-user-1', record_count: 5421, status: 'active', metadata: null, creator: { id: 'demo-user-1', name: 'Dr. Sarah Chen' }, tasks_count: 5421, created_at: '2024-02-28T00:00:00Z', updated_at: '2024-03-12T00:00:00Z' },
];

export const demoTasks: Task[] = [
  { ...demoTask },
  { id: 'task-2', dataset_id: 'ds1', data_record_id: 'dr2', taxonomy_id: 't1', assigned_to: 'u2', status: 'completed', priority: 0, started_at: '2024-03-09T10:00:00Z', completed_at: '2024-03-09T11:30:00Z', notes: null, dataset: { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1' } as any, assignee: { id: 'u2', name: 'Maria Santos' }, created_at: '2024-03-09T09:00:00Z' } as Task,
  { id: 'task-3', dataset_id: 'ds1', data_record_id: 'dr3', taxonomy_id: 't1', assigned_to: 'u3', status: 'approved', priority: 0, started_at: '2024-03-08T14:00:00Z', completed_at: '2024-03-08T15:00:00Z', notes: null, dataset: { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1' } as any, assignee: { id: 'u3', name: 'James Wilson' }, created_at: '2024-03-08T13:00:00Z' } as Task,
  { id: 'task-4', dataset_id: 'ds2', data_record_id: 'dr4', taxonomy_id: 't1', assigned_to: null, status: 'pending', priority: 1, started_at: null, completed_at: null, notes: null, dataset: { id: 'ds2', name: 'Therapy Session Transcripts' } as any, assignee: null, created_at: '2024-03-11T00:00:00Z' } as Task,
  { id: 'task-5', dataset_id: 'ds1', data_record_id: 'dr5', taxonomy_id: 't1', assigned_to: 'u2', status: 'under_review', priority: 0, started_at: '2024-03-10T09:00:00Z', completed_at: '2024-03-10T10:30:00Z', notes: null, dataset: { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1' } as any, assignee: { id: 'u2', name: 'Maria Santos' }, created_at: '2024-03-10T08:00:00Z' } as Task,
  { id: 'task-6', dataset_id: 'ds1', data_record_id: 'dr6', taxonomy_id: 't1', assigned_to: 'u3', status: 'rejected', priority: 0, started_at: '2024-03-07T11:00:00Z', completed_at: '2024-03-07T12:00:00Z', notes: null, dataset: { id: 'ds1', name: 'Clinical Notes - Behavioral Health Q1' } as any, assignee: { id: 'u3', name: 'James Wilson' }, created_at: '2024-03-07T10:00:00Z' } as Task,
];
