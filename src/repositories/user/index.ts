import "module-alias/register";
import { encodeSha256 } from "@libs/crypto";
import { userInMemory } from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";

type Params = {
  name: string;
  password: string;
};

type Includes = "Role";

export type CreateUserRequestBody = {
  name: string;
  password: string;
  roleId: string;
};

const createQuery = (params: Params, includes?: Array<Includes>) => {
  let query: {
    where: { name: string; password: string };
    include?: { role: boolean };
  } = {
    where: {
      name: params.name,
      password: encodeSha256(params.password),
    },
    include: {
      role: includes && includes.includes("Role"),
    },
  };
  return query;
};

const createReferenceMemoryCacheQuery = ({
  params,
  referenceString,
  includes,
}: {
  referenceString: string;
  params: Params & { id?: string };
  includes?: Array<Includes>;
}) => {
  referenceString = referenceString.concat(
    "-",
    String(params.name),
    "-",
    String(params.password),
    "-",
    String(params.id)
  );

  if (includes)
    includes.forEach((include) => {
      referenceString = referenceString.concat("-", include);
    });
  return referenceString;
};

export const getUserByNameAndPassword = async (
  params: Params,
  includes?: Array<Includes>
) => {
  const reference = createReferenceMemoryCacheQuery({
    referenceString: "user",
    params,
    includes,
  });
  if (!userInMemory.hasItem(reference)) {
    console.log("USER IN DB");
    const user = await prismaClient.user.findUniqueOrThrow(
      createQuery(params, includes)
    );
    userInMemory.storeExpiringItem(
      reference,
      user,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  return userInMemory.retrieveItemValue(reference);
};

export const getUser = async ({
  id,
  includes,
}: {
  id: string;
  includes?: Array<Includes>;
}) => {
  const reference = createReferenceMemoryCacheQuery({
    referenceString: "user",
    params: {
      name: "",
      password: "",
      id,
    },
    includes,
  });
  if (!userInMemory.hasItem(reference)) {
    console.log("USER IN DB");
    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
      include: {
        role: includes && includes.includes("Role"),
      },
    });
    userInMemory.storeExpiringItem(
      reference,
      user,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  return userInMemory.retrieveItemValue(reference);
};

export const createUser = async ({
  name,
  password,
  roleId,
}: CreateUserRequestBody) => {
  userInMemory.clear();
  return await prismaClient.user.create({
    data: {
      name,
      password: encodeSha256(password),
      roleId,
    },
  });
};
