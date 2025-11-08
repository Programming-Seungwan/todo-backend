export interface CreateTodoDto {
  user_id: number;
  title: string;
  description?: string;
  due_date?: string;
  is_completed?: boolean;
}
