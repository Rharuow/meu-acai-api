import { prismaClient } from "@libs/prisma";

export const createMember = async (params: {
  userId: string;
  clientId: string;
  email?: string;
  phone?: string;
  relationship?: string;
}) => {
  const member = await prismaClient.member.create({
    data: params,
  });

  return member;
};
