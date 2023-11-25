import { prismaClient } from "@libs/prisma";

export type CreateAdminRequestBody = {
  userId: string;
};

export const createAdmin = async ({ userId }: CreateAdminRequestBody) => {
  return await prismaClient.admin.create({
    data: {
      userId,
    },
  });
};
