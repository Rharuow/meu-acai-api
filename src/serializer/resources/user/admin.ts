import { Admin, Role, User } from "@prisma/client";
import { Response } from "express";

export const createAdminSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { admin: Admin };
}) => {
  return res.json({
    message: "User created successfully",
    data: { user },
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

export const getAdminSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { admin?: Admin } & { role?: Role };
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};
