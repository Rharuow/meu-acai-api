import { prismaClient } from "@libs/prisma";
import { Address, User } from "@prisma/client";

export const createUserClientIfNotExists = async (
  user: User,
  address: Address
) => {
  const hasClient = await prismaClient.client.findFirst({
    where: { userId: user.id },
  });

  if (!hasClient)
    return await prismaClient.client.create({
      data: {
        userId: user.id,
        addressId: address.id,
      },
    });

  return hasClient;
};
