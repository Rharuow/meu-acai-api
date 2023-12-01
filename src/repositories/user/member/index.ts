import { prismaClient } from "@libs/prisma";

export const createMember = async (params: {
  userId: string;
  clientId: string;
  email?: string;
  phone?: string;
  relationship?: string;
}) => {
  const member = await prismaClient.member.create({
    data: {
      clientId: params.clientId,
      userId: params.userId,
      ...(params.email && { email: params.email }),
      ...(params.phone && { phone: params.phone }),
      ...(params.relationship && { relationship: params.relationship }),
    },
  });

  return member;
};
