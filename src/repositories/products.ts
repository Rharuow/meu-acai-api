import { CreateProductRequestBody } from "@/types/product/createRequestBody";
import {
  productInMemory,
  productsInMemory,
  totalProductsInMemory,
} from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import { Product } from "@prisma/client";
import {
  Params,
  createOrder,
  createQuery,
  createReferenceMemoryCacheQuery,
} from "./utils/queryBuilder";
import { orderProductByOptions } from "@/routes/resources/product";
import { UpdateProductRequestBody } from "@/types/product/updateRequestBody";

export const createProductRepository = async (
  data: CreateProductRequestBody
) => {
  const product = await prismaClient.product.create({
    data,
  });
  productsInMemory.clear();
  productInMemory.clear();
  return product;
};

export const getProductRepository: ({
  id,
}: {
  id: string;
}) => Promise<Product> = async ({ id }) => {
  if (!productInMemory.hasItem(id)) {
    productInMemory.storeExpiringItem(
      id,
      await prismaClient.product.findUniqueOrThrow({ where: { id } }),
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
  }
  return productInMemory.retrieveItemValue(id);
};

export type ParamsProduct = Params & {
  orderBy: (typeof orderProductByOptions)[number];
};

export const listProductsRepository: (
  params: Params
) => Promise<[Array<Product>, number]> = async ({
  page,
  perPage,
  orderBy,
  filter,
}) => {
  const [fieldOrderBy, order] = orderBy.split(":");
  const where = filter && createQuery({ filterFields: filter.split(",") });
  // create a string reference to save in memory the list of products
  const reference = createReferenceMemoryCacheQuery({
    referenceString: "product",
    params: {
      page,
      perPage,
      orderBy,
      filter,
    },
  });
  if (!productsInMemory.hasItem(reference)) {
    const [products, totalProducts] = await Promise.all([
      prismaClient.product.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: createOrder({ fieldOrderBy, order }),
        where,
      }),
      prismaClient.product.count({ where }),
    ]);

    productsInMemory.storeExpiringItem(
      reference,
      products,
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
    totalProductsInMemory.storeExpiringItem(
      `total-${reference}`,
      totalProducts,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  return [
    productsInMemory.retrieveItemValue(reference),
    totalProductsInMemory.retrieveItemValue(`total-${reference}`),
  ];
};

export const updateProductRepository: ({
  id,
  fields,
}: {
  id: string;
  fields: UpdateProductRequestBody;
}) => Promise<Product> = async ({ fields, id }) => {
  const product = await prismaClient.product.update({
    where: { id },
    data: fields,
  });
  productsInMemory.clear();
  productInMemory.clear();
  return product;
};

export const deleteProductRepository = async ({ id }: { id: string }) => {
  const product = await prismaClient.product.delete({
    where: {
      id,
    },
  });
  productsInMemory.clear();
  productInMemory.clear();
  return product;
};

export const deleteManyProductsRepository = async ({
  ids,
}: {
  ids: Array<string>;
}) => {
  const product = await prismaClient.product.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  productsInMemory.clear();
  productInMemory.clear();
  return product;
};
