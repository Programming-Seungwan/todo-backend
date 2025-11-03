import "dotenv/config";
import express from "express";
import todoRouter from "./routes/todos/index.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/todos", todoRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
