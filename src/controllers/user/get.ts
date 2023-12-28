import { Admin, Client, Member, User } from "@prisma/client";
import { Includes, getUser } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";
import { getUserSerializer } from "@serializer/resources/user";
import { getAdminSerializer } from "@serializer/resources/user/admin";
import { getClientSerializer } from "@serializer/resources/user/client";
import { getMemberSerializer } from "@serializer/resources/user/member";
import { Request, Response } from "express";

export const getUserController = async (
  req: Request<
    { userId: string; id: string },
    {},
    { includes: Array<Includes> },
    qs.ParsedQs
  >,
  res: Response
) => {
  const { userId, id } = req.params;

  const { includes } = req.body;

  try {
    const user = await getUser({ id: userId, includes });

    if (
      includes.includes("Admin") &&
      (user as User & { admin: Admin }).admin.id !== id
    )
      throw new Error("Admin does not belongs to this user");

    if (
      includes.includes("Client") &&
      (user as User & { client: Client }).client.id !== id
    )
      throw new Error("Client does not belongs to this user");

    if (
      includes.includes("Member") &&
      (user as User & { member: Member }).member.id !== id
    )
      throw new Error("Member does not belongs to this user");

    return includes.includes("Admin")
      ? getAdminSerializer({ res, user })
      : includes.includes("Member")
      ? getMemberSerializer({ res, user })
      : includes.includes("Client")
      ? getClientSerializer({ res, user })
      : getUserSerializer({ res, user });
  } catch (error) {
    return unprocessableEntity(res, {
      message: "Error get a user" + error.message,
    });
  }
};
