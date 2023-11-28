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

export const createManyAdmins = async ({
  usersIds,
}: {
  usersIds: Array<string>;
}) => {
  const admins = await prismaClient.admin.createMany({
    data: usersIds.map((userId) => ({
      userId,
    })),
    skipDuplicates: true,
  });

  // Fetch the IDs of the created admins
  const adminIds = await prismaClient.admin.findMany({
    where: {
      userId: { in: usersIds },
    },
    select: {
      id: true,
    },
  });

  // Extract the IDs from the fetched admins
  const extractedAdminIds = adminIds.map((admin) => admin.id);

  // Update the adminId field in the User model
  for (let i = 0; i < usersIds.length; i++) {
    const userId = usersIds[i];
    const adminId = extractedAdminIds[i];

    await prismaClient.user.update({
      where: { id: userId },
      data: { adminId },
    });
  }
  return admins;
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
