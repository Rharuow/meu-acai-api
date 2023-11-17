import { Response } from "express";

export const unpermittedParam = <T>(res: Response, errors: T) => {
  return res.status(422).json(errors);
};
