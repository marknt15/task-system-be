export interface Task {
  id?: number;
  task: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  created_at: string;
}
