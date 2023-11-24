import {
  creamInMemory,
  creamsInMemory,
  totalCreamsInMemory,
} from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import { Cream } from "@prisma/client";

type WhereType = {
  [key: string]: string | boolean | { contains: string };
};

export type Params = {
  page: number;
  perPage: number;
  orderBy:
    | "id:asc"
    | "id:desc"
    | "name:asc"
    | "name:desc"
    | "price:asc"
    | "price:desc"
    | "amount:asc"
    | "amount:desc"
    | "createdAt:asc"
    | "createdAt:desc"
    | string;
  filter?: string;
};

function parseValue(
  operator: string,
  value: string
): string | boolean | { contains: string } {
  if (operator === "like") {
    return { contains: value };
  } else if (operator === "true") {
    return true;
  } else if (operator === "false") {
    return false;
  } else {
    return value;
  }
}

const createReferenceMemoryCacheQuery = ({
  params,
  referenceString,
}: {
  referenceString: string;
  params: Params;
}) => {
  referenceString = referenceString.concat(
    "-",
    String(params.page),
    "-",
    String(params.perPage),
    "-",
    String(params.orderBy),
    "-",
    String(params.filter)
  );

  return referenceString;
};

export const listCreams: (
  params: Params
) => Promise<[Array<Cream>, number]> = async ({
  page,
  perPage,
  orderBy,
  filter,
}) => {
  // create a string reference to save in memory the list of creams
  const [fieldOrderBy, order] = orderBy.split(":");
  const filterFields = filter && filter.split(",");
  const where: WhereType = {};
  if (filterFields)
    filterFields.forEach((filter) => {
      const [key, operator, value] = filter.split(":");
      where[key] = parseValue(operator, value);
    });
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
    console.log("CREAM IN DB");
    const [creams, totalCreams] = await Promise.all([
      await prismaClient.cream.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          [fieldOrderBy]: order || "asc",
        },
        where,
      }),
      await prismaClient.cream.count({ where }),
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
  fields: CreateCreamRequestBody & { adminId: string }
) => Promise<Cream> = async ({ amount, name, price, unit, photo, adminId }) => {
  creamsInMemory.clear();
  creamInMemory.clear();
  return await prismaClient.cream.create({
    data: {
      name,
      amount,
      price,
      unit,
      adminId,
      ...(photo && { photo }),
    },
  });
};

export const updateCream: ({
  id,
  fields,
}: {
  id: string;
  fields: UpdateCreamRequestBody;
}) => Promise<Cream> = async ({ fields, id }) => {
  creamsInMemory.clear();
  creamInMemory.clear();
  return await prismaClient.cream.update({
    where: { id },
    data: fields,
  });
};

export const getCream: ({ id }: { id: string }) => Promise<Cream> = async ({
  id,
}) => {
  if (!creamInMemory.hasItem(id)) {
    creamInMemory.storeExpiringItem(
      id,
      await prismaClient.cream.findFirst({ where: { id } }),
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
  }
  return creamInMemory.retrieveItemValue(id);
};

export const deleteCream: ({ id }: { id: string }) => Promise<void> = async ({
  id,
}) => {
  await prismaClient.cream.delete({ where: { id } });
  return;
};
