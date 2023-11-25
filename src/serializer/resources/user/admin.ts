import { Admin, User } from "@prisma/client";
import { Response } from "express";

export const createAdminSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: { user: User; admin: Admin };
}) => {
  return res.json({
    message: "User created successfully",
    data: user,
  });
};
