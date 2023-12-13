import { app } from "@/app";
import { Admin, Client, Member, Role, User } from "@prisma/client";
import { verify } from "jsonwebtoken";
import request from "supertest";
import { createAdminRoleIfNotExist } from "../utils/createAdminRoleIfNotExists";
import { createClientRoleIfNotExist } from "../utils/createClientRoleIfNotExists";
import { createMemberRoleIfNotExist } from "../utils/createMemberRoleIfNotExists";
import { createAdmin } from "@repositories/user/admin";
import { createClient } from "@repositories/user/client";
import { createMember } from "@repositories/user/member";
import { prismaClient } from "@libs/prisma";

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
  const roleIdAdmin = await createAdminRoleIfNotExist();
  const roleIdClient = await createClientRoleIfNotExist();
  const roleIdMember = await createMemberRoleIfNotExist();

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

  userAdmin = await createAdmin(createUserAdminBody);
  userClient = await createClient(createUserClientBody);
  userMember = await createMember({
    ...createUserMemberBody,
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

describe("Sign in route", () => {
  test("When accessing the POST route '/api/v1/signin' with the name and password belonging to the admin in the request body, return in the response body the accessToken, refreshToken, and user information.", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: userAdmin.name, password: "123" })
        .set("Accept", "application/json")
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name");
      expect(response.body.user).toHaveProperty("roleId");

      accessToken = response.body.token;
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
            expect(decoded.name).toBe("Test Admin");
          }
        }
      );
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when send unpermitted params in body, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: userAdmin.name, password: "123", unpermittedParam: true })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when send missing params in body, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send({ name: "Missing password" })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

      return expect(response.statusCode).toBe(422);
    } catch (error) {
      throw new Error(error.message);
    }
  });

  test("when send query params, return 422", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin?someParam=true")
        .send({ name: userAdmin.name, password: "123" })
        .set("Accept", "application/json")
        .expect(422);

      expect(response.body).toHaveProperty("errors");

      expect(response.body.errors.length).toBeGreaterThan(0);

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

    const responseWithPasswordWrong = await request(app)
      .post("/api/v1/signin")
      .send({ name: userAdmin.name, password: "wrong" })
      .set("Accept", "application/json")
      .expect(401);

    expect(responseWithPasswordWrong.statusCode).toBe(401);

    return expect(responseWithNameWrong.statusCode).toBe(401);
  });
});
