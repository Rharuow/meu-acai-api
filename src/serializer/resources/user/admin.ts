import { Admin, Role, User } from "@prisma/client";
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

export const createManyAdminSerializer = ({
  res,
  message,
}: {
  res: Response;
  message?: string;
}) => {
  return res.status(204).send(message || "Users created successfully");
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

export const getAdminSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { admin?: Admin } & { role?: Role };
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};
