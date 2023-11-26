import { User } from "@prisma/client";
import { Response } from "express";

export const getUserSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User;
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};
