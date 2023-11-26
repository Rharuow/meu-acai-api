import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";
import { UpdateAdminRequestBody } from "@/types/user/admin/updateRequestBody";
import { prismaClient } from "@libs/prisma";

export const createAdmin = async ({ userId }: CreateAdminRequestBody) => {
  return await prismaClient.admin.create({
    data: {
      userId,
    },
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
