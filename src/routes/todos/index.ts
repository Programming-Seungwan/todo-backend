import type { Request, Response } from "express";
import express from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../../database/connection.js";
import type { CreateTodoDto } from "./todo.dto.js";
import type { TodoItem } from "./todo.entity.js";

type TodoRow = RowDataPacket & {
  todo_id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  is_completed: 0 | 1;
  created_at: Date;
};

const todoRouter = express.Router();

todoRouter.get("/", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute("SELECT * FROM Todos");

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch todos",
    });
  } finally {
    connection.release();
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

  const connection = await pool.getConnection();
  try {
    const insertSql = `
      INSERT INTO Todos (user_id, title, description, due_date, is_completed)
      VALUES (?, ?, ?, ?, ?)
    `;

    const isCompletedValue = dto.is_completed ? 1 : 0;

    const [insertResult] = await connection.execute<ResultSetHeader>(
      insertSql,
      [
        dto.user_id,
        title,
        dto.description ?? null,
        dueDateValue,
        isCompletedValue,
      ]
    );

    const [rows] = await connection.execute<TodoRow[]>(
      `
        SELECT todo_id, user_id, title, description, due_date, is_completed, created_at
        FROM Todos
        WHERE todo_id = ?
      `,
      [insertResult.insertId]
    );

    const createdRow = rows[0];

    if (!createdRow) {
      throw new Error("Failed to fetch newly created todo");
    }

    const createdTodo: TodoItem = {
      todo_id: Number(createdRow.todo_id),
      user_id: Number(createdRow.user_id),
      title: createdRow.title,
      description: createdRow.description,
      due_date: createdRow.due_date ? new Date(createdRow.due_date) : null,
      is_completed: Boolean(createdRow.is_completed),
      createdAt: new Date(createdRow.created_at),
    };

    res.status(201).json({
      success: true,
      data: createdTodo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create todo",
    });
  } finally {
    connection.release();
  }
});

export default todoRouter;
