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
  const RoleAdminId = await createAdminRoleIfNotExist();
  const RoleClientId = await createClientRoleIfNotExist();
  const RoleMemberId = await createMemberRoleIfNotExist();

  userAdmin = await createAdmin({
    ...createAdminToAuthenticate,
    roleId: RoleAdminId,
  });

  userClient = await createClient({
    ...createClientToAuthenticate,
    address: { house: "3", square: "3" },
    roleId: RoleClientId,
  });

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
