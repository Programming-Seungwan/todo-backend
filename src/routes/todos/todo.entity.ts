export interface TodoItem {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  is_completed: boolean;
  createdAt: Date;
}
