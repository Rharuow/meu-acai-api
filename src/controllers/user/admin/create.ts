import { unprocessableEntity } from "@serializer/erros/422";
import {
  createAdminSerializer,
  createManyAdminSerializer,
} from "@serializer/resources/user/admin";
import { createAdmin, createManyAdmins } from "@repositories/user/admin";
import { Request, Response } from "express";

export const createAdminController = async (req: Request, res: Response) => {
  const { user } = req.body;
  try {
    const admin = await createAdmin({ userId: user.id });

    return createAdminSerializer({ res, user, admin });
  } catch (error) {
    console.error("Error creating admin = ", error.message);
    return unprocessableEntity(res, {
      message: "Error creating admin = " + error.message,
    });
  }
};

export const createManyAdminsController = async (
  req: Request,
  res: Response
) => {
  const { usersIds } = req.body as { usersIds: Array<string> };

  try {
    await createManyAdmins({ usersIds });

    return createManyAdminSerializer({ res });
  } catch (error) {
    console.error("Error creating admin = ", error.message);
    return unprocessableEntity(res, {
      message: "Error creating admin = " + error.message,
    });
  }
};
