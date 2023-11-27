import { Params } from "@/repositories/utils/queryBuilder";
import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";
import { UpdateAdminRequestBody } from "@/types/user/admin/updateRequestBody";
import { prismaClient } from "@libs/prisma";

export type ParamsAdmin = Params & {
  orderBy:
    | "name:asc"
    | "name:desc"
    | "role:asc"
    | "role:desc"
    | "createdAt:asc"
    | "createdAt:desc";
};

export const createAdmin = async ({ userId }: CreateAdminRequestBody) => {
  return await prismaClient.admin.create({
    data: {
      userId,
    },
  });
};

export const createManyAdmins = async ({
  usersIds,
}: {
  usersIds: Array<string>;
}) => {
  return await prismaClient.admin.createMany({
    data: usersIds.map((userId) => ({
      userId,
    })),
    skipDuplicates: true,
  });
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
  return await prismaClient.admin.update({
    where: { userId, id },
    data: fields,
  });
};

export const getAdmin = async ({ id }: { id: string }) => {
  return await prismaClient.admin.findUnique({ where: { id } });
};
