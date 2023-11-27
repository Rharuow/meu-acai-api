import "module-alias/register";
import { encodeSha256 } from "@libs/crypto";
import {
  totalUsersInMemory,
  userInMemory,
  usersInMemory,
} from "@libs/memory-cache";
import { prismaClient } from "@libs/prisma";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { Admin, Client, Member, ROLE, Role, User } from "@prisma/client";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import {
  Params as FilterParams,
  createOrder,
  createQuery as createListQuery,
  createReferenceMemoryCacheQuery as createListReferenceMemoryCacheQuery,
} from "../utils/queryBuilder";

type Params = {
  name: string;
  password: string;
};

type Includes = "Role" | "Admin" | "Member" | "Client";

export type ParamsUser = FilterParams & {
  orderBy:
    | "name:asc"
    | "name:desc"
    | "role:asc"
    | "role:desc"
    | "createdAt:asc"
    | "createdAt:desc";
} & {
  includes?: ROLE;
};

const createQuery = (params: Params, includes?: Array<Includes>) => {
  let query: {
    where: { name: string; password: string };
    include?: {
      role: boolean;
      admin?: boolean;
      member?: boolean;
      client?: boolean;
    };
  } = {
    where: {
      name: params.name,
      password: encodeSha256(params.password),
    },
    include: {
      role: includes && includes.includes("Role"),
      admin: includes && includes.includes("Admin"),
      member: includes && includes.includes("Member"),
      client: includes && includes.includes("Client"),
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
        admin: includes && includes.includes("Admin"),
        member: includes && includes.includes("Member"),
        client: includes && includes.includes("Client"),
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
  usersInMemory.clear();
  return await prismaClient.user.create({
    data: {
      name,
      password: encodeSha256(password),
      roleId,
    },
  });
};

export const createManyUser = async (users: Array<CreateUserRequestBody>) => {
  userInMemory.clear();
  usersInMemory.clear();
  return await prismaClient.user.createMany({
    data: users,
    skipDuplicates: true,
  });
};

export const updateUser: ({
  id,
  fields,
}: {
  id: string;
  fields: UpdateUserRequestBody;
}) => Promise<User & { role?: Role }> = async ({ fields, id }) => {
  userInMemory.clear();
  usersInMemory.clear();
  return await prismaClient.user.update({
    where: { id },
    data: fields,
  });
};

export const listUsers: (params: ParamsUser) => Promise<
  [
    Array<
      User & { role?: Role } & { admin?: Admin } & { member?: Member } & {
        client?: Client;
      }
    >,
    number
  ]
> = async ({ page, perPage, orderBy, filter, includes }) => {
  const [fieldOrderBy, order] = orderBy.split(":");
  const where = filter && createListQuery({ filterFields: filter.split(",") });
  // create a string reference to save in memory the list of admins
  const reference = createListReferenceMemoryCacheQuery({
    referenceString: (includes && includes.toLowerCase()) || "users",
    params: {
      page,
      perPage,
      orderBy,
      filter,
    },
  });

  if (!usersInMemory.hasItem(reference)) {
    console.log("CREAM IN DB");
    const [users, totalUsers] = await Promise.all([
      await prismaClient.user.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: createOrder({ fieldOrderBy, order }),
        where: includes
          ? { ...where, AND: { role: { name: ROLE[includes] } } }
          : where,
        include: {
          admin: includes && includes === "ADMIN",
          member: includes && includes === "MEMBER",
          client: includes && includes === "CLIENT",
          role: true,
        },
      }),
      await prismaClient.user.count({ where }),
    ]);

    usersInMemory.storeExpiringItem(
      reference,
      users,
      process.env.NODE_ENV === "test" ? 5 : 3600 // if test env expire in 5 miliseconds else 1 hour
    );
    totalUsersInMemory.storeExpiringItem(
      `total-${reference}`,
      totalUsers,
      process.env.NODE_ENV === "test" ? 5 : 3600
    );
  }

  return [
    usersInMemory.retrieveItemValue(reference),
    totalUsersInMemory.retrieveItemValue(`total-${reference}`),
  ];
};

export const deleteUser = async ({ id }: { id: string }) => {
  userInMemory.clear();
  usersInMemory.clear();
  await prismaClient.user.delete({ where: { id } });
  return;
};

export const deleteManyUser = async ({ ids }: { ids: Array<string> }) => {
  userInMemory.clear();
  usersInMemory.clear();
  return await prismaClient.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};
