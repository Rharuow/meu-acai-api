import { Admin, User } from "@prisma/client";
import { Response } from "express";

export const createAdminSerializer = ({
  res,
  user,
  admin,
}: {
  res: Response;
  user: User;
  admin: Admin;
}) => {
  return res.json({
    message: "User created successfully",
    data: { user: { ...user, admin } },
  });
};

export const updateAdminSerializer = ({
  res,
  user,
  admin,
}: {
  res: Response;
  user: User;
  admin: Admin;
}) => {
  return res.json({
    message: "User updated successfully",
    data: { user: { ...user, admin } },
  });
};
