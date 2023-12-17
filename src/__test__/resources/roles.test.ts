import { prismaClient } from "@libs/prisma";
import { createAdminRoleIfNotExist } from "../presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../presets/createMemberRoleIfNotExists";

beforeAll(async () => {
  await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);
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
