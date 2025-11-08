export interface User {
  userId: number;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}
