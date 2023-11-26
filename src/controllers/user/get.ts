import { getUser } from "@/repositories/user";
import { unprocessableEntity } from "@/serializer/erros/422";
import { getUserSerializer } from "@/serializer/resources/user";
import { getAdminSerializer } from "@/serializer/resources/user/admin";
import { Request, Response } from "express";

export const getUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const { includes } = req.body;

  try {
    const user = await getUser({ id: userId, includes });

    return includes.includes("Admin")
      ? getAdminSerializer({ res, user })
      : getUserSerializer({ res, user });
  } catch (error) {
    console.error("Error get a user = ", error.message);

    return unprocessableEntity(res, { message: "Error get a user" });
  }
};
