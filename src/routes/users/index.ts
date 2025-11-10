import type { Request, Response } from "express";
import express from "express";
import { AppDataSource } from "../../database/dataSource.js";
import { hashPassword } from "../../utils/auth/index.js";
import type { CreateUserDto } from "./user.dto.js";
import { User } from "./user.entity.js";

const userRouter = express.Router();

type UserResponse = {
  userId: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
};

userRouter.get("/", async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      order: { userId: "DESC" },
    });

    const response: UserResponse[] = users.map((user) => ({
      userId: Number(user.userId),
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

userRouter.post("/signup", async (req: Request, res: Response) => {
  const dto = req.body as CreateUserDto;
  const userRepo = AppDataSource.getRepository(User);

  if (
    typeof dto?.email !== "string" ||
    dto.email.trim().length === 0 ||
    typeof dto.username !== "string" ||
    dto.username.trim().length === 0 ||
    typeof dto.password !== "string" ||
    dto.password.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid payload for creating user",
    });
    return;
  }

  const email = dto.email.trim();
  const username = dto.username.trim();
  const password = dto.password.trim();

  try {
    const foundUser = await userRepo.findOne({
      where: { email },
    });

    if (foundUser) {
      throw new Error("USER_ALREADY_EXISTS");
    }

    const hashedPassword = await hashPassword(password);

    const user = userRepo.create({
      email,
      username,
      passwordHash: hashedPassword,
    });
    const savedUser = await userRepo.save(user);

    const createdUser: UserResponse = {
      userId: Number(savedUser.userId),
      email: savedUser.email,
      username: savedUser.username,
      passwordHash: savedUser.passwordHash,
      createdAt: savedUser.createdAt,
    };

    res.status(201).json({
      success: true,
      data: createdUser,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: `There is already user having email named ${email}`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
});

export default userRouter;
