import { Params } from "@repositories/utils/queryBuilder";
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
  const admin = await prismaClient.admin.create({
    data: {
      userId,
    },
  });
  await prismaClient.user.update({
    where: { id: userId },
    data: {
      adminId: admin.id,
    },
  });
  return admin;
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
