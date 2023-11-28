import { Client, Role, User } from "@prisma/client";
import { Response } from "express";

export const createClientSerializer = ({
  res,
  user,
  client,
}: {
  res: Response;
  user: User;
  client: Client;
}) => {
  return res.json({
    message: "User created successfully",
    data: { user: { ...user, client } },
  });
};

export const createManyClientSerializer = ({
  res,
  message,
}: {
  res: Response;
  message?: string;
}) => {
  return res.status(204).send(message || "Users created successfully");
};

export const updateClientSerializer = ({
  res,
  user,
  client,
}: {
  res: Response;
  user: User;
  client: Client;
}) => {
  return res.json({
    message: "User updated successfully",
    data: { user: { ...user, client } },
  });
};

export const getClientSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { client?: Client } & { role?: Role };
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};
