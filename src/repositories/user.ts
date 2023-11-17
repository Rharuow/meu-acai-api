import "module-alias/register";
import { encodeSha256 } from "@libs/crypto";
import { userInMemory } from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";

type Params = {
  username?: string;
  password?: string;
  id?: string;
};

const createQuery = (params?: Params) => {
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

  return query;
};

const createReferenceMememoryQuery = (params?: Params) => {
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

  return referenceString;
};

export const getUser = async (params?: Params) => {
  const reference = createReferenceMememoryQuery(params);
  if (!userInMemory.hasItem(reference)) {
    console.log("QUERY IN DB");
    const user = await prismaClient.user.findFirstOrThrow(createQuery(params));
    userInMemory.storeExpiringItem(
      reference,
      user,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }
  console.log("RETURN BY MEMORY");

  return userInMemory.retrieveItemValue(reference);
};
