import { Member, Role, User } from "@prisma/client";
import { Response } from "express";

export const createMemberSerializer = ({
  res,
  user,
  member,
}: {
  res: Response;
  user: User;
  member: Member;
}) => {
  return res.json({
    message: "User created successfully",
    data: { user: { ...user, member } },
  });
};

export const createManyMemberSerializer = ({
  res,
  message,
}: {
  res: Response;
  message?: string;
}) => {
  return res.status(204).send(message || "Users created successfully");
};

export const updateMemberSerializer = ({
  res,
  user,
  member,
}: {
  res: Response;
  user: User;
  member: Member;
}) => {
  return res.json({
    message: "User updated successfully",
    data: { user: { ...user, member } },
  });
};

export const getMemberSerializer = ({
  res,
  user,
}: {
  res: Response;
  user: User & { member?: Member } & { role?: Role };
}) => {
  return res.json({ message: "User founded successfully", data: { user } });
};
