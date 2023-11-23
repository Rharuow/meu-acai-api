import { creamsInMemory, totalCreamsInMemory } from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import { Admin, Cream } from "@prisma/client";

type Params = {
  page: number;
  perPage: number;
};

const createReferenceMemoryCacheQuery = (params: Params) => {
  let referenceString = "creams";

  referenceString = referenceString.concat(
    "-",
    String(params.page),
    "-",
    String(params.perPage)
  );

  return referenceString;
};

export const listCreams: (
  params: Params
) => Promise<[Array<Cream>, number]> = async ({ page, perPage }) => {
  const reference = createReferenceMemoryCacheQuery({ page, perPage });
  if (!creamsInMemory.hasItem(reference)) {
    console.log("CREAM IN DB");
    const [creams, totalCreams] = await Promise.all([
      await prismaClient.cream.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      await prismaClient.cream.count(),
    ]);
    creamsInMemory.storeExpiringItem(
      reference,
      creams,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
    totalCreamsInMemory.storeExpiringItem(
      `total-${reference}`,
      totalCreams,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  console.log(`CREAM IN MEMORY`);

  return [
    creamsInMemory.retrieveItemValue(reference),
    totalCreamsInMemory.retrieveItemValue(`total-${reference}`),
  ];
};

export const createCream: (
  fields: CreateCreamRequestBody & { adminId: string }
) => Promise<Cream> = async ({ amount, name, price, unit, photo, adminId }) => {
  creamsInMemory.clear();
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
  return await prismaClient.cream.update({
    where: { id },
    data: fields,
  });
};
