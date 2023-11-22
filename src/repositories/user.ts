import "module-alias/register";
import { encodeSha256 } from "@libs/crypto";
import { userInMemory } from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";

type Params = {
  username?: string;
  password?: string;
  id?: string;
};

type Includes = "Role";

const createQuery = (params?: Params, includes?: Array<Includes>) => {
  let query = {};

  if (params.id && params.username && params.password)
    query = {
      where: {
        name: params.username,
        password: encodeSha256(params.password),
        id: params.id,
      },
    };

  if (!params.id && params.username && params.password)
    query = {
      where: {
        name: params.username,
        password: encodeSha256(params.password),
      },
    };

  if (params.id && params.username && !params.password)
    query = {
      where: {
        name: params.username,
        id: params.id,
      },
    };

  if (params.id && !params.username && !params.password)
    query = {
      where: {
        id: params.id,
      },
    };

  if (params.id && params.username && !params.password)
    query = {
      where: {
        id: params.id,
        password: encodeSha256(params.password),
      },
    };

  if (includes && includes.includes("Role"))
    query = {
      ...query,
      include: {
        role: true,
      },
    };
  return query;
};

const createReferenceMemoryQuery = (
  params?: Params,
  includes?: Array<Includes>
) => {
  let referenceString = "user";

  if (!params) return referenceString;

  if (params.id)
    referenceString = referenceString.concat("-", `id=${params.id}`);
  if (params.password)
    referenceString = referenceString.concat(
      "-",
      `password=${params.password}`
    );
  if (params.username)
    referenceString = referenceString.concat(
      "-",
      `username=${params.username}`
    );

  if (includes && includes.length > 0) {
    includes.forEach((include) => {
      referenceString = referenceString.concat("-", include);
    });
  }

  return referenceString;
};

export const getUser = async (params?: Params, includes?: Array<Includes>) => {
  const reference = createReferenceMemoryQuery(params);
  if (!userInMemory.hasItem(reference)) {
    const user = await prismaClient.user.findFirstOrThrow(
      createQuery(params, includes)
    );
    userInMemory.storeExpiringItem(
      reference,
      user,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }
  console.log("USER IN MEMORY");

  return userInMemory.retrieveItemValue(reference);
};
