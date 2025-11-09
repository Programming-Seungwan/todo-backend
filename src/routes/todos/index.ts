import type { Request, Response } from "express";
import express from "express";
import { AppDataSource } from "../../database/dataSource.js";
import { User } from "../users/user.entity.js";
import type { CreateTodoDto } from "./todo.dto.js";
import { Todo } from "./todo.entity.js";

type TodoResponse = {
  todo_id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  is_completed: boolean;
  createdAt: Date;
};

const todoRouter = express.Router();

todoRouter.get("/", async (req: Request, res: Response) => {
  try {
    const todoRepo = AppDataSource.getRepository(Todo);
    const todos = await todoRepo.find({
      order: { todoId: "DESC" },
    });

    const response: TodoResponse[] = todos.map((todo) => ({
      todo_id: Number(todo.todoId),
      user_id: Number(todo.userId),
      title: todo.title,
      description: todo.description,
      due_date: todo.dueDate,
      is_completed: todo.isCompleted,
      createdAt: todo.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch todos",
    });
  }
});

todoRouter.post("/", async (req: Request, res: Response) => {
  const dto = req.body as CreateTodoDto;

  if (
    typeof dto?.user_id !== "number" ||
    Number.isNaN(dto.user_id) ||
    typeof dto.title !== "string" ||
    dto.title.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid payload for creating todo",
    });
    return;
  }

  const title = dto.title.trim();
  const dueDateValue =
    dto.due_date !== undefined && dto.due_date !== null
      ? new Date(dto.due_date)
      : null;

  if (dueDateValue && Number.isNaN(dueDateValue.getTime())) {
    res.status(400).json({
      success: false,
      message: "Invalid due_date format",
    });
    return;
  }

  try {
    const savedTodo = await AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const todoRepo = manager.getRepository(Todo);

      const user = await userRepo.findOneBy({ userId: dto.user_id });
      if (!user) {
        throw new Error("User not found");
      }

      const todo = todoRepo.create({
        userId: user.userId,
        user,
        title,
        description: dto.description ?? null,
        dueDate: dueDateValue,
        isCompleted: dto.is_completed ?? false,
      });

      return todoRepo.save(todo);
    });

    const response: TodoResponse = {
      todo_id: Number(savedTodo.todoId),
      user_id: Number(savedTodo.userId),
      title: savedTodo.title,
      description: savedTodo.description,
      due_date: savedTodo.dueDate,
      is_completed: savedTodo.isCompleted,
      createdAt: savedTodo.createdAt,
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create todo",
    });
  }
});

export default todoRouter;
