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

export const getMember = async ({ id }: { id: string }) => {
  return await prismaClient.member.findUnique({ where: { id } });
};

export const findMember = async (params: {
  name?: string;
  userId?: string;
  id?: string;
}) => {
  if (params.hasOwnProperty("name")) {
    const user = await prismaClient.user.findUnique({
      where: {
        name: params.name,
      },
      include: {
        member: true,
      },
    });

    return user.member;
  }

  const member = await prismaClient.member.findUnique({
    where: {
      ...(params.userId && { userId: params.userId }),
      ...(params.id && { id: params.id }),
    },
  });

  return member;
};
