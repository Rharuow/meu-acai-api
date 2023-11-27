import { User } from "@prisma/client";
import { Response } from "express";
import { list } from "..";

export type ListUsersSerializer = {
  data: Array<User>;
  hasNextPage: boolean;
  page: number;
  totalPages: number;
};

type Params = {
  users: Array<User>;
  totalPages: number;
  page: number;
};

export const getUserSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User;
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};

export const listUsersSerializer: (params: Params) => ListUsersSerializer = ({
  users,
  totalPages,
  page,
}) => {
  return list({ data: users, page, totalPages });
};
