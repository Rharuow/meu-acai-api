import { updateUser } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";
import { NextFunction, Request, Response } from "express";

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, id } = req.params;

  try {
    const user = await updateUser({ fields: req.body.user, id: userId });

    req.body.user = { ...user, adminId: id };

    return next();
  } catch (error) {
    console.error("Error updating user = ", error.message);

    return unprocessableEntity(res, { message: "Error updating user" });
  }
};
