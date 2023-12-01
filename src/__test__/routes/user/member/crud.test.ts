import request from "supertest";
import { createAllKindOfUserAndRoles } from "@/__test__/utils/beforeAll/Users";
import {
  userAsAdmin,
  userAsClient,
  userAsMember,
} from "@/__test__/utils/users";
import { app } from "@/app";
import { Client, Member, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

const memberResourcePath = "/api/v1/resources/users/members";
const userResourcePath = "/api/v1/resources/users";

let clientReferenceToMember: Client;

const createMemberBody = {
  name: "Test Member Created",
  password: "123",
};

let userMemberAdmin: User & { role?: Role } & { client?: Member };
let userMemberClient: User & { role?: Role } & { client?: Member };

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
  clientReferenceToMember = await prismaClient.client.findFirst();
  const responseSignInAsAdmin = await request(app)
    .post("/api/v1/signin")
    .send(userAsAdmin)
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsClient = await request(app)
    .post("/api/v1/signin")
    .send(userAsClient)
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsMember = await request(app)
    .post("/api/v1/signin")
    .send(userAsMember)
    .set("Accept", "application/json")
    .expect(200);

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;
});

describe("TEST TO CREATE MEMBER RESOURCE", () => {
  // CREATE
  describe("CREATING MEMBER AS AN ADMIN", () => {
    test(
      `When an authenticated ADMIN accesses POST ${memberResourcePath} ` +
        'with name "Test Member Created", password "123", clientId "client id" ' +
        "then it should create a new User and a new Member resource in the database",
      async () => {
        const response = await request(app)
          .post(memberResourcePath)
          .send({
            ...createMemberBody,
            name: "Test Member Created For Admin",
            clientId: clientReferenceToMember.id,
          })
          .set("authorization", `Bearer ${accessTokenAsAdmin}`)
          .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
          .expect(200);
        userMemberAdmin = await getUserByNameAndPassword(
          {
            name: "Test Member Created For Admin",
            password: createMemberBody.password,
          },
          ["Role", "Member"]
        );
        expect(userMemberAdmin).toBeTruthy();
        expect(userMemberAdmin).toHaveProperty(
          "name",
          "Test Member Created For Admin"
        );
        expect(
          userMemberAdmin.id === response.body.data.user.member.userId
        ).toBeTruthy();
        expect(
          userMemberAdmin.name === response.body.data.user.name
        ).toBeTruthy();
        expect(
          userMemberAdmin.password === response.body.data.user.password
        ).toBeTruthy();
        expect(userMemberAdmin).toHaveProperty(
          "password",
          encodeSha256(createMemberBody.password)
        );
        expect(userMemberAdmin.role).toHaveProperty("name", "MEMBER");
        return expect(response.statusCode).toBe(200);
      }
    );
  });

  describe("CREATING MEMBER AS AN CLIENT", () => {
    test(
      `When an authenticated CLIENT accesses POST ${memberResourcePath} ` +
        'with name "Test Member Created For Client", password "123", clientId "client id" ' +
        "then it should create a new User and a new Member resource in the database",
      async () => {
        const response = await request(app)
          .post(memberResourcePath)
          .send({ ...createMemberBody, name: "Test Member Created For Client" })
          .set("authorization", `Bearer ${accessTokenAsClient}`)
          .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
          .expect(200);

        userMemberClient = await getUserByNameAndPassword(
          {
            name: "Test Member Created For Client",
            password: createMemberBody.password,
          },
          ["Role", "Member"]
        );
        expect(userMemberClient).toBeTruthy();
        expect(userMemberClient).toHaveProperty(
          "name",
          "Test Member Created For Client"
        );
        expect(
          userMemberClient.id === response.body.data.user.member.userId
        ).toBeTruthy();
        expect(
          userMemberClient.name === response.body.data.user.name
        ).toBeTruthy();
        expect(
          userMemberClient.password === response.body.data.user.password
        ).toBeTruthy();
        expect(userMemberClient).toHaveProperty(
          "password",
          encodeSha256(createMemberBody.password)
        );
        expect(userMemberClient.role).toHaveProperty("name", "MEMBER");
        return expect(response.statusCode).toBe(200);
      }
    );
  });
});

describe("TEST TO DELETE MEMBER RESOURCE", () => {
  describe("DELETING MEMBER AS AN ADMIN", () => {
    test(
      `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id ` +
        "then it should return a 204 status and delete the first member created",
      async () => {
        const response = await request(app)
          .delete(userResourcePath + `/${userMemberAdmin.id}`)
          .set("authorization", "Bearer " + accessTokenAsAdmin)
          .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
          .expect(204);
        return expect(response.statusCode).toBe(204);
      }
    );
  });

  describe("DELETING MEMBER AS AN CLIENT", () => {
    test(
      `When an authenticated CLIENT accesses DELETE ${userResourcePath}/members/:id ` +
        "then it should return a 204 status and delete the first member created",
      async () => {
        const response = await request(app)
          .delete(userResourcePath + `/members/${userMemberClient.id}`)
          .set("authorization", "Bearer " + accessTokenAsClient)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .expect(204);

        return expect(response.statusCode).toBe(204);
      }
    );
  });
});
