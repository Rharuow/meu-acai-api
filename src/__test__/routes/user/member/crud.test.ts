import request from "supertest";
import { app } from "@/app";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { getUserByNameAndPassword } from "@repositories/user";
import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";
import { createClient } from "@repositories/user/client";
import { isBooleanAttribute } from "@/__test__/presets/isBooleanAttribute";
import { VerifyErrors, verify } from "jsonwebtoken";
import {
  cleanMemberTestDatabase,
  presetToMemberTests,
} from "@/__test__/presets/routes/member";
import { createMember } from "@repositories/user/member";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

const memberResourcePath = "/api/v1/resources/users/members";
const userResourcePath = "/api/v1/resources/users";

let clientReferenceToMemberAsAdmin: User & { client: Client; role: Role };
let clientReferenceToMemberAsClient: User & { client: Client; role: Role };

const createMemberBody = {
  name: "Test Member Created",
  password: "123",
};

const createMemberBodyMissingName = {
  password: "123",
};

const createMemberBodyMissingPassword = {
  name: "Test Member Created",
};

const updateMemberBody = {
  name: "Test Member Edited",
  email: "test.member@mail.com",
  phone: "(84)999999999",
};

let userMemberAdmin: User & { role?: Role } & { member?: Member };
let userMemberClient: User & { role?: Role } & { member?: Member };
let usersWithClientAndMember: User & {
  client: Client & { members: Array<Member> };
};

let clientAuthenticated: User & { role?: Role } & { client?: Client };
let memberAuthenticated: User & { role?: Role } & { member?: Member };

let userAdmin: User & { role?: Role } & { admin?: Admin };
let userClient: User & { role?: Role } & { client?: Client };
let userMember: User & { role?: Role } & { member?: Member };

beforeAll(async () => {
  const user = await presetToMemberTests();

  userAdmin = user.userAdmin;
  userClient = user.userClient;
  userMember = user.userMember;

  const roleClientId = (
    await prismaClient.role.findUnique({
      where: {
        name: "CLIENT",
      },
    })
  ).id;

  const [
    clientReferenceToMemberAsAdminCreated,
    clientReferenceToMemberAsClientCreate,
  ] = await Promise.all([
    createClient({
      address: {
        house: "30",
        square: "30",
      },
      name: "Test client reference to member created by Admin",
      password: "123",
      roleId: roleClientId,
      email: "test@example.com",
      phone: "(00)00000000000",
    }),
    createClient({
      address: {
        house: "40",
        square: "40",
      },
      name: "Test client reference to member created by Client",
      password: "123",
      roleId: roleClientId,
      email: "test@example.com",
      phone: "(00)00000000000",
    }),
  ]);

  clientReferenceToMemberAsAdmin = clientReferenceToMemberAsAdminCreated;

  clientReferenceToMemberAsClient = clientReferenceToMemberAsClientCreate;

  const [
    responseSignInAsAdmin,
    responseSignInAsClient,
    responseSignInAsMember,
  ] = await Promise.all([
    request(app)
      .post("/api/v1/signin")
      .send({ name: userAdmin.name, password: "123" })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({
        name: userClient.name,
        password: "123",
      })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({
        name: userMember.name,
        password: "123",
      })
      .set("Accept", "application/json")
      .expect(200),
  ]);

  clientAuthenticated = responseSignInAsClient.body.user;

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;

  memberAuthenticated = await prismaClient.user.findUnique({
    where: {
      id: responseSignInAsMember.body.user.id,
    },
    include: {
      member: true,
      role: true,
    },
  });
});

afterAll(async () => {
  await cleanMemberTestDatabase();
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          userMemberAdmin.id,
          userMemberClient.id,
          usersWithClientAndMember.id,
          clientAuthenticated.id,
          memberAuthenticated.id,
          userAdmin.id,
          userClient.id,
          userMember.id,
          clientReferenceToMemberAsAdmin.id,
          clientReferenceToMemberAsClient.id,
        ],
      },
    },
  });
});

