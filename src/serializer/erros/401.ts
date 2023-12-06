import { Response } from "express";

export const unauthorized = (res: Response, message?: string) => {
  return res
    .status(401)
    .json({ message: message || "Unauthorized: No access token provided" });
};
