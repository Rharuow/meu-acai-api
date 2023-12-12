import { prismaClient } from "@libs/prisma";
import { createAdminRoleIfNotExist } from "../../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../../createMemberRoleIfNotExists";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";

const createAdminToAuthenticate = {
  name: "Test Admin Authenticate to cream crud test",
  password: "123",
};

const createClientToAuthenticate = {
  name: "Test Client Authenticate to cream crud test",
  password: "123",
};

const createMemberToAuthenticate = {
  name: "Test Member Authenticate to cream crud test",
  password: "123",
};

export const presetToCreamTests = async () => {
  const RoleAdminId = await createAdminRoleIfNotExist();
  const RoleClientId = await createClientRoleIfNotExist();
  const RoleMemberId = await createMemberRoleIfNotExist();

  const userAdmin = await createAdmin({
    ...createAdminToAuthenticate,
    roleId: RoleAdminId,
  });

  const userClient = await createClient({
    ...createClientToAuthenticate,
    address: { house: "0", square: "0" },
    roleId: RoleClientId,
  });

  const userMember = await createMember({
    ...createMemberToAuthenticate,
    clientId: userClient.client.id,
    roleId: RoleMemberId,
  });

  return { userAdmin, userClient, userMember };
};

export const cleanCreamTestDatabase = async () => {
  await prismaClient.user.deleteMany({
    where: {
      name: {
        in: [
          createAdminToAuthenticate.name,
          createClientToAuthenticate.name,
          createMemberToAuthenticate.name,
        ],
      },
    },
  });
};

export const createTwentyCreams = async () => {
  const amoundCreams = await prismaClient.cream.count();
  if (amoundCreams >= 20) return;
  const adminId = (await prismaClient.admin.findFirst()).id;

  const creams = Array(20)
    .fill(null)
    .map((_, index) => ({
      adminId,
      amount: index + 1,
      name: `Test to list creams ${index}`,
      price: index + 10,
      unit: index % 2 === 0 ? "box" : "bag",
    }));
  await prismaClient.cream.createMany({ data: creams });
};
