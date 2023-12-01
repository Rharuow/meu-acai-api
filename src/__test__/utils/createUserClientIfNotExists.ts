import { prismaClient } from "@libs/prisma";
import { Address, User } from "@prisma/client";

export const createUserClientIfNotExists = async (
  user: User,
  address: Address
) => {
  const hasClient = await prismaClient.client.findFirst({
    where: { userId: user.id },
  });

  if (!hasClient) {
    const client = await prismaClient.client.create({
      data: {
        userId: user.id,
        addressId: address.id,
      },
    });

    await prismaClient.user.update({
      data: {
        clientId: client.id,
      },
      where: {
        id: user.id,
      },
    });

    return client;
  }

  return hasClient;
};
