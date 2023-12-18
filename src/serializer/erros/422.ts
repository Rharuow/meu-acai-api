import { Response } from "express";

export const unprocessableEntity = <T>(res: Response, errors?: T) => {
  return res
    .status(422)
    .json({ message: errors || "There's some error processing the response" });
};
