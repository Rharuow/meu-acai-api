import request from "supertest";
import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { app } from "@/app";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";

let userAdminToAuthentication: User & { role: Role; admin: Admin };
let userClientToAuthentication: User & { role: Role; client: Client };
let userMemberToAuuthentication: User & { role: Role; member: Member };

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

const userAdminCreateBody = {
  name: "Test Admin to change address",
  password: "123",
  email: "test@example.com",
  phone: "123",
};

const userClientCreateBody = {
  name: "Test Client to change address",
  password: "123",
  address: {
    house: "Test Client to change address",
    square: "Test Client to change address",
  },
  email: "test@example.com",
  phone: "123",
};

const userMemberCreateBody = {
  name: "Test Member to change address",
  password: "123",
  email: "test@example.com",
  phone: "123",
};

beforeAll(async () => {
  const [roleIdAdmin, roleIdClient, roleIdMember] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  const [userAdminCreated, userClientCreated] = await Promise.all([
    createAdmin({
      ...userAdminCreateBody,
      roleId: roleIdAdmin,
    }),
    createClient({
      ...userClientCreateBody,
      roleId: roleIdClient,
    }),
  ]);

  userAdminToAuthentication = userAdminCreated;
  userClientToAuthentication = userClientCreated;

  userMemberToAuuthentication = await createMember({
    ...userMemberCreateBody,
    clientId: userClientToAuthentication.client.id,
    roleId: roleIdMember,
  });

  const [responseAdminSignIn, responseClientSignIn, responseMemberSignIn] =
    await Promise.all([
      request(app)
        .post("/api/v1/signin")
        .send({
          name: userAdminCreateBody.name,
          password: userAdminCreateBody.password,
        })
        .set("Accept", "application/json")
        .expect(200),
      request(app)
        .post("/api/v1/signin")
        .send({
          name: userClientCreateBody.name,
          password: userClientCreateBody.password,
        })
        .set("Accept", "application/json")
        .expect(200),
      request(app)
        .post("/api/v1/signin")
        .send({
          name: userMemberCreateBody.name,
          password: userMemberCreateBody.password,
        })
        .set("Accept", "application/json")
        .expect(200),
    ]);

  accessTokenAsAdmin = responseAdminSignIn.body.accessToken;
  refreshTokenAsAdmin = responseAdminSignIn.body.refreshToken;

  accessTokenAsClient = responseClientSignIn.body.accessToken;
  refreshTokenAsClient = responseClientSignIn.body.refreshToken;

  accessTokenAsMember = responseMemberSignIn.body.accessToken;
  refreshTokenAsMember = responseMemberSignIn.body.refreshToken;
});

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          userAdminToAuthentication.id,
          userClientToAuthentication.id,
          userMemberToAuuthentication.id,
        ],
      },
    },
  });
});

describe("CHANGE ADDRESS", () => {
  const basePath = "/api/v1/resources/users/clients/:id/change-address";
  const setBasePath = (id: string) =>
    `/api/v1/resources/users/clients/${id}/change-address`;
  describe("CHANGE ADDRESS AS ADMIN", () => {
    const newAddress = {
      house: "new house create by admin",
      square: "new house create by admin",
    };
    test(
      `When an Admin accesses PUT ${basePath}` +
        " and sends a request body the new address with house and square that not exist" +
        " then the response should have a status code 200 and the new address will be created and set to the client resource",
      async () => {
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .send(newAddress)
          .set("authorization", accessTokenAsAdmin)
          .set("refreshToken", refreshTokenAsAdmin)
          .expect(200);

        return expect(response.statusCode).toBe(200);
      }
    );
  });
});
