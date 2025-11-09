import { DataSource } from "typeorm";
import { Todo } from "../routes/todos/todo.entity.js";
import { User } from "../routes/users/user.entity.js";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Todo],
  synchronize: false,
  logging: false,
});
