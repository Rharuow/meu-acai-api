import { unprocessableEntity } from "@serializer/erros/422";
import { createAdminSerializer } from "@serializer/resources/user/admin";
import { createAdmin } from "@repositories/user/admin";
import { Request, Response } from "express";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";

export const createAdminController = async (
  req: Request<
    {},
    {},
    CreateUserRequestBody & CreateAdminRequestBody,
    qs.ParsedQs
  >,
  res: Response
) => {
  const { name, password, roleId, email, phone } = req.body;
  try {
    const admin = await createAdmin({ name, password, roleId, email, phone });

    return createAdminSerializer({ res, user: admin });
  } catch (error) {
    return unprocessableEntity(res, "Error creating admin = " + error.message);
  }
};
