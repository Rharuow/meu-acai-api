import { unprocessableEntity } from "@serializer/erros/422";
import { CreateUserRequestBody, createUser } from "@repositories/user";
import { NextFunction, Request, Response } from "express";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, password, roleId } = req.body as CreateUserRequestBody;

  try {
    const user = await createUser({ name, password, roleId });

    console.log("User created = ", user);

    req.body.user = user;

    return next();
  } catch (error) {
    console.error("Error creating user = ", error);
    return unprocessableEntity(res);
  }
};
