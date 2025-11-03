import type { Request, Response } from "express";
import express from "express";
import pool from "../../database/connection.js";

const todoRouter = express.Router();

todoRouter.get("/", async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute("select * from Todos");

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.log(error);
  }
});

export default todoRouter;
