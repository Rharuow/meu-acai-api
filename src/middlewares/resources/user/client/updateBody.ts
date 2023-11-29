import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { NextFunction, Request, Response } from "express";

export const updateBodyClient = (
  req: Request<
    {},
    {},
    UpdateClientRequestBody & { client?: UpdateClientRequestBody },
    {}
  >,
  res: Response,
  next: NextFunction
) => {
  const { email, phone } = req.body;

  req.body.client = {
    ...(email && { email }),
    ...(phone && { phone }),
  };

  return next();
};
