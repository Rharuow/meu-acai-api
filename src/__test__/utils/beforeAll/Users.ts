import { createAddressIfNotExistis } from "../createAddressIfNotExists";
import { createAdminRoleIfNotExist } from "../createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../createMemberRoleIfNotExists";
import { createUserAdminIfNotExists } from "../createUserAdminIfNotExists";
import { createUserClientIfNotExists } from "../createUserClientIfNotExists";
import { createUserIfNotExist } from "../createUserIfNotExists copy";
import { createUserMemberIfNotExists } from "../createUserMemberIfNotExists";
import { userAsAdmin, userAsClient, userAsMember } from "../users";
import { prismaClient } from "@libs/prisma";

export const createAllKindOfUserAndRoles = async () => {
  const address = await createAddressIfNotExistis();
  const adminRoleId = await createAdminRoleIfNotExist();
  const clientRoleId = await createClientRoleIfNotExist();
  const memberRoleId = await createMemberRoleIfNotExist();
  const userAdmin = await createUserIfNotExist(adminRoleId, userAsAdmin);
  await createUserAdminIfNotExists(userAdmin);
  const userClient = await createUserIfNotExist(clientRoleId, userAsClient);
  const client = await createUserClientIfNotExists(userClient, address);
  const userMember = await createUserIfNotExist(memberRoleId, userAsMember);
  await createUserMemberIfNotExists(userMember, client);
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

export const cleanAllKindOfUsersAndRole = async () => {
  await prismaClient.address.deleteMany();
  await prismaClient.user.deleteMany();
  await prismaClient.cream.deleteMany();
};
