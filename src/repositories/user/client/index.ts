import { Params } from "@repositories/utils/queryBuilder";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { prismaClient } from "@libs/prisma";

export type ParamsClient = Params & {
  orderBy:
    | "name:asc"
    | "name:desc"
    | "role:asc"
    | "role:desc"
    | "createdAt:asc"
    | "createdAt:desc";
};

export const createClient = async ({
  userId,
  addressId,
}: CreateClientRequestBody) => {
  const client = await prismaClient.client.create({
    data: {
      addressId,
      userId,
    },
  });

  await prismaClient.address.update({
    where: { id: addressId },
    data: {
      clientId: client.id,
    },
  });
  return client;
};

export const createManyClients = async ({
  users,
}: {
  users: Array<{ id: string; addressId: string }>;
}) => {
  const usersIds = users.map((user) => user.id);
  const client = await prismaClient.client.createMany({
    data: users.map((user) => ({
      addressId: user.addressId,
      userId: user.id,
    })),
    skipDuplicates: true,
  });

  // Fetch the IDs of the created clients
  const clientIds = await prismaClient.client.findMany({
    where: {
      userId: { in: usersIds },
    },
    select: {
      id: true,
    },
  });

  // Extract the IDs from the fetched clients
  const extractedClientIds = clientIds.map((client) => client.id);

  // Update the clientId field in the User model
  for (let i = 0; i < usersIds.length; i++) {
    const userId = usersIds[i];
    const clientId = extractedClientIds[i];

    await prismaClient.user.update({
      where: { id: userId },
      data: { clientId },
    });
  }
  return client;
};

export const updateClient = async ({
  userId,
  id,
  fields,
}: {
  userId: string;
  id: string;
  fields: UpdateClientRequestBody;
}) => {
  return await prismaClient.client.update({
    where: { userId, id },
    data: fields,
  });
};

export const getClient = async ({ id }: { id: string }) => {
  return await prismaClient.client.findUnique({ where: { id } });
};
