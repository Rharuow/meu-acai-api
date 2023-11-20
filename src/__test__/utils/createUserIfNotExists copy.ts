import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";

export const createUserIfNotExist = async (id: string) => {
  const user = await prismaClient.user.findFirst({
    where: { name: "Test Admin", password: encodeSha256("123") },
  });

  !user &&
    (await prismaClient.user.create({
      data: {
        name: "Test Admin",
        password: encodeSha256("123"),
        roleId: id,
      },
    }));
};

export const cleanCreateUserIfNotExist = async () => {
  const user = await prismaClient.user.findFirst({
    where: { name: "Test Admin", password: encodeSha256("123") },
  });
  await prismaClient.user.delete({ where: { id: user.id } });
};
