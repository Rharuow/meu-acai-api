import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { CreateMemberRequestBody } from "@/types/user/member/createRequestBody";
import { UpdateMemberRequestBody } from "@/types/user/member/updateRequestBody";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { encodeSha256 } from "@libs/crypto";
import { userInMemory, usersInMemory } from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";

export const createMember = async ({
  clientId,
  name,
  password,
  roleId,
  email,
  phone,
  relationship,
}: CreateMemberRequestBody) => {
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
  userInMemory.clear();
  usersInMemory.clear();
  return member;
};

export const updateMember = async ({
  userId,
  id,
  fields: { email, name, password, relationship, phone },
}: {
  userId: string;
  id: string;
  fields: UpdateMemberRequestBody & UpdateUserRequestBody;
}) => {
  const { user, ...member } = await prismaClient.member.update({
    where: { id },
    data: {
      ...(relationship && { relationship }),
      ...(phone && { phone }),
      ...(email && { email }),
      user: {
        update: {
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(password && { password }),
          },
        },
      },
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });
  userInMemory.clear();
  usersInMemory.clear();
  return { ...user, member };
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
