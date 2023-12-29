import { CreateCreamRequestBody } from "@/types/creams/createRequestbody";
import { UpdateCreamRequestBody } from "@/types/creams/updateRequestBody";
import {
  creamInMemory,
  creamsInMemory,
  totalCreamsInMemory,
} from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import { Cream } from "@prisma/client";
import {
  Params,
  createOrder,
  createQuery,
  createReferenceMemoryCacheQuery,
} from "./utils/queryBuilder";
import { paramsCreamByOptions } from "@/routes/resources/cream";

export type ParamsCream = Params & {
  orderBy: (typeof paramsCreamByOptions)[number];
};

export const listCreams: (
  params: ParamsCream
) => Promise<[Array<Cream>, number]> = async ({
  page,
  perPage,
  orderBy,
  filter,
}) => {
  const [fieldOrderBy, order] = orderBy.split(":");
  const where = filter && createQuery({ filterFields: filter.split(",") });
  // create a string reference to save in memory the list of creams
  const reference = createReferenceMemoryCacheQuery({
    referenceString: "cream",
    params: {
      page,
      perPage,
      orderBy,
      filter,
    },
  });
  if (!creamsInMemory.hasItem(reference)) {
    const [creams, totalCreams] = await Promise.all([
      prismaClient.cream.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: createOrder({ fieldOrderBy, order }),
        where,
      }),
      prismaClient.cream.count({ where }),
    ]);

    creamsInMemory.storeExpiringItem(
      reference,
      creams,
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
    totalCreamsInMemory.storeExpiringItem(
      `total-${reference}`,
      totalCreams,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  return [
    creamsInMemory.retrieveItemValue(reference),
    totalCreamsInMemory.retrieveItemValue(`total-${reference}`),
  ];
};

export const createCream: (
  fields: CreateCreamRequestBody
) => Promise<Cream> = async ({ amount, name, price, unit, photo, adminId }) => {
  const cream = await prismaClient.cream.create({
    data: {
      name,
      amount,
      price,
      unit,
      adminId,
      ...(photo && { photo }),
    },
  });
  creamsInMemory.clear();
  creamInMemory.clear();
  return cream;
};

export const updateCream: ({
  id,
  fields,
}: {
  id: string;
  fields: UpdateCreamRequestBody;
}) => Promise<Cream> = async ({ fields, id }) => {
  const cream = await prismaClient.cream.update({
    where: { id },
    data: fields,
  });
  creamsInMemory.clear();
  creamInMemory.clear();
  return cream;
};

export const getCream: ({ id }: { id: string }) => Promise<Cream> = async ({
  id,
}) => {
  if (!creamInMemory.hasItem(id)) {
    creamInMemory.storeExpiringItem(
      id,
      await prismaClient.cream.findUniqueOrThrow({ where: { id } }),
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
  }
  return creamInMemory.retrieveItemValue(id);
};

export const deleteCream: ({ id }: { id: string }) => Promise<void> = async ({
  id,
}) => {
  await prismaClient.cream.delete({ where: { id } });
  creamsInMemory.clear();
  creamInMemory.clear();
  return;
};

export const deleteManyCreams = async ({ ids }: { ids: Array<string> }) => {
  await prismaClient.cream.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  creamsInMemory.clear();
  creamInMemory.clear();
  return;
};
