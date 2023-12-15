import { findClient } from "@repositories/user/client";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const validationMemberBelongsToClient = async (
  req: Request<{ id: string }, {}, { memberId: string }, qs.ParsedQs>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const client = await findClient({ id, includes: ["MEMBER"] });

  if (!client) return badRequest({ res, message: "No client found" });

  if (
    client.members.length > 0 &&
    client.members.some((member) => member.id === memberId)
  )
    return next();

  return badRequest({ res, message: "Member not belongs to this client." });
};
