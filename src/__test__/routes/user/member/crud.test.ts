import request from "supertest";
import { createAllKindOfUserAndRoles } from "@/__test__/utils/beforeAll/Users";
import {
  userAsAdmin,
  userAsClient,
  userAsMember,
} from "@/__test__/utils/users";
import { app } from "@/app";
import { Client, Member, Role, User } from "@prisma/client";
import {
  createUser,
  deleteManyUser,
  deleteUser,
  getUserByNameAndPassword,
} from "@repositories/user";
import { encodeSha256 } from "@libs/crypto";
import { prismaClient } from "@libs/prisma";
import { createClient } from "@repositories/user/client";
import { createAddress } from "@repositories/address";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

const memberResourcePath = "/api/v1/resources/users/members";
const userResourcePath = "/api/v1/resources/users";

let clientReferenceToMemberAsAdmin: Client;
let clientReferenceToMemberAsClient: Client;

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

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
  const roleClientId = (
    await prismaClient.role.findUnique({
      where: {
        name: "CLIENT",
      },
    })
  ).id;

  const userToMemberCreatedByAdmin = await createUser({
    name: "Test client reference to member created by Admin",
    password: "123",
    roleId: roleClientId,
  });

  clientReferenceToMemberAsAdmin = await createClient({
    address: { house: "10", square: "10" },
    userId: userToMemberCreatedByAdmin.id,
  });

  const userToMemberCreatedByClient = await createUser({
    name: "Test client reference to member created by Client",
    password: "123",
    roleId: roleClientId,
  });

  clientReferenceToMemberAsClient = await createClient({
    address: { house: "11", square: "11" },
    userId: userToMemberCreatedByClient.id,
  });

  const responseSignInAsAdmin = await request(app)
    .post("/api/v1/signin")
    .send(userAsAdmin)
    .set("Accept", "application/json")
    .expect(200);

  const responseSignInAsClient = await request(app)
    .post("/api/v1/signin")
    .send({
      name: "Test client reference to member created by Client",
      password: "123",
    })
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

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          clientReferenceToMemberAsAdmin.userId,
          clientReferenceToMemberAsClient.userId,
        ],
      },
    },
  });
  await prismaClient.address.deleteMany({
    where: {
      house: {
        in: ["10", "11"],
      },
      square: {
        in: ["10", "11"],
      },
    },
  });
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
            clientId: clientReferenceToMemberAsAdmin.id,
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

        return expect(response.body.data).toHaveProperty(
          "name",
          userMemberAdmin.name
        );
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
          response.body.data.user.member.id === response.body.data.user.memberId
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
          .delete(userResourcePath + `/members/some-id-invalid`)
          .set("authorization", "Bearer " + accessTokenAsClient)
          .set("refreshToken", "Bearer " + refreshTokenAsClient)
          .expect(422);
        return expect(response.statusCode).toBe(422);
      }
    );
  });

  describe("DELETING MEMBER AS AN MEMBER", () => {
    test(
      `When an authenticated MEMBER accesses DELETE ${userResourcePath}/:id ` +
        "then it should return a 401 status",
      async () => {
        const response = await request(app)
          .delete(userResourcePath + `/${userMemberClient.id}`)
          .set("authorization", "Bearer " + accessTokenAsMember)
          .set("refreshToken", "Bearer " + refreshTokenAsMember)
          .expect(401);
        return expect(response.statusCode).toBe(401);
      }
    );

    test(
      `When an authenticated MEMBER accesses DELETE ${userResourcePath}/members/:id ` +
        "then it should return a 401 status",
      async () => {
        const response = await request(app)
          .delete(userResourcePath + `/members/${userMemberClient.id}`)
          .set("authorization", "Bearer " + accessTokenAsMember)
          .set("refreshToken", "Bearer " + refreshTokenAsMember)
          .expect(401);
        return expect(response.statusCode).toBe(401);
      }
    );
  });
});
