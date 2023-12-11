import { CreateUserRequestBody } from "./../../../types/user/createRequestbody.d";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { prismaClient } from "@libs/prisma";

import { encodeSha256 } from "@libs/crypto";

export const createClient = async ({
  address: { house, square },
  name,
  password,
  roleId,
  email,
  phone,
}: CreateClientRequestBody & CreateUserRequestBody) => {
  const client = await prismaClient.user.create({
    data: {
      name,
      password: encodeSha256(password),
      roleId,
      client: {
        create: {
          ...(email && { email }),
          ...(phone && { phone }),
          address: {
            create: {
              house,
              square,
            },
          },
        },
      },
    },
    include: {
      role: true,
      client: true,
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

export const findClient = async (params: {
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
        client: true,
      },
    });

    return user.client;
  }

  const client = await prismaClient.client.findUnique({
    where: {
      ...(params.userId && { userId: params.userId }),
      ...(params.id && { id: params.id }),
    },
  });

  return client;
};
