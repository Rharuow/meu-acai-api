import { prismaClient } from "@libs/prisma";
import { Client, User } from "@prisma/client";

export const createUserMemberIfNotExists = async (
  user: User,
  client: Client
) => {
  const hasClient = await prismaClient.member.findFirst({
    where: { userId: user.id },
  });

  if (!hasClient)
    return await prismaClient.member.create({
      data: {
        userId: user.id,
        clientId: client.id,
        relationship: "Wife",
      },
    });

  return hasClient;
};
