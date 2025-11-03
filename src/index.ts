import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import pool from "./database/connection.js";

const app = express();
const port = 3000;

app.get("/", async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows, fields] = await connection.execute("select * from Users");
    console.log(fields, "fields");
    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
