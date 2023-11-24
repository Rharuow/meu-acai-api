import { getUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";

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
