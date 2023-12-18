import { CreateToppingRequestBody } from "@/types/topping/createRequestBody";
import { prismaClient } from "@libs/prisma";

export const createToppingRepository = async (
  params: CreateToppingRequestBody
) => {
  const topping = await prismaClient.topping.create({
    data: params,
  });

  return topping;
};

export const deleteToppingRepository = async ({ id }: { id: string }) => {
  return await prismaClient.topping.delete({ where: { id } });
};
