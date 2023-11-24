import { prismaClient } from "@libs/prisma";

export const createAddressIfNotExistis = async () => {
  const hasAddress = await prismaClient.address.findFirst({
    where: {
      house: "1",
      square: "1",
    },
  });

  if (!hasAddress)
    return await prismaClient.address.create({
      data: {
        house: "1",
        square: "1",
      },
    });

  return hasAddress;
};
