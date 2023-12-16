import { Client, Member, Role, User } from "@prisma/client";
import { Response } from "express";

export const createClientSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { client?: Client; roleId?: string };
}) => {
  return res.json({
    message: "User created successfully",
    data: { user: { ...user } },
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
  client,
}: {
  res: Response;
  client: User & { client: Client; role: Role };
}) => {
  return res.json({
    message: "User updated successfully",
    data: { user: client },
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

export const swapClientSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { client?: Client; role?: Role };
}) => {
  return res.json({ message: "Client swapped successfully", data: { user } });
};

export const updateAddressSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { client?: Client; role?: Role };
}) => {
  return res.json({
    message: "Client's address updated successfully",
    data: { user },
  });
};
