import { CreateUserRequestBody } from "./../../../types/user/createRequestbody.d";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";
import { prismaClient } from "@libs/prisma";

import { encodeSha256 } from "@libs/crypto";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { Address, Client, ROLE, Role, User } from "@prisma/client";
import { userInMemory, usersInMemory } from "@libs/memory-cache";

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
  userInMemory.clear();
  usersInMemory.clear();
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
    userInMemory.clear();
    usersInMemory.clear();
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
  includes?: Array<ROLE | "ADDRESS">;
}) => {
  if (params.hasOwnProperty("name")) {
    const user = await prismaClient.user.findUnique({
      where: {
        name: params.name,
      },
      include: {
        client: {
          include: {
            members: params.includes && params.includes.includes("MEMBER"),
            address: params.includes && params.includes.includes("ADDRESS"),
          },
        },
      },
    });

    return user.client;
  }

  const client = await prismaClient.client.findUnique({
    where: {
      ...(params.userId && { userId: params.userId }),
      ...(params.id && { id: params.id }),
    },
    include: {
      members: params.includes && params.includes.includes("MEMBER"),
      address: params.includes && params.includes.includes("ADDRESS"),
    },
  });

  return client;
};

// TO-DO: ADD PRODUCTS RELATION TOO
export const swapClient = async ({
  memberId,
  id,
}: {
  memberId: string;
  id: string;
}) => {
  const [client, member] = await Promise.all([
    prismaClient.client.findUnique({
      where: {
        id,
      },
      include: {
        address: true,
        members: true,
        user: true,
      },
    }),
    prismaClient.member.findUnique({
      where: {
        id: memberId,
      },
      include: {
        user: true,
      },
    }),
  ]);

  await prismaClient.client.delete({
    where: { id: client.id },
  });

  const newUserClient = await prismaClient.user.update({
    where: {
      id: member.userId,
    },
    data: {
      client: {
        create: {
          address: {
            create: {
              house: client.address.house,
              square: client.address.square,
            },
          },
          members: {
            createMany: {
              data: client.members.filter((mbr) => mbr.id !== member.id),
            },
          },
          ...(member.email && { email: member.email }),
          ...(member.phone && { phone: member.phone }),
        },
      },
      roleId: client.user.roleId,
    },
    include: {
      client: {
        include: {
          address: true,
        },
      },
      role: true,
    },
  });

  await prismaClient.user.update({
    where: {
      id: client.userId,
    },
    data: {
      member: {
        create: {
          clientId: newUserClient.client.id,
          ...(client.email && { email: client.email }),
          ...(client.phone && { phone: client.phone }),
        },
      },
    },
  });
  userInMemory.clear();
  usersInMemory.clear();
  return newUserClient;
};

export const updateAddress = async ({
  cliendId,
  address,
}: {
  cliendId: string;
  address: { house: Address["house"]; square: Address["square"] };
}) => {
  const client = await prismaClient.client.update({
    where: {
      id: cliendId,
    },
    data: {
      address: {
        update: {
          house: address.house,
          square: address.square,
        },
      },
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
      address: true,
    },
  });
  userInMemory.clear();
  usersInMemory.clear();
  return { ...client.user, client };
};
