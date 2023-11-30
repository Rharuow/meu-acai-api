import { prismaClient } from "@libs/prisma";

type Address = {
  house: string;
  square: string;
};

export const createAddress = async ({ house, square }: Address) => {
  const address = await prismaClient.address.create({
    data: {
      house,
      square,
    },
  });
  return address;
};

export const createManyAddress = async (addresses: Array<Address>) => {
  await prismaClient.address.createMany({
    data: addresses,
  });

  const extractedAddresses = await prismaClient.address.findMany({
    where: {
      OR: addresses.map((address) => ({
        house: address.house,
        square: address.square,
      })),
    },
  });

  return extractedAddresses;
};

export const getAddressByHouseAndSquare = async ({
  house,
  square,
}: {
  house: string;
  square: string;
}) => {
  return await prismaClient.address.findUnique({
    where: {
      unique_house_square: {
        house,
        square,
      },
    },
  });
};

export const getAddress = async ({ id }: { id: string }) => {
  return await prismaClient.address.findUnique({
    where: { id },
  });
};
