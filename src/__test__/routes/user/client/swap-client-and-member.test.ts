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
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";

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

  const [
    responseSignInAsAdmin,
    responseSignInAsClient,
    responseSignInAsMember,
  ] = await Promise.all([
    request(app)
      .post("/api/v1/signin")
      .send({ name: adminCreateBody.name, password: adminCreateBody.password })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({
        name: clientCreateBody.name,
        password: clientCreateBody.password,
      })
      .set("Accept", "application/json")
      .expect(200),
    request(app)
      .post("/api/v1/signin")
      .send({
        name: memberCreateBody.name,
        password: memberCreateBody.password,
      })
      .set("Accept", "application/json")
      .expect(200),
  ]);

  accessTokenAdmin = `Bearer ${responseSignInAsAdmin.body.accessToken}`;
  refreshTokenAdmin = `Bearer ${responseSignInAsAdmin.body.refreshToken}`;

  accessTokenClient = `Bearer ${responseSignInAsClient.body.accessToken}`;
  refreshTokenClient = `Bearer ${responseSignInAsClient.body.refreshToken}`;

  accessTokenMember = `Bearer ${responseSignInAsMember.body.accessToken}`;
  refreshTokenMember = `Bearer ${responseSignInAsMember.body.refreshToken}`;
  return;
});

let updateSuccessBodyResponse = {};
let updateBadRequestBodyResponse = {};
let updateUnprocessableEntityBodyResponse = {};
let updateUnauthorizedBodyResponse = {};

afterAll(async () => {
  await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/resources/users/clients/swap/{id}": {
        put: {
          summary: "SWAP role between Client and Member",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Client that the will be swapped",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description:
            "Endpoint to swap the Client with its associated member.",
          tags: ["Client"],
          requestBody: {
            description: "Details to swap the client",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    memberId: {
                      type: "stirng",
                      example: "some-id-of-member-belongs-to-this-client",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful swapping the client",
              content: {
                "application/json": { example: updateSuccessBodyResponse },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: updateUnprocessableEntityBodyResponse,
                },
              },
            },
            "400": {
              description: "Bad request",
              content: {
                "application/json": {
                  example: updateBadRequestBodyResponse,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: updateUnauthorizedBodyResponse },
              },
            },
          },
          security: [
            {
              BearerAuth: [],
            },
          ],
        },
      },
    },
  });

  return await prismaClient.user.deleteMany({
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
    let secondaryClient: User & { role: Role; client: Client };
    let memberBelongsToSecondaryClient: User & { role: Role; member: Member };

    const createSecondaryClientBody = {
      address: { house: "secondary client", square: "secondary client" },
      password: "123",
      name: "Test Secondary client",
    };

    const createMemberToSecondaryClient = {
      name: "Test member to secondary client",
      password: "123",
    };

    beforeAll(async () => {
      secondaryClient = await createClient({
        ...createSecondaryClientBody,
        roleId: userClientAuthenticated.roleId,
      });
      memberBelongsToSecondaryClient = await createMember({
        ...createMemberToSecondaryClient,
        roleId: userMemberAuthenticated.roleId,
        clientId: secondaryClient.client.id,
      });
    });

    afterAll(async () => {
      await prismaClient.user.deleteMany({
        where: {
          id: {
            in: [secondaryClient.id, memberBelongsToSecondaryClient.id],
          },
        },
      });
    });

    test(
      `When an Admin access PUT ${basePathRouter}/:id` +
        " sending in the body the memberId that's belongs to other client," +
        " then the status code 400 with message in body response 'Member not belongs to this client.'",
      async () => {
        const response = await request(app)
          .put(`${basePathRouter}/${userClientAuthenticated.client.id}`)
          .send({ memberId: memberBelongsToSecondaryClient.member.id })
          .set("authorization", accessTokenAdmin)
          .set("refreshToken", refreshTokenAdmin)
          .expect(400);

        updateBadRequestBodyResponse = response.body;

        return expect(response.body).toHaveProperty(
          "message",
          "Member not belongs to this client."
        );
      }
    );

    test(
      `When an Admin access PUT ${basePathRouter}/:id` +
        " with body content empty" +
        " then the return status be equal to 422 and a body content with message value 'memberId must be a string and not empty'",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .set("authorization", accessTokenAdmin)
          .set("refreshTojken", refreshTokenAdmin)
          .expect(422);

        updateUnprocessableEntityBodyResponse = response.body;

        expect(response.body).toHaveProperty(
          "message",
          "memberId must be a string and not empty"
        );

        return expect(response.status).toBe(422);
      }
    );

    test(
      `When an Admin access PUT ${basePathRouter}/:id` +
        " sending invalid memberId in body" +
        " then the response should be status 400 and have a property message in body with value 'Member not belongs to this client.'",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .send({
            memberId: "invalid-member-id",
          })
          .set("authorization", accessTokenAdmin)
          .set("refreshToken", refreshTokenAdmin)
          .expect(400);

        return expect(response.body).toHaveProperty(
          "message",
          "Member not belongs to this client."
        );
      }
    );

    test(
      `When an Admin access token PUT ${basePathRouter}/:id` +
        " sending in body the memberId valid but the client id in router is invalid" +
        " result status should be 400 and the message 'No client found'",
      async () => {
        const response = await request(app)
          .put(basePathRouter + "/invalid-id")
          .send({
            memberId: userMemberAuthenticated.member.id,
          })
          .set("authorization", accessTokenAdmin)
          .set("refreshToken", refreshTokenAdmin)
          .expect(400);

        expect(response.body).toHaveProperty("message", "No client found");
        return expect(response.statusCode).toBe(400);
      }
    );

    test(
      `When an Admin access PUT ${basePathRouter}/:id` +
        " sending in body the memberId that will be swapped," +
        " then the member will be swapped to the client and the client will be swapped to the member",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .send({
            memberId: userMemberAuthenticated.member.id,
          })
          .set("authorization", accessTokenAdmin)
          .set("refreshToken", refreshTokenAdmin)
          .expect(200);

        updateSuccessBodyResponse = response.body;

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

  describe("SWAP AS CLIENT", () => {
    test(
      `When a Client access ${basePathRouter}/:id` +
        " sending memberId that belongs to one of it members or not" +
        " the result should be 401 and in the body must be the message property with 'User haven't access token'",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .send({
            memberId: userMemberAuthenticated.member.id,
          })
          .set("authorization", accessTokenClient)
          .set("refreshToken", refreshTokenClient)
          .expect(401);

        updateUnauthorizedBodyResponse = response.body;

        expect(response.body).toHaveProperty(
          "message",
          "User haven't permission"
        );
        return expect(response.statusCode).toBe(401);
      }
    );
  });

  describe("SWAP AS MEMBER", () => {
    test(
      `When a Member access ${basePathRouter}/:id` +
        " sending memberId" +
        " the result should be 401 and in the body must be the message property with 'User haven't access token'",
      async () => {
        const response = await request(app)
          .put(basePathRouter + `/${userClientAuthenticated.client.id}`)
          .send({
            memberId: userMemberAuthenticated.member.id,
          })
          .set("authorization", accessTokenMember)
          .set("refreshToken", refreshTokenMember)
          .expect(401);

        expect(response.body).toHaveProperty(
          "message",
          "User haven't permission"
        );
        return expect(response.statusCode).toBe(401);
      }
    );
  });
});
