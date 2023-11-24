import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";

export const createUserIfNotExist = async (
  id: string,
  { username, password }: { username: string; password: string }
) => {
  const user = await prismaClient.user.findFirst({
    where: {
      name: username,
      password: encodeSha256(password),
    },
  });

  if (!user)
    return await prismaClient.user.create({
      data: {
        name: username,
        password: encodeSha256(password),
        roleId: id,
      },
    });
  return user;
};

export const cleanCreateUserIfNotExist = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const user = await prismaClient.user.findFirst({
    where: {
      name: username,
      password: encodeSha256(password),
    },
  });
  await prismaClient.user.delete({ where: { id: user.id } });
};
