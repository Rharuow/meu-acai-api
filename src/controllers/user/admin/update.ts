import { updateAdmin } from "@/repositories/user/admin";
import { unprocessableEntity } from "@/serializer/erros/422";
import { updateAdminSerializer } from "@/serializer/resources/user/admin";
import { Request, Response } from "express";

export const updateAdminController = async (req: Request, res: Response) => {
  const { user, fields } = req.body;

  const { id } = req.params;

  try {
    const admin = await updateAdmin({ userId: user.id, id, fields });

    return updateAdminSerializer({ res, user, admin });
  } catch (error) {
    console.error("Error updating admin = ", error.message);
    return unprocessableEntity(res, {
      message: "Error updating admin = " + error.message,
    });
  }
};
