import { app } from "@/app";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { VerifyErrors, verify } from "jsonwebtoken";
import request from "supertest";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";
import { createAdminRoleIfNotExist } from "../presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../presets/createMemberRoleIfNotExists";

const futureTime = Math.floor(Date.now() / 1000) + 10;

let userAdmin: User & { role: Role; admin: Admin };

const createAdminBody = {
  name: "Test Admin to refreshToekn test",
  password: "123",
};

let userClient: User & { role: Role; client: Client };

const createClientBody = {
  name: "Test Client to refreshToekn test",
  password: "123",
};

let userMember: User & { role: Role; member: Member };

const createMemberBody = {
  name: "Test Member to refreshToekn test",
  password: "123",
};

beforeAll(async () => {
  const [roleIdAdmin, roleIdClient, roleIdMember] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  const [userAdminCreated, userClientCreated] = await Promise.all([
    createAdmin({
      ...createAdminBody,
      roleId: roleIdAdmin,
    }),
    createClient({
      ...createClientBody,
      roleId: roleIdClient,
      address: {
        house: createClientBody.name,
        square: createClientBody.name,
      },
    }),
  ]);

  userAdmin = userAdminCreated;

  userClient = userClientCreated;

  userMember = await createMember({
    ...createMemberBody,
    roleId: roleIdMember,
    clientId: userClient.client.id,
  });
});

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [userAdmin.id, userClient.id, userMember.id],
      },
    },
  });
});

describe("Refresh token router", () => {
  test("when the accessToken expires, the refresh token router is called to regenerate a new access token", async () => {
    const responseSignIn = await request(app)
      .post("/api/v1/signin")
      .send(createAdminBody)
      .set("Accept", "application/json")
      .expect(200);

    const accessToken = responseSignIn.body.accessToken;
    const refreshToken = responseSignIn.body.refreshToken;

    const responseRefreshToken = await request(app)
      .post("/api/v1/refresh-token")
      .set("Accept", "application/json")
      .set("authorization", `Bearer ${accessToken}`)
      .set("refreshToken", `Bearer ${refreshToken}`)
      .expect(200);

    const secondAccessToken = responseRefreshToken.body.accessToken;

    verify(
      accessToken,
      process.env.TOKEN_SECRET,
      { clockTimestamp: futureTime },
      (err: VerifyErrors, user: User) => {
        expect(err).toBeTruthy();
        expect(user).toBeUndefined();
        expect(err.name).toBe("TokenExpiredError");
        expect(err.message).toBe("jwt expired");
      }
    );

    verify(
      secondAccessToken,
      process.env.TOKEN_SECRET,
      (err: VerifyErrors, user: User) => {
        expect(err).toBeNull();
        expect(user).toBeTruthy();
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("roleId");
      }
    );
  });
});
