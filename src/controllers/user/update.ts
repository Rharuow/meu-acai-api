import { getUser, updateUser } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    const user = req.body.user
      ? await updateUser({ fields: req.body.user, id: userId })
      : await getUser({ id: userId, includes: ["Role"] });

    req.body.user = { ...user };

    return next();
  } catch (error) {
    console.log("Error updating user = ", error);
    return unprocessableEntity(res, { message: "Error updating user" });
  }
};
