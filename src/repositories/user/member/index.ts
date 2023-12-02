import { CreateMemberRequestBody } from "@/types/user/member/createRequestBody";
import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { prismaClient } from "@libs/prisma";

export const createMember = async (params: CreateMemberRequestBody) => {
  const member = await prismaClient.member.create({
    data: {
      clientId: params.clientId,
      userId: params.userId,
      ...(params.email && { email: params.email }),
      ...(params.phone && { phone: params.phone }),
      ...(params.relationship && { relationship: params.relationship }),
    },
  });

  return member;
};

export const updateMember = async ({
  userId,
  id,
  fields,
}: {
  userId: string;
  id: string;
  fields: UpdateMemberRequestBody;
}) => {
  return await prismaClient.member.update({
    where: { userId, id },
    data: fields,
  });
};
