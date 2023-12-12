import { CreateUserRequestBody } from "./../../../types/user/createRequestbody.d";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { prismaClient } from "@libs/prisma";

import { encodeSha256 } from "@libs/crypto";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { Client, Role, User } from "@prisma/client";

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
  id,
  userId,
  fields: { email, password, name, phone },
}: {
  userId: string;
  id: string;
  fields: UpdateUserRequestBody & UpdateClientRequestBody;
}) => {
  try {
    const { user, ...client } = await prismaClient.client.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
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
    return { ...user, client };
  } catch (error) {
    throw new Error(error);
  }
};

export const getClient: ({
  id,
}: {
  id: string;
}) => Promise<User & { client: Client; role: Role }> = async ({ id }) => {
  const { user, ...client } = await prismaClient.client.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  return {
    ...user,
    client: {
      ...client,
    },
  };
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
