import { CreateToppingRequestBody } from "@/types/topping/createRequestBody";
import { prismaClient } from "@libs/prisma";
import { Topping } from "@prisma/client";

export const createToppingRepository = async (
  params: CreateToppingRequestBody
) => {
  const topping = await prismaClient.topping.create({
    data: params,
  });

  return topping;
};
