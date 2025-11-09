import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Todo } from "../todos/todo.entity.js";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn({ name: "user_id", type: "bigint", unsigned: true })
  userId: number;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 100 })
  username: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos?: Todo[];
}
