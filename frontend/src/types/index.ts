export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  totp_enabled: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: 'admin' | 'annotator' | 'clinician_reviewer' | 'qa_reviewer';
  display_name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  group: string;
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  source: string | null;
  schema_type: string;
  created_by: string;
  record_count: number;
  status: string;
  metadata: Record<string, unknown> | null;
  creator?: Pick<User, 'id' | 'name'>;
  versions?: DatasetVersion[];
  tasks_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DatasetVersion {
  id: string;
  dataset_id: string;
  version_number: number;
  file_path: string;
  file_type: string;
  file_size: number;
  checksum: string;
  uploaded_by: string;
  change_notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  dataset_id: string;
  data_record_id: string;
  taxonomy_id: string;
  assigned_to: string | null;
  status: TaskStatus;
  priority: number;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  dataset?: Pick<Dataset, 'id' | 'name'>;
  data_record?: DataRecord;
  taxonomy?: Taxonomy;
  assignee?: Pick<User, 'id' | 'name'>;
  annotations?: Annotation[];
  reviews?: Review[];
  created_at: string;
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface DataRecord {
  id: string;
  dataset_id: string;
  content: string;
  metadata: Record<string, unknown> | null;
  sequence_index: number;
}

export interface Taxonomy {
  id: string;
  name: string;
  description: string | null;
  type: string;
  labels?: Label[];
  labels_count?: number;
}

export interface Label {
  id: string;
  taxonomy_id: string;
  name: string;
  code: string | null;
  color: string;
  description: string | null;
  shortcut_key: string | null;
  sort_order: number;
}

export interface Annotation {
  id: string;
  task_id: string;
  data_record_id: string;
  label_id: string;
  annotator_id: string;
  start_offset: number;
  end_offset: number;
  selected_text: string;
  metadata: Record<string, unknown> | null;
  is_current: boolean;
  label?: Label;
  annotator?: Pick<User, 'id' | 'name'>;
  created_at: string;
}

export interface Review {
  id: string;
  task_id: string;
  reviewer_id: string;
  decision: 'approved' | 'rejected' | 'needs_revision';
  comments: string | null;
  reviewer?: Pick<User, 'id' | 'name'>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LoginResponse {
  user: User;
  token: string;
  requires_totp: boolean;
}
