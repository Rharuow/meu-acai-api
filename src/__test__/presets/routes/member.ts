import { createAdminRoleIfNotExist } from "../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../createMemberRoleIfNotExists";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Role, User } from "@prisma/client";

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

let userAdmin: User & { role: Role; admin: Admin };
let userClient: User & { role: Role; client: Client };
let userMember: User & { role: Role; member: Member };

export const presetToMemberTests = async () => {
  const [RoleAdminId, RoleClientId, RoleMemberId] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  const [userAdminCreated, userClientCreated] = await Promise.all([
    createAdmin({
      ...createAdminToAuthenticate,
      roleId: RoleAdminId,
    }),
    createClient({
      ...createClientToAuthenticate,
      address: { house: "3", square: "3" },
      roleId: RoleClientId,
    }),
  ]);

  userAdmin = userAdminCreated;

  userClient = userClientCreated;

  userMember = await createMember({
    ...createMemberToAuthenticate,
    clientId: userClient.client.id,
    roleId: RoleMemberId,
  });

  return { userAdmin, userClient, userMember };
};

export const cleanMemberTestDatabase = async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [userAdmin.id, userClient.id, userMember.id],
      },
    },
  });
};
