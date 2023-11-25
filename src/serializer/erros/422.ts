import { Response } from "express";

export const unprocessableEntity = <T>(res: Response, errors?: T) => {
  return res
    .status(422)
    .json(errors || { message: "There's some error processing the response" });
};
