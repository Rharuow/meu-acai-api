import { CreateProductRequestBody } from "@/types/product/createRequestBody";
import { prismaClient } from "@libs/prisma";

export const createProductRepository = async (
  data: CreateProductRequestBody
) => {
  return await prismaClient.product.create({
    data,
  });
};
