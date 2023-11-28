import { prismaClient } from "@libs/prisma";

export const createAddress = async ({
  house,
  square,
}: {
  square: string;
  house: string;
}) => {
  const address = await prismaClient.address.create({
    data: {
      house,
      square,
    },
  });
  return address;
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
