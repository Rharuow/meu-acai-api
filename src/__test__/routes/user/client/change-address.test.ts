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
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";
import { CreateAdminRequestBody } from "@/types/user/admin/createRequestBody";
import { CreateClientRequestBody } from "@/types/user/client/createRequestBody";
import { CreateMemberRequestBody } from "@/types/user/member/createRequestBody";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";

let userAdminToAuthentication: User & { role: Role; admin: Admin };
let userClientToAuthentication: User & { role: Role; client: Client };
let userMemberToAuthentication: User & { role: Role; member: Member };

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

const userAdminCreateBody: Omit<CreateAdminRequestBody, "roleId"> = {
  name: "Test Admin Created",
  password: "123",
  email: "admin@example.com",
  phone: "123",
};

const userClientCreateBody: Omit<CreateClientRequestBody, "roleId"> &
  Omit<CreateUserRequestBody, "roleId"> = {
  name: "Test Client to change address",
  password: "123",
  address: {
    house: "Test Client to change address",
    square: "Test Client to change address",
  },
  email: "test@example.com",
  phone: "123",
};

const userMemberCreateBody: Omit<
  CreateMemberRequestBody,
  "roleId" | "clientId"
> = {
  name: "Test Member to change address",
  password: "123",
  email: "test@example.com",
  relationship: "Filho",
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

  userMemberToAuthentication = await createMember({
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

  accessTokenAsAdmin = "Bearer " + responseAdminSignIn.body.accessToken;
  refreshTokenAsAdmin = "Bearer " + responseAdminSignIn.body.refreshToken;

  accessTokenAsClient = "Bearer " + responseClientSignIn.body.accessToken;
  refreshTokenAsClient = "Bearer " + responseClientSignIn.body.refreshToken;

  accessTokenAsMember = "Bearer " + responseMemberSignIn.body.accessToken;
  refreshTokenAsMember = "Bearer " + responseMemberSignIn.body.refreshToken;
});

let updateSuccessBodyResponse = {};
let updateBadRequestBodyResponse = {};
let updateUnprocessableEntityBodyResponse = {};
let updateUnauthorizedBodyResponse = {};

let newAddress = {
  address: {
    house: "new house create by admin",
    square: "new house create by admin",
  },
};

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [
          userAdminToAuthentication.id,
          userClientToAuthentication.id,
          userMemberToAuthentication.id,
        ],
      },
    },
  });

  return await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/resources/users/clients/{id}/change-address": {
        put: {
          summary: "Update Address Client",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID of the Client that address to update",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          description:
            "Endpoint to update Address belongs to a Client to the system.",
          tags: ["Client"],
          requestBody: {
            description: "Client's Address details for updating",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    address: {
                      type: "object",
                      properties: {
                        house: {
                          type: "stirng",
                          example: newAddress.address.house,
                        },
                        square: {
                          type: "stirng",
                          example: newAddress.address.square,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful updating address of the client",
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
});

describe("CHANGE ADDRESS", () => {
  const basePath = "/api/v1/resources/users/clients/:id/change-address";
  const setBasePath = (id: string) =>
    `/api/v1/resources/users/clients/${id}/change-address`;
  describe("CHANGE ADDRESS AS ADMIN", () => {
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

        updateSuccessBodyResponse = response.body;

        const clientWithAddressUpdated = await prismaClient.client.findUnique({
          where: {
            id: userClientToAuthentication.client.id,
          },
          include: {
            address: true,
          },
        });

        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toHaveProperty(
          "name",
          userClientToAuthentication.name
        );
        expect(response.body.data.user).toHaveProperty(
          "client.address.house",
          clientWithAddressUpdated.address.house
        );
        expect(response.body.data.user).toHaveProperty(
          "client.address.square",
          clientWithAddressUpdated.address.square
        );
        return expect(response.statusCode).toBe(200);
      }
    );

    test(
      `When an Admin accesses PUT ${basePath}` +
        " and sends a request body the address.house and address.square that already exists " +
        " then the response should have a status code 400 and the message in the body should contain the following message 'Address already exists'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .set("authorization", accessTokenAsAdmin)
          .set("refreshToken", refreshTokenAsAdmin)
          .send(newAddress)
          .expect(400);

        return expect(response.body).toHaveProperty(
          "message",
          "Address already exists"
        );
      }
    );

    test(
      `When an Admin accesses PUT ${basePath}` +
        " and not sends a request body " +
        " then the response should have a status code 422 and a body message with value 'Address house must be a string and not empty'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .set("authorization", accessTokenAsAdmin)
          .set("refreshToken", refreshTokenAsAdmin)
          .expect(422);

        updateUnprocessableEntityBodyResponse = response.body;

        expect(response.body).toHaveProperty(
          "message",
          "Address house must be a string and not empty"
        );
        return expect(response.statusCode).toBe(422);
      }
    );
  });

  describe("CHANGE ADDRESS AS CLIENT", () => {
    test(
      `When a Client accesses PUT ${basePath}` +
        " and sends a request body the new address with house and square that not exist and it own address" +
        " then the response should have a status code 200 and the new address will be created and set to the client resource",
      async () => {
        newAddress = {
          address: {
            house: "new house create by client",
            square: "new house create by client",
          },
        };
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .send(newAddress)
          .set("authorization", accessTokenAsClient)
          .set("refreshToken", refreshTokenAsClient)
          .expect(200);

        const clientWithAddressUpdated = await prismaClient.client.findUnique({
          where: {
            id: userClientToAuthentication.client.id,
          },
          include: {
            address: true,
          },
        });

        expect(response.body.data).toHaveProperty("user");
        expect(response.body.data.user).toHaveProperty(
          "name",
          userClientToAuthentication.name
        );
        expect(response.body.data.user).toHaveProperty(
          "client.address.house",
          clientWithAddressUpdated.address.house
        );
        expect(response.body.data.user).toHaveProperty(
          "client.address.square",
          clientWithAddressUpdated.address.square
        );
        return expect(response.statusCode).toBe(200);
      }
    );

    const secondNewAddres = {
      address: {
        house: "new house create by other client",
        square: "new house create by other client",
      },
    };
    test(
      `When a Client accesses PUT ${basePath}` +
        " and sends a request body the new address with house and square that not exist and it isn't own address" +
        " then the response should have a status code 400 and return in the body response the property message with value 'Id mismatch in user authenticated'",
      async () => {
        const newClient = await createClient({
          address: {
            square: "address to new client",
            house: "address to new client",
          },
          name: "Test new Client to update Adress",
          password: "123",
          roleId: userAdminToAuthentication.roleId,
        });

        const response = await request(app)
          .put(setBasePath(newClient.client.id))
          .send(secondNewAddres)
          .set("authorization", accessTokenAsClient)
          .set("refreshToken", refreshTokenAsClient)
          .expect(400);

        updateBadRequestBodyResponse = response.body;

        await prismaClient.user.delete({
          where: {
            id: newClient.id,
          },
        });

        return expect(response.body).toHaveProperty(
          "message",
          "Id mismatch in user authenticated"
        );
      }
    );

    test(
      `When an Client accesses PUT ${basePath}` +
        " and sends a request body the address.house and address.square that already exists " +
        " then the response should have a status code 400 and the message in the body should contain the following message 'Address already exists'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .set("authorization", accessTokenAsClient)
          .set("refreshToken", refreshTokenAsClient)
          .send(newAddress)
          .expect(400);

        return expect(response.body).toHaveProperty(
          "message",
          "Address already exists"
        );
      }
    );

    test(
      `When an Client accesses PUT ${basePath}` +
        " and not sends a request body " +
        " then the response should have a status code 422 and body message with 'Address house must be a string and not empty'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userClientToAuthentication.client.id))
          .set("authorization", accessTokenAsClient)
          .set("refreshToken", refreshTokenAsClient)
          .expect(422);

        expect(response.body).toHaveProperty(
          "message",
          "Address house must be a string and not empty"
        );
        return expect(response.statusCode).toBe(422);
      }
    );
  });

  describe("CHANGE ADDRESS AS MEMBER", () => {
    test(
      `When an Member accesses PUT ${basePath}` +
        " and sends a request body the clientId of member and the address.house and address.square that doesn't exists " +
        " then the response should have a status code 401 and the message in the body should contain the following message 'User has no permissions'",
      async () => {
        newAddress = {
          address: {
            house: "new house create by member",
            square: "new house create by member",
          },
        };
        const response = await request(app)
          .put(setBasePath(userMemberToAuthentication.clientId))
          .set("authorization", accessTokenAsMember)
          .set("refreshToken", refreshTokenAsMember)
          .send(newAddress)
          .expect(401);

        updateUnauthorizedBodyResponse = response.body;

        return expect(response.body).toHaveProperty(
          "message",
          "User has no permissions"
        );
      }
    );
  });

  describe("CHANGE ADDRESS WITHOUT AUTHENTICATION", () => {
    const newAddress = {
      address: {
        house: "new house create without authorization",
        square: "new house create without authorization",
      },
    };

    test(
      `When accesses PUT ${basePath} without authentication` +
        " and sends a request body a client's id existent and the address.house and address.square that doesn't exists " +
        " then the response should have a status code 401 and the message in the body should contain the following message 'Authorization is missing'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userMemberToAuthentication.clientId))
          .send(newAddress)
          .expect(401);

        return expect(response.body).toHaveProperty(
          "message",
          "Authorization is missing"
        );
      }
    );

    test(
      `When accesses PUT ${basePath} with authentication missing prefix 'Bearer '` +
        " and sends a request body a client's id existent and the address.house and address.square that doesn't exists " +
        " then the response should have a status code 401 and the message in the body should contain the following message 'Access token is missing'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userMemberToAuthentication.clientId))
          .send(newAddress)
          .set("authorization", accessTokenAsAdmin.split("Bearer ")[1])
          .expect(401);

        return expect(response.body).toHaveProperty(
          "message",
          "Access token is missing"
        );
      }
    );

    test(
      `When accesses PUT ${basePath} with authentication invalid ` +
        " and sends a request body a client's id existent and the address.house and address.square that doesn't exists " +
        " then the response should have a status code 401 and the message in the body should contain the following message 'jwt malformed'",
      async () => {
        const response = await request(app)
          .put(setBasePath(userMemberToAuthentication.clientId))
          .send(newAddress)
          .set("authorization", "Bearer invalid-credentials")
          .expect(401);

        return expect(response.body).toHaveProperty("message", "jwt malformed");
      }
    );
  });
});
