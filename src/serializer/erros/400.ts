import { Response } from "express";

export const badRequest = ({
  res,
  message,
}: {
  res: Response;
  message?: string;
}) => {
  return res.status(400).json({ message: message || "Bad Request" });
};
