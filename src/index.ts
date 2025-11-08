import "dotenv/config";
import express from "express";
import todoRouter from "./routes/todos/index.js";
import userRouter from "./routes/users/index.js";

const app = express();
const port = 3000;

app.use(express.json());

app.use("/todos", todoRouter);
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
