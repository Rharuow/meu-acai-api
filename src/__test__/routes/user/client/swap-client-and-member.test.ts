import request from "supertest";

import { createAdminRoleIfNotExist } from "@/__test__/presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "@/__test__/presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "@/__test__/presets/createMemberRoleIfNotExists";
import { prismaClient } from "@libs/prisma";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { app } from "@/app";

const adminCreateBody = {
  name: "Test Admin to swap between Client and Member",
  password: "123",
  email: "admin@example.com",
  phone: "(00) 000000000",
};

const clientCreateBody = {
  name: "Test Client to swap between Client and Member",
  password: "123",
  email: "client@example.com",
  phone: "(00) 000000000",
  address: {
    house: Math.random().toString(),
    square: Math.random().toString(),
  },
};

const memberCreateBody = {
  name: "Test Member to swap between Client and Member",
  password: "123",
  email: "member@example.com",
  phone: "(00) 000000000",
};

let userAdminAuthenticated: User & { role: Role; admin: Admin };
let userClientAuthenticated: User & { role: Role; client: Client };
let userMemberAuthenticated: User & { role: Role; member: Member };

let accessTokenAdmin: string;
let accessTokenClient: string;
let accessTokenMember: string;

let refreshTokenAdmin: string;
let refreshTokenClient: string;
let refreshTokenMember: string;

beforeAll(async () => {
  const [roleIdAdmin, roleIdClient, roleIdMember] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  const [AdminAuthenticated, clientAuthenticated] = await Promise.all([
    createAdmin({
      ...adminCreateBody,
      roleId: roleIdAdmin,
    }),
    createClient({
      ...clientCreateBody,
      roleId: roleIdClient,
    }),
  ]);

  userAdminAuthenticated = AdminAuthenticated;
  userClientAuthenticated = clientAuthenticated;

  userMemberAuthenticated = await createMember({
    ...memberCreateBody,
    clientId: userClientAuthenticated.client.id,
    roleId: roleIdMember,
  });

  const responseSignInAsAdmin = await request(app)
    .post("/api/v1/signin")
    .send({ name: adminCreateBody.name, password: adminCreateBody.password })
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsClient = await request(app)
    .post("/api/v1/signin")
    .send({ name: clientCreateBody.name, password: clientCreateBody.password })
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsMember = await request(app)
    .post("/api/v1/signin")
    .send({ name: memberCreateBody.name, password: memberCreateBody.password })
    .set("Accept", "application/json")
    .expect(200);

  accessTokenAdmin = `Bearer ${responseSignInAsAdmin.body.accessToken}`;
  refreshTokenAdmin = `Bearer ${responseSignInAsAdmin.body.refreshToken}`;

  accessTokenClient = `Bearer ${responseSignInAsClient.body.accessToken}`;
  refreshTokenClient = `Bearer ${responseSignInAsClient.body.refreshToken}`;

  accessTokenMember = `Bearer ${responseSignInAsMember.body.accessToken}`;
  refreshTokenMember = `Bearer ${responseSignInAsMember.body.refreshToken}`;
});

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          userAdminAuthenticated.id,
          userClientAuthenticated.id,
          userMemberAuthenticated.id,
        ],
      },
    },
  });
});

describe("SWAP BETWEEN CLIENT AND MEMBER", () => {
  const basePathRouter = "/api/v1/resources/users/clients/swap";
  describe("SWAP AS ADMIN", () => {
    test(
      `When an Admin access PUT ${basePathRouter}/:id` +
        " sending in body the memberId that will be swapped," +
        "then the member will be swapped to the client and the client will be swapped to the member",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .send({
            memberId: userMemberAuthenticated.member.id,
          })
          .set("authorization", accessTokenAdmin)
          .set("refreshToken", refreshTokenAdmin)
          .expect(200);

        const clientSwappedToMember = await prismaClient.user.findUnique({
          where: {
            id: userClientAuthenticated.id,
          },
          include: {
            member: true,
          },
        });

        expect(clientSwappedToMember.member.clientId).toBe(
          response.body.data.user.client.id
        );
        expect(response.body).toHaveProperty(
          "message",
          "Client swapped successfully"
        );
        expect(response.body.data.user).toHaveProperty(
          "id",
          userMemberAuthenticated.id
        );
        expect(response.body.data.user).toHaveProperty(
          "name",
          memberCreateBody.name
        );
        expect(response.body.data.user).toHaveProperty(
          "client.email",
          memberCreateBody.email
        );
        expect(response.body.data.user).toHaveProperty(
          "client.phone",
          memberCreateBody.phone
        );

        return expect(response.statusCode).toBe(200);
      }
    );
  });
});
