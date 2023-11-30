import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { VerifyErrors, verify } from "jsonwebtoken";

// Middleware to verify the access token
export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization.split("Bearer ")[1];

  let status = 200;

  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No access token provided" });
  }

  verify(
    accessToken,
    process.env.TOKEN_SECRET,
    (err: VerifyErrors | null, user: User | undefined) => {
      if (err) {
        status = 401;
      }
      req.body.user = user;
    }
  );

  return status === 200
    ? next()
    : res.status(401).json({ message: "Unauthorized: Invalid access token" });
};
