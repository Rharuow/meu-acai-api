import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { CreateMemberRequestBody } from "@/types/user/member/createRequestBody";
import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";

export const createMember = async ({
  clientId,
  name,
  password,
  roleId,
  email,
  phone,
  relationship,
}: CreateMemberRequestBody & CreateUserRequestBody) => {
  const member = await prismaClient.user.create({
    data: {
      name,
      password: encodeSha256(password),
      roleId,
      member: {
        create: {
          clientId,
          ...(phone && { phone }),
          ...(email && { email }),
          ...(relationship && { relationship }),
        },
      },
    },
    include: {
      member: true,
      role: true,
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
