import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { User } from "@prisma/client";
import { getMember, updateMember } from "@repositories/user/member";
import { unprocessableEntity } from "@serializer/erros/422";
import { updateMemberSerializer } from "@serializer/resources/user/member";
import { Request, Response } from "express";

export const updateMemberController = async (
  req: Request<
    { id: string; userId: string },
    {},
    UpdateMemberRequestBody & UpdateMemberRequestBody,
    {}
  >,
  res: Response
) => {
  const { id, userId } = req.params;

  try {
    const member = await updateMember({ fields: req.body, id, userId });

    return updateMemberSerializer({
      res,
      member,
    });
  } catch (error) {
    return unprocessableEntity(res, {
      message: "Error updating member = " + error.message,
    });
  }
};
