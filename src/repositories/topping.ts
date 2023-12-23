import { CreateToppingRequestBody } from "@/types/topping/createRequestBody";
import {
  toppingInMemory,
  toppingsInMemory,
  totalToppingsInMemory,
} from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import {
  Params,
  createOrder,
  createQuery,
  createReferenceMemoryCacheQuery,
} from "./utils/queryBuilder";
import { Topping } from "@prisma/client";
import { UpdateToppingRequestBody } from "@/types/topping/updateRequestBody";

const TIMETOEXPIRE = process.env.NODE_ENV === "test" ? 5 : 3600; // if test env expire in 5 miliseconds else 1 hour

export const createToppingRepository = async (
  params: CreateToppingRequestBody
) => {
  const topping = await prismaClient.topping.create({
    data: params,
  });
  toppingInMemory.clear();
  toppingsInMemory.clear();
  totalToppingsInMemory.clear();
  return topping;
};

export const deleteToppingRepository = async ({ id }: { id: string }) => {
  const topping = await prismaClient.topping.delete({ where: { id } });
  toppingInMemory.clear();
  toppingsInMemory.clear();
  totalToppingsInMemory.clear();
  return topping;
};

export const deleteManyToppingsRepository = async ({
  ids,
}: {
  ids: Array<string>;
}) => {
  const toppings = await prismaClient.topping.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  toppingInMemory.clear();
  toppingsInMemory.clear();
  totalToppingsInMemory.clear();
  return toppings;
};

export const getToppingRepository = async ({ id }: { id: string }) => {
  if (!toppingInMemory.hasItem(id)) {
    toppingInMemory.storeExpiringItem(
      id,
      await prismaClient.topping.findUniqueOrThrow({
        where: { id },
      }),
      TIMETOEXPIRE
    );
  }

  return toppingInMemory.retrieveItemValue(id);
};

export const listToppingRepository: (
  params: Params
) => Promise<[Array<Topping>, number]> = async (params: Params) => {
  const [fieldOrderBy, order] = params.orderBy.split(":");
  const where =
    params.filter && createQuery({ filterFields: params.filter.split(",") });
  const memoryReference = createReferenceMemoryCacheQuery({
    params,
    referenceString: "toppings",
  });

  if (!toppingsInMemory.hasItem(memoryReference)) {
    const [toppings, totalToppings] = await Promise.all([
      prismaClient.topping.findMany({
        skip: (params.page - 1) * params.perPage,
        take: params.perPage,
        orderBy: createOrder({ fieldOrderBy, order }),
        where,
      }),
      prismaClient.topping.count({ where }),
    ]);
    toppingsInMemory.storeExpiringItem(memoryReference, toppings, TIMETOEXPIRE);
    totalToppingsInMemory.storeExpiringItem(
      `total-${memoryReference}`,
      totalToppings,
      TIMETOEXPIRE
    );
  }
  return [
    toppingsInMemory.retrieveItemValue(memoryReference),
    totalToppingsInMemory.retrieveItemValue(`total-${memoryReference}`),
  ];
};

export const updateToppingRepository = async ({
  data,
  id,
}: {
  data: UpdateToppingRequestBody;
  id: string;
}) => {
  const topping = await prismaClient.topping.update({
    where: {
      id,
    },
    data,
  });
  toppingInMemory.clear();
  toppingsInMemory.clear();
  totalToppingsInMemory.clear();
  return topping;
};
