import { app } from "@/app";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { verify } from "jsonwebtoken";
import request from "supertest";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";
import { createAdminRoleIfNotExist } from "../presets/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../presets/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../presets/createMemberRoleIfNotExists";
import { saveSwaggerDefinitions } from "@/generateSwagger";
import swaggerDefinition from "@/swagger-spec.json";

let accessToken: string;
let refreshToken: string;

let userAdmin: User & { role: Role; admin: Admin };
let userClient: User & { role: Role; client: Client };
let userMember: User & { role: Role; member: Member };

let createUserAdminBody = {
  name: "Test User Admin to sign in test",
  password: "123",
  email: "test@example",
  phone: "(00) 000000000",
  roleId: "",
};

let createUserClientBody = {
  name: "Test User Client to sign in test",
  password: "123",
  address: { house: "test signin house", square: "test signin square" },
  email: "test@example",
  phone: "(00) 000000000",
  roleId: "",
};

let createUserMemberBody = {
  name: "Test User Member to sign in test",
  password: "123",
  email: "test@example",
  phone: "(00) 000000000",
  roleId: "",
};

beforeAll(async () => {
  const [roleIdAdmin, roleIdClient, roleIdMember] = await Promise.all([
    createAdminRoleIfNotExist(),
    createClientRoleIfNotExist(),
    createMemberRoleIfNotExist(),
  ]);

  createUserAdminBody = {
    ...createUserAdminBody,
    roleId: roleIdAdmin,
  };

  createUserClientBody = {
    ...createUserClientBody,
    roleId: roleIdClient,
  };

  createUserMemberBody = {
    ...createUserMemberBody,
    roleId: roleIdMember,
  };

  const [userAdminCreated, userClientCreated] = await Promise.all([
    createAdmin(createUserAdminBody),
    createClient(createUserClientBody),
  ]);

  userAdmin = userAdminCreated;
  userClient = userClientCreated;
  userMember = await createMember({
    ...createUserMemberBody,
    clientId: userClient.client.id,
  });
});

let responseSuccessBodyExample = {};
let responseUnprocessableEntityBodyExample = {};
let responseUnautorazedBodyExample = {};

afterAll(async () => {
  await prismaClient.user.deleteMany({
    where: {
      id: {
        in: [userAdmin.id, userClient.id, userMember.id],
      },
    },
  });

  await saveSwaggerDefinitions({
    paths: {
      ...swaggerDefinition.paths,
      "/api/v1/signin": {
        post: {
          summary: "User Sign In",
          description: "Authenticate and sign in a user.",
          tags: ["Authentication"],
          requestBody: {
            description: "User credentials for sign-in",
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string", example: "john_doe" },
                    password: { type: "string", example: "securepassword" },
                  },
                  required: ["username", "password"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful sign-in",
              content: {
                "application/json": { example: responseSuccessBodyExample },
              },
            },
            "422": {
              description: "Unprocessable Entity - parameters are invalid",
              content: {
                "application/json": {
                  example: responseUnprocessableEntityBodyExample,
                },
              },
            },
            "401": {
              description: "Unauthorized - Invalid credentials",
              content: {
                "application/json": { example: responseUnautorazedBodyExample },
              },
            },
          },
        },
      },
    },
  });
});

describe("Sign in route", () => {
  test("When accessing the POST route '/api/v1/signin' with the name and password belonging to the admin in the request body, return in the response body the accessToken, refreshToken, and user information.", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: userAdmin.name, password: "123" })
        .set("Accept", "application/json")
        .expect(200);

      responseSuccessBodyExample = response.body;

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name");
      expect(response.body.user).toHaveProperty("roleId");

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      verify(
        refreshToken,
        process.env.TOKEN_SECRET,
        (err: any, decoded: User) => {
          if (err) console.log("Token verification failed:", err.message);
          else {
            expect(decoded.name).toBe(userAdmin.name);
          }
        }
      );

      return verify(
        accessToken,
        process.env.TOKEN_SECRET,
        (err: any, decoded: User) => {
          if (err) console.log("Token verification failed:", err.message);
          else {
            expect(decoded.name).toBe(userAdmin.name);
          }
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when send unpermitted params in body, return 422 and body message with 'Param(s) not permitted'", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: userAdmin.name, password: "123", unpermittedParam: true })
        .set("Accept", "application/json")
        .expect(422);

      responseUnprocessableEntityBodyExample = response.body;

      expect(response.body).toHaveProperty("message", "Param(s) not permitted");

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when expiring accessToken and trying to get user, a error is returned", async () => {
    const futureTime = Math.floor(Date.now() / 1000) + 5;

    return verify(
      accessToken,
      process.env.TOKEN_SECRET,
      { clockTimestamp: futureTime },
      (err: any, decode: any) => {
        expect(err).toBeTruthy();
        expect(decode).toBeUndefined();
        expect(err.name).toBe("TokenExpiredError");
        expect(err.message).toBe("jwt expired");
      }
    );
  });

  test("when send missing params in body, return 422 and body with message 'password must be a string and not empty'", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: "Missing password" })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty(
        "message",
        "password must be a string and not empty"
      );

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when send query params, return 422 and body message with 'Param(s) not permitted'", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin?someParam=true")
        .send({ name: userAdmin.name, password: "123" })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("message", "Param(s) not permitted");

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when try to make signin with password or name invalid return 401", async () => {
    const responseWithNameWrong = await request(app)
      .post("/api/v1/signin")
      .send({ name: "wrong", password: userAdmin.password })
      .set("Accept", "application/json")
      .expect(401);

    responseUnautorazedBodyExample = responseWithNameWrong.body;

    const responseWithPasswordWrong = await request(app)
      .post("/api/v1/signin")
      .send({ name: userAdmin.name, password: "wrong" })
      .set("Accept", "application/json")
      .expect(401);

    expect(responseWithPasswordWrong.statusCode).toBe(401);

    return expect(responseWithNameWrong.statusCode).toBe(401);
  });
});
