import { Response } from "express";

export const unauthorized = (res: Response) => {
  return res
    .status(401)
    .json({ message: "Unauthorized: No access token provided" });
};
