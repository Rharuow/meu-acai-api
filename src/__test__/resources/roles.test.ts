import { prismaClient } from "@/libs/prisma";
import { createAdminRoleIfNotExist } from "../utils/createAdminRoleIfNotExists";
import { createUserIfNotExist } from "../utils/createUserIfNotExists copy";

beforeAll(async () => {
  const adminId = await createAdminRoleIfNotExist();
  await createUserIfNotExist(adminId);
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
