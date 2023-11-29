import { getAdmin, updateAdmin } from "@repositories/user/admin";
import { unprocessableEntity } from "@serializer/erros/422";
import { updateAdminSerializer } from "@serializer/resources/user/admin";
import { Request, Response } from "express";

export const updateAdminController = async (req: Request, res: Response) => {
  const { user, admin: adminFields } = req.body;

  const { id } = req.params;

  try {
    const admin = adminFields
      ? await updateAdmin({ userId: user.id, id, fields: adminFields })
      : await getAdmin({ id });

    return updateAdminSerializer({ res, user, admin });
  } catch (error) {
    return unprocessableEntity(res, {
      message: "Error updating admin = " + error.message,
    });
  }
};
