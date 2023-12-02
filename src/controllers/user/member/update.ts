import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { User } from "@prisma/client";
import { getMember, updateMember } from "@repositories/user/member";
import { unprocessableEntity } from "@serializer/erros/422";
import { updateMemberSerializer } from "@serializer/resources/user/member";
import { Request, Response } from "express";

export const updateMemberController = async (
  req: Request<
    { id: string },
    {},
    UpdateMemberRequestBody &
      UpdateMemberRequestBody & { user: User } & {
        member: UpdateMemberRequestBody;
      },
    {}
  >,
  res: Response
) => {
  const { user, member: memberFields } = req.body;

  const { id } = req.params;

  try {
    const member = memberFields
      ? await updateMember({ userId: user.id, id, fields: memberFields })
      : await getMember({ id });

    return updateMemberSerializer({
      res,
      user: { ...user, memberId: member.id },
      member,
    });
  } catch (error) {
    return unprocessableEntity(res, {
      message: "Error updating member = " + error.message,
    });
  }
};
