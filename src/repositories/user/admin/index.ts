import { Params } from "@repositories/utils/queryBuilder";
import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";
import { UpdateAdminRequestBody } from "@/types/user/admin/updateRequestBody";
import { prismaClient } from "@libs/prisma";
import { encodeSha256 } from "@libs/crypto";
import { userInMemory, usersInMemory } from "@libs/memory-cache";

export type ParamsAdmin = Params & {
  orderBy:
    | "name:asc"
    | "name:desc"
    | "role:asc"
    | "role:desc"
    | "createdAt:asc"
    | "createdAt:desc";
};

export const createAdmin = async ({
  name,
  password,
  roleId,
  email,
  phone,
}: CreateAdminRequestBody) => {
  const userAdmin = await prismaClient.user.create({
    data: {
      name,
      password: encodeSha256(password),
      roleId,
      admin: {
        create: {
          ...(email && { email }),
          ...(phone && { phone }),
        },
      },
    },
    include: {
      admin: true,
      role: true,
    },
  });
  userInMemory.clear();
  usersInMemory.clear();
  return userAdmin;
};

export const updateAdmin = async ({
  userId,
  id,
  fields,
}: {
  userId: string;
  id: string;
  fields: UpdateAdminRequestBody;
}) => {
  const admin = await prismaClient.admin.update({
    where: { userId, id },
    data: fields,
  });
  userInMemory.clear();
  usersInMemory.clear();
  return admin;
};

export const getAdmin = async ({ id }: { id: string }) => {
  return await prismaClient.admin.findUnique({ where: { id } });
};
