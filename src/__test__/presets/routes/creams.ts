import { prismaClient } from "@libs/prisma";
import { createAdmin, getAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { createAdminRoleIfNotExist } from "../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../createMemberRoleIfNotExists";

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

let userAdmin: User & { role: Role; admin: Admin };
let userClient: User & { role: Role; client: Client };
let userMember: User & { role: Role; member: Member };

export const presetToCreamTests = async () => {
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
      address: { house: "2", square: "2" },
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

export const cleanCreamTestDatabase = async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [userAdmin.id, userClient.id, userMember.id],
      },
    },
  });
};

export const createTwentyCreams = async () => {
  const amoundCreams = await prismaClient.cream.count();
  if (amoundCreams >= 20) return;
  const adminId = (await getAdmin({ id: userAdmin.admin.id })).id;

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
