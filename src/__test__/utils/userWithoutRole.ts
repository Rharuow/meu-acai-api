import { prismaClient } from "@libs/prisma";
import { User } from "@prisma/client";

export const userWithoutRole = {
  name: "user without role",
  password: "123",
};

export const createUserWithoutRole = async () => {
  const user = await prismaClient.user.create({
    data: {
      name: userWithoutRole.name,
      password: userWithoutRole.password,
      roleId: "q",
    },
  });

  return user;
};
