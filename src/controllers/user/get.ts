import { getUser } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";
import { getUserSerializer } from "@serializer/resources/user";
import { getAdminSerializer } from "@serializer/resources/user/admin";
import { getClientSerializer } from "@serializer/resources/user/client";
import { getMemberSerializer } from "@serializer/resources/user/member";
import { Request, Response } from "express";

export const getUserController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const { includes } = req.body;

  try {
    const user = await getUser({ id: userId, includes });

    return includes.includes("Admin")
      ? getAdminSerializer({ res, user })
      : includes.includes("Member")
      ? getMemberSerializer({ res, user })
      : includes.includes("Client")
      ? getClientSerializer({ res, user })
      : getUserSerializer({ res, user });
  } catch (error) {
    return unprocessableEntity(res, { message: "Error get a user" });
  }
};
