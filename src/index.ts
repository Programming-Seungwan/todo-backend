import "dotenv/config";
import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./database/dataSource.js";
import todoRouter from "./routes/todos/index.js";
import userRouter from "./routes/users/index.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/todos", todoRouter);
app.use("/users", userRouter);

const startServer = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize data source", error);
    process.exit(1);
  }
};

void startServer();
