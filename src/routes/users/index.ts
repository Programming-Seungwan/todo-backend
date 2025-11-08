import type { Request, Response } from "express";
import express from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../../database/connection.js";
import type { CreateUserDto } from "./user.dto.js";
import type { User } from "./user.entity.js";

type UserRow = RowDataPacket & {
  user_id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
};

const userRouter = express.Router();

userRouter.get("/", async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute<UserRow[]>(`
      SELECT user_id, email, username, password_hash, created_at
      FROM Users
      ORDER BY user_id DESC
    `);

    const users: User[] = rows.map((row) => ({
      userId: Number(row.user_id),
      email: row.email,
      username: row.username,
      passwordHash: row.password_hash,
      createdAt: new Date(row.created_at),
    }));

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  } finally {
    connection.release();
  }
});

userRouter.post("/", async (req: Request, res: Response) => {
  const dto = req.body as CreateUserDto;

  if (
    typeof dto?.email !== "string" ||
    dto.email.trim().length === 0 ||
    typeof dto.username !== "string" ||
    dto.username.trim().length === 0 ||
    typeof dto.passwordHash !== "string" ||
    dto.passwordHash.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid payload for creating user",
    });
    return;
  }

  const email = dto.email.trim();
  const username = dto.username.trim();
  const passwordHash = dto.passwordHash.trim();

  const connection = await pool.getConnection();
  try {
    const insertSql = `
      INSERT INTO Users (email, username, password_hash)
      VALUES (?, ?, ?)
    `;

    const [result] = await connection.execute<ResultSetHeader>(insertSql, [
      email,
      username,
      passwordHash,
    ]);

    const [rows] = await connection.execute<UserRow[]>(
      `
        SELECT user_id, email, username, password_hash, created_at
        FROM Users
        WHERE user_id = ?
      `,
      [result.insertId]
    );

    const createdRow = rows[0];

    if (!createdRow) {
      throw new Error("Failed to fetch newly created user");
    }

    const createdUser: User = {
      userId: Number(createdRow.user_id),
      email: createdRow.email,
      username: createdRow.username,
      passwordHash: createdRow.password_hash,
      createdAt: new Date(createdRow.created_at),
    };

    res.status(201).json({
      success: true,
      data: createdUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  } finally {
    connection.release();
  }
});

export default userRouter;
