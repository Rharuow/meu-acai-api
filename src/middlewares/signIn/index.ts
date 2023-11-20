import { User } from "@prisma/client";
import { getUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { verify } from "jsonwebtoken";

export const validationSignInParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  // If errors return 422, client didn't provide required or unpermitted values at query parameters
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};

export const validationUserAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await getUser({
      username: req.body.username,
      password: req.body.password,
    });

    return next();
  } catch (error) {
    console.log("Middleware signIn validation user req body params = ", error);
    return res.status(401).json({ message: "Token with user invalid" });
  }
};
