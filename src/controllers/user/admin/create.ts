import { unprocessableEntity } from "@serializer/erros/422";
import { createAdminSerializer } from "@serializer/resources/user/admin";
import { createAdmin } from "@repositories/user/admin";
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
