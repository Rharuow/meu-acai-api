import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";
import { userAdmin } from "./userAdmin";

export const createUserIfNotExist = async (id: string) => {
  const user = await prismaClient.user.findFirst({
    where: {
      name: userAdmin.username,
      password: encodeSha256(userAdmin.password),
    },
  });

  !user &&
    (await prismaClient.user.create({
      data: {
        name: userAdmin.username,
        password: encodeSha256(userAdmin.password),
        roleId: id,
      },
    }));
};

export const cleanCreateUserIfNotExist = async () => {
  const user = await prismaClient.user.findFirst({
    where: {
      name: userAdmin.username,
      password: encodeSha256(userAdmin.password),
    },
  });
  await prismaClient.user.delete({ where: { id: user.id } });
};
