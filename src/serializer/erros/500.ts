import { Response } from "express";

export const internalServerError = (res: Response, message?: string) => {
  return res
    .status(422)
    .json({ message: message || "Sorry there was an error on the server." });
};
