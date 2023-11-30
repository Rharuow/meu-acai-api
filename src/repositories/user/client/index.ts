import { Params } from "@repositories/utils/queryBuilder";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { prismaClient } from "@libs/prisma";
import {
  createAddress,
  getAddressByHouseAndSquare,
} from "@repositories/address";

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
  address: { house, square },
}: CreateClientRequestBody) => {
  let address = await getAddressByHouseAndSquare({ house, square });

  if (!address) address = await createAddress({ house, square });

  const client = await prismaClient.client.create({
    data: {
      addressId: address.id,
      userId,
    },
  });

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      clientId: client.id,
    },
  });

  await prismaClient.address.update({
    where: { id: address.id },
    data: {
      clientId: client.id,
    },
  });
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
