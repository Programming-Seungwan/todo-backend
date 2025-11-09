import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../users/user.entity.js";

@Entity({ name: "Todos" })
export class Todo {
  @PrimaryGeneratedColumn({ name: "todo_id", type: "bigint", unsigned: true })
  todoId: number;

  @Column({ name: "user_id", type: "bigint", unsigned: true })
  userId: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ name: "due_date", type: "datetime", nullable: true })
  dueDate: Date | null;

  @Column({ name: "is_completed", type: "tinyint", width: 1, default: 0 })
  isCompleted: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.todos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
