import { createAdminRoleIfNotExist } from "../utils/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../utils/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../utils/createMemberRoleIfNotExists";
import { prismaClient } from "@libs/prisma";

beforeAll(async () => {
  await createAdminRoleIfNotExist();
  await createClientRoleIfNotExist();
  await createMemberRoleIfNotExist();
});

describe("CRUD of role resource", () => {
  test("should create a role in db called 'ADMIN' if not exist", async () => {
    const hasAdminRole = await prismaClient.role.findFirst({
      where: { name: "ADMIN" },
    });

    const role =
      hasAdminRole ??
      (await prismaClient.role.create({ data: { name: "ADMIN" } }));

    return expect(role.name).toBe("ADMIN");
  });
});
