import { createAdminRoleIfNotExist } from "../../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../../createMemberRoleIfNotExists";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";

const createAdminToAuthenticate = {
  name: "Test Admin Authenticate to member crud test",
  password: "123",
};

const createClientToAuthenticate = {
  name: "Test Client Authenticate to member crud test",
  password: "123",
};

const createMemberToAuthenticate = {
  name: "Test Member Authenticate to member crud test",
  password: "123",
};

export const presetToMemberTests = async () => {
  const RoleAdminId = await createAdminRoleIfNotExist();
  const RoleClientId = await createClientRoleIfNotExist();
  const RoleMemberId = await createMemberRoleIfNotExist();

  const userAdmin = await createAdmin({
    ...createAdminToAuthenticate,
    roleId: RoleAdminId,
  });

  const userClient = await createClient({
    ...createClientToAuthenticate,
    address: { house: "3", square: "3" },
    roleId: RoleClientId,
  });

  const userMember = await createMember({
    ...createMemberToAuthenticate,
    clientId: userClient.client.id,
    roleId: RoleMemberId,
  });

  return { userAdmin, userClient, userMember };
};

export const cleanMemberTestDatabase = async () => {
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