describe("CRUD MEMBER RESOURCE", () => {
  describe("TEST TO CREATE MEMBER RESOURCE", () => {
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
              clientId: clientReferenceToMemberAsAdmin.client.id,
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

      test(
        `When an authenticated ADMIN accesses POST ${memberResourcePath} ` +
          "without body data" +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${memberResourcePath} ` +
          "with body missing password " +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingPassword)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses POST ${memberResourcePath} ` +
          "with body missing name " +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingName)
            .set("authorization", `Bearer ${accessTokenAsAdmin}`)
            .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When accesses POST ${memberResourcePath} ` +
          "without authentication " +
          "then it shouldn't create a new User and a new Member resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingName)
            .expect(401);

          return expect(response.statusCode).toBe(401);
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
            .send({
              ...createMemberBody,
              name: "Test Member Created For Client",
            })
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

      test(
        `When an authenticated CLIENT accesses POST ${memberResourcePath} ` +
          "without body data" +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .set("authorization", `Bearer ${accessTokenAsClient}`)
            .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated CLIENT accesses POST ${memberResourcePath} ` +
          "with body missing password " +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingPassword)
            .set("authorization", `Bearer ${accessTokenAsClient}`)
            .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated CLIENT accesses POST ${memberResourcePath} ` +
          "with body missing name " +
          "then it shouldn't create a new User and a new Member resource in the database and return 422",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingName)
            .set("authorization", `Bearer ${accessTokenAsClient}`)
            .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When accesses POST ${memberResourcePath} ` +
          "without authentication " +
          "then it shouldn't create a new User and a new Member resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .send(createMemberBodyMissingName)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("CREATING MEMBER AS AN MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses POST ${memberResourcePath} ` +
          "without body data" +
          "then it shouldn't create a new User and a new Member resource in the database and return 401",
        async () => {
          const response = await request(app)
            .post(memberResourcePath)
            .set("authorization", `Bearer ${accessTokenAsMember}`)
            .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO GET MEMBER RESOURCE", () => {
    describe("GETTING MEMBER AS ADMIN", () => {
      test(
        `When an authenticated user as ADMIN access ${userResourcePath}/:userId/members/:id` +
          "return 200 and the member resource",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + accessTokenAsAdmin)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("user");
          expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
          expect(response.body.data.user).toHaveProperty("role");
          expect(response.body.data.user.role).toHaveProperty(
            "name",
            userMemberAdmin.role.name
          );
          expect(response.body.data.user).toHaveProperty("member");
          expect(response.body.data.user.member).toHaveProperty(
            "id",
            userMemberAdmin.member.id
          );
          expect(response.body.data.user.member).toHaveProperty(
            "userId",
            userMemberAdmin.member.userId
          );
          expect(response.body.data.user).toHaveProperty(
            "name",
            userMemberAdmin.name
          );
          return expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
        }
      );
    });

    describe("GETTING MEMBER AS CLIENT", () => {
      test(
        `When an authenticated user as CLIENT access ${userResourcePath}/:userId/members/:id` +
          "return 200 and the member resource",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + accessTokenAsClient)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("user");
          expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
          expect(response.body.data.user).toHaveProperty("role");
          expect(response.body.data.user.role).toHaveProperty(
            "name",
            userMemberAdmin.role.name
          );
          expect(response.body.data.user).toHaveProperty("member");
          expect(response.body.data.user.member).toHaveProperty(
            "id",
            userMemberAdmin.member.id
          );
          expect(response.body.data.user.member).toHaveProperty(
            "userId",
            userMemberAdmin.member.userId
          );
          expect(response.body.data.user).toHaveProperty(
            "name",
            userMemberAdmin.name
          );
          return expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
        }
      );
    });

    describe("GETTING MEMBER AS MEMBER", () => {
      test(
        `When an authenticated user as MEMBER access ${userResourcePath}/:userId/members/:id` +
          "return 200 and the member resource",
        async () => {
          const response = await request(app)
            .get(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + accessTokenAsMember)
            .expect(200);

          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("user");
          expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
          expect(response.body.data.user).toHaveProperty("role");
          expect(response.body.data.user.role).toHaveProperty(
            "name",
            userMemberAdmin.role.name
          );
          expect(response.body.data.user).toHaveProperty("member");
          expect(response.body.data.user.member).toHaveProperty(
            "id",
            userMemberAdmin.member.id
          );
          expect(response.body.data.user.member).toHaveProperty(
            "userId",
            userMemberAdmin.member.userId
          );
          expect(response.body.data.user).toHaveProperty(
            "name",
            userMemberAdmin.name
          );
          return expect(response.body.data.user).toHaveProperty(
            "id",
            userMemberAdmin.id
          );
        }
      );
    });
  });

  describe("TEST TO LIST MEMBERS RESOURCE", () => {
    describe("LISTING MEMBER AS ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses the GET endpoint ${memberResourcePath} ` +
          " without any query parameters, " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 10 members, where the first member is included. Additionally, the response should include the 'page' attribute with a value of 1, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + accessTokenAsAdmin)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(10);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");
          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );

      test(
        `When an authenticated ADMIN accesses the GET endpoint ${memberResourcePath}?page=2&perPage=5` +
          " with query parameters, page=2 and perPage=5 " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 5 members, where the first member is included. Additionally, the response should include the 'page' attribute with a value of 2, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath + "?page=2&perPage=5")
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + accessTokenAsAdmin)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(5);
          expect(response.body).toHaveProperty("page", 2);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");
          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );

      test(
        `When an authenticated ADMIN accesses the GET endpoint ${memberResourcePath}?page=1&perPage=10&filter=name:like:Test Member Created For Admin` +
          " with query parameters, " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 10 members, where the member with name 'Test Member Created For Admin' is included. Additionally, the response should include the 'page' attribute with a value of 1, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(
              memberResourcePath +
                "?page=1&perPage=10&filter=name:like:Test Member Created For Admin"
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + accessTokenAsAdmin)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(10);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");
          expect(
            response.body.data.some(
              (member: User & { member: Member }) =>
                member.name === "Test Member Created For Admin"
            )
          ).toBeTruthy();
          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );

      test(
        `When acess the GET endpoint ${memberResourcePath} ` +
          "without authentication " +
          "the expected behavior is to return a status code of 401.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("LISTING MEMBER AS CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses the GET endpoint ${memberResourcePath} ` +
          " without any query parameters, " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 10 members, where only its own member is included. Additionally, the response should include the 'page' attribute with a value of 1, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + accessTokenAsClient)
            .expect(200);

          usersWithClientAndMember = await prismaClient.user.findUnique({
            where: {
              id: clientAuthenticated.id,
            },
            include: {
              client: {
                include: {
                  members: true,
                },
              },
            },
          });

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(10);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");
          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );

      test(
        `When an authenticated CLIENT accesses the GET endpoint ${memberResourcePath}?page=2&perPage=5` +
          " with query parameters, page=2 and perPage=5 " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 5 members, where only its own member is included. Additionally, the response should include the 'page' attribute with a value of 2, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath + "?page=2&perPage=5")
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + accessTokenAsClient)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(5);
          expect(response.body).toHaveProperty("page", 2);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");

          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );

      test(
        `When an authenticated CLIENT accesses the GET endpoint ${memberResourcePath}?page=1&perPage=10&filter=name:like:Test Member Created For Client` +
          " with query parameters, " +
          "the expected behavior is to return a status code of 200. The response body should contain a 'data' object with an array of up to 10 members, where only its own member with name 'Test Member Created For Client' is included. Additionally, the response should include the 'page' attribute with a value of 1, the 'totalPages' attribute with a value biggest than 1, and the 'hasNextPage' attribute with a boolean value.",
        async () => {
          const response = await request(app)
            .get(
              memberResourcePath +
                "?page=1&perPage=10&filter=name:like:Test Member Created For Client"
            )
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + accessTokenAsClient)
            .expect(200);

          expect(response.statusCode).toBe(200);
          expect(response.body).toHaveProperty("data");
          expect(response.body.data).toHaveProperty("length");
          expect(response.body.data.length).toBeLessThanOrEqual(10);
          expect(response.body).toHaveProperty("page", 1);
          expect(response.body).toHaveProperty("totalPages");
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(response.body).toHaveProperty("hasNextPage");
          expect(
            response.body.data.some(
              (member: User & { member: Member }) =>
                member.name === "Test Member Created For Client"
            )
          ).toBeTruthy();
          return expect(isBooleanAttribute(response.body, "hasNextPage")).toBe(
            true
          );
        }
      );
    });

    describe("LISTING MEMBER AS MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses the GET endpoint ${memberResourcePath} ` +
          " without any query parameters, " +
          "the expected behavior is to return a status code of 401.",
        async () => {
          const response = await request(app)
            .get(memberResourcePath)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + accessTokenAsMember)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });
  });

  describe("TEST TO UPDATE MEMBER RESOURCE", () => {
    describe("UPDATING MEMBER RESOURCE AS ADMIN", () => {
      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/members/:id ` +
          'with name "Test Member Edited", ' +
          "then it should update the User with the new provided information",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .send(updateMemberBody)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(200);

          userMemberAdmin = {
            ...userMemberAdmin,
            ...updateMemberBody,
          };

          expect(response.body.data.user.name).toBe(userMemberAdmin.name);
          expect(response.body.data.user.id).toBe(userMemberAdmin.id);
          expect(
            response.body.data.user.member.id ===
              response.body.data.user.member.id
          ).toBeTruthy();
          expect(response.body.data.user.member.id).toBe(
            userMemberAdmin.member.id
          );
          return expect(response.statusCode).toBe(200);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/members/:id ` +
          "without body" +
          "then it shouldn't update the User with the new provided information and return 400",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(400);

          return expect(response.statusCode).toBe(400);
        }
      );

      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/members/:id ` +
          "with valid body" +
          "then it shouldn't update the User with the new provided information and return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .send(updateMemberBody)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/members/:id ` +
          "with valid body and invalid memberId" +
          "then it shouldn't update the User with the new provided information and return 422",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userMemberAdmin.id}/members/invalid-member-id`
            )
            .send(updateMemberBody)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);
          return expect(response.statusCode).toBe(422);
        }
      );

      test(
        `When an authenticated ADMIN accesses PUT ${userResourcePath}/:userId/members/:id ` +
          "with valid body and invalid userId" +
          "then it shouldn't update the User with the new provided information and return 422",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/invalid-user-id/members/${userMemberAdmin.memberId}`
            )
            .send(updateMemberBody)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);

          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("UPDATING MEMBER RESOURCE AS CLIENT", () => {
      test(
        `When an authenticated CLIENT accesses PUT ${userResourcePath}/:userId/members/:id ` +
          'with name "Test Member Edited", ' +
          "should return 401",
        async () => {
          const response = await request(app)
            .put(
              userResourcePath +
                `/${userMemberAdmin.id}/members/${userMemberAdmin.member.id}`
            )
            .send(updateMemberBody)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("UPDATING MEMBER RESOURCE AS A MEMBER", () => {
      const updateBody = {
        name: "Test Member Edited by member",
        email: "testmemberedited@mail.com",
        phone: "(00) 000000000",
      };
      test(
        `When an authenticated MEMBER accesses PUT ${userResourcePath}/:userId/members/:id ` +
          `with name ${updateBody.name}, email ${updateBody.email} and phone ${updateBody.phone} at body request, while in the params route the userId and the id are the authenticated user ` +
          "should return 200",
        async () => {
          const memberToEditTest = await createMember({
            clientId: clientReferenceToMemberAsClient.client.id,
            name: "Test member to edit",
            password: "123",
            roleId: memberAuthenticated.roleId,
          });

          const memberLogged = await request(app)
            .post("/api/v1/signin")
            .send({ name: memberToEditTest.name, password: "123" })
            .set("Accept", "application/json")
            .expect(200);

          const response = await request(app)
            .put(
              userResourcePath +
                `/${memberToEditTest.id}/members/${memberToEditTest.member.id}`
            )
            .send(updateBody)
            .set("authorization", "Bearer " + memberLogged.body.accessToken)
            .set("refreshToken", "Bearer " + memberLogged.body.refreshToken)
            .expect(200);

          await prismaClient.user.delete({
            where: {
              id: memberToEditTest.id,
            },
          });

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

      test(
        `When an authenticated ADMIN accesses DELETE ${userResourcePath}/:id with invalid id ` +
          "then it should return a 422 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/some-id-invalid`)
            .set("authorization", "Bearer " + accessTokenAsAdmin)
            .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
            .expect(422);
          return expect(response.statusCode).toBe(422);
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

      test(
        `When an authenticated CLIENT accesses DELETE ${userResourcePath}/:id with invalid id ` +
          "then it should return a 422 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/members/some-invalid-id`)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(422);
          return expect(response.statusCode).toBe(422);
        }
      );
    });

    describe("DELETING MEMBER AS AN MEMBER", () => {
      test(
        `When an authenticated MEMBER accesses DELETE ${memberResourcePath}/member/:id ` +
          "in which the id is the member authenticated, then it should return a 204 status",
        async () => {
          verify(
            accessTokenAsMember,
            process.env.TOKEN_SECRET,
            (err: VerifyErrors, user: User & { role?: Role }) => {
              err && console.log("err = ", err.message);
              memberAuthenticated = user;
            }
          );
          const response = await request(app)
            .delete(memberResourcePath + `/member/${memberAuthenticated.id}`)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(204);

          const allUsers = await prismaClient.user.findMany();

          expect(
            allUsers.some((user) => user.id === memberAuthenticated.id)
          ).toBeFalsy();
          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When an authenticated MEMBER accesses DELETE ${memberResourcePath}/member/:id ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(memberResourcePath + `/member/${userMemberClient.id}`)
            .set("authorization", "Bearer " + accessTokenAsMember)
            .set("refreshToken", "Bearer " + refreshTokenAsMember)
            .expect(401);
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MEMBER WITHOUT AUTHENTICATION", () => {
      test(
        `When accesses DELETE ${userResourcePath}/:id with without authentication ` +
          "then it should return a 401 status",
        async () => {
          const response = await request(app)
            .delete(userResourcePath + `/${userMemberAdmin.id}`)
            .expect(401);
          return expect(response.statusCode).toBe(401);
        }
      );
    });

    describe("DELETING MANY MEMBER AS AN ADMIN", () => {
      let manyMembers: Array<User & {}>;
      beforeAll(async () => {
        // CREATING CLIENT TO TEST MEMBERS
        const userClient = await prismaClient.user.create({
          data: {
            name: "TEST CREATE CLIENT TO DELETE MANY MEMBERS",
            password: encodeSha256("123"),
            roleId: clientAuthenticated.roleId,
            client: {
              create: {
                address: {
                  create: {
                    house: "1000",
                    square: "1000",
                  },
                },
              },
            },
          },
          include: {
            client: true,
          },
        });

        // CREATING MANY USERS
        for (let index = 0; index < 20; index++) {
          await prismaClient.user.create({
            data: {
              name: `TEST MEMBER TO DELETE MANY ${index}`,
              password: "123",
              roleId: memberAuthenticated.roleId,
              member: {
                create: {
                  clientId: userClient.client.id,
                },
              },
            },
          });
        }

        manyMembers = await prismaClient.user.findMany({
          where: {
            name: {
              contains: "TEST MEMBER TO DELETE MANY",
            },
          },
          include: {
            role: true,
            member: true,
          },
        });
      });

      afterAll(async () => {
        await prismaClient.user.deleteMany({
          where: {
            OR: [
              { name: "TEST CREATE CLIENT TO DELETE MANY MEMBERS" },
              {
                name: {
                  contains: "TEST MEMBER TO DELETE MANY",
                },
              },
            ],
          },
        });

        await prismaClient.address.deleteMany({
          where: {
            square: "1000",
            house: "1000",
          },
        });
      });

      test(
        `When a CLIENT accesses DELETE MANY ${memberResourcePath}/deleteMany?ids=id1&id2 ` +
          "in which the ids that to belong to the client logged then it should return a 204 status",
        async () => {
          const clientAuthenticated = await request(app)
            .post("/api/v1/signin")
            .send({
              name: "TEST CREATE CLIENT TO DELETE MANY MEMBERS",
              password: "123",
            })
            .set("Accept", "application/json")
            .expect(200);

          const deleteManyRoute =
            memberResourcePath +
            `/deleteMany?ids=${manyMembers
              .map((member) => member.id)
              .join(",")}`;

          const response = await request(app)
            .delete(deleteManyRoute)
            .set(
              "authorization",
              "Bearer " + clientAuthenticated.body.accessToken
            )
            .set(
              "refreshToken",
              "Bearer " + clientAuthenticated.body.refreshToken
            )
            .expect(204);

          return expect(response.statusCode).toBe(204);
        }
      );

      test(
        `When a CLIENT accesses DELETE MANY ${memberResourcePath}/deleteMany?ids=id1&id2 ` +
          "in which the ids that don't belong to the client logged then it should return a 401 status",
        async () => {
          const deleteManyRoute =
            memberResourcePath +
            `/deleteMany?ids=${manyMembers
              .map((member) => member.id)
              .join(",")}`;

          const response = await request(app)
            .delete(deleteManyRoute)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(401);

          return expect(response.statusCode).toBe(401);
        }
      );

      test(
        `When a CLIENT accesses DELETE MANY ${memberResourcePath}/deleteMany ` +
          "without ids, then it should return a 400 status",
        async () => {
          const deleteManyRoute = memberResourcePath + `/deleteMany`;

          const response = await request(app)
            .delete(deleteManyRoute)
            .set("authorization", "Bearer " + accessTokenAsClient)
            .set("refreshToken", "Bearer " + refreshTokenAsClient)
            .expect(400);

          return expect(response.statusCode).toBe(400);
        }
      );
    });
  });
});
