import { app } from "@/app";
import request from "supertest";
import { userAsAdmin, userAsClient } from "../../utils/users";
import { prismaClient } from "@libs/prisma";
import { createAllKindOfUserAndRoles } from "@/__test__/utils/beforeAll/Users";
import { Cream } from "@prisma/client";

let accessTokenAsAdmin: string;
let refreshTokenAsAdmin: string;

let accessTokenAsClient: string;
let refreshTokenAsClient: string;

let accessTokenAsMember: string;
let refreshTokenAsMember: string;

let cream: Cream;

beforeAll(async () => {
  await createAllKindOfUserAndRoles();
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
    .send(userAsClient)
    .set("Accept", "application/json")
    .expect(200);

  accessTokenAsAdmin = responseSignInAsAdmin.body.accessToken;
  refreshTokenAsAdmin = responseSignInAsAdmin.body.refreshToken;

  accessTokenAsClient = responseSignInAsClient.body.accessToken;
  refreshTokenAsClient = responseSignInAsClient.body.refreshToken;

  accessTokenAsMember = responseSignInAsMember.body.accessToken;
  refreshTokenAsMember = responseSignInAsMember.body.refreshToken;
});

const createCreamRequestBody: CreateCreamRequestBody = {
  name: "Test Cream",
  price: 9.99,
  amount: 1,
  unit: "unit",
};

const updateCreamRequestBody: UpdateCreamRequestBody = {
  name: "Test Cream Edited",
};

const creamResourcePath = "/api/v1/resources/creams";

describe("CRUD cream", () => {
  // CREATE
  test("when access POST /api/v1/resources/creams authenticated as ADMIN role, create at DB a cream resource with name 'Test Cream', price '9.99', amount '1', unit 'unit' and createdBy 'Test Admin'", async () => {
    // Verify if cream already exists
    const creamAlreadyExists = await prismaClient.cream.findUnique({
      where: { name: createCreamRequestBody.name },
    });
    // if exists, delete it
    if (creamAlreadyExists)
      await prismaClient.cream.delete({
        where: { name: createCreamRequestBody.name },
      });

    const response = await request(app)
      .post(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsAdmin}`)
      .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
      .send(createCreamRequestBody)
      .expect(200);

    return expect(response.statusCode).toBe(200);
  });

  test("when access POST /api/v1/resources/creams authenticated as ADMIN role and send name cream that's already exists in DB must return 422 status with message 'Unique constraint failed on the fields: name'", async () => {
    const response = await request(app)
      .post(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsAdmin}`)
      .set("refreshToken", `Bearer ${refreshTokenAsAdmin}`)
      .send(createCreamRequestBody)
      .expect(422);

    expect(response.body).toHaveProperty(
      "message",
      "Unique constraint failed on the fields: name"
    );

    return expect(response.statusCode).toBe(422);
  });

  test("when access POST /api/v1/resources/creams without authentication, return 401", async () => {
    const response = await request(app)
      .post(creamResourcePath)
      .send(createCreamRequestBody)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  test("when access POST /api/v1/resources/creams with authentication as client role, return 401", async () => {
    const response = await request(app)
      .post(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsClient}`)
      .set("refreshToken", `Bearer ${refreshTokenAsClient}`)
      .send(createCreamRequestBody)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  test("when access POST /api/v1/resources/creams with authentication as member role, return 401", async () => {
    const response = await request(app)
      .post(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsMember}`)
      .set("refreshToken", `Bearer ${refreshTokenAsMember}`)
      .send(createCreamRequestBody)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  // LIST
  test("when access GET /api/v1/resources/creams authenticated as ADMIN role, list max ten first creams", async () => {
    const response = await request(app)
      .get(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsAdmin}`)
      .set("refreshtoken", `Bearer ${refreshTokenAsAdmin}`)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("hasNextPage");
    expect(response.body).toHaveProperty("totalPages");
    expect(response.body).toHaveProperty("page");
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    return expect(response.body.page).toBe(1);
  });

  test("when access GET /api/v1/resources/creams authenticated as CLIENT role, list max ten first creams", async () => {
    const response = await request(app)
      .get(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsClient}`)
      .set("refreshtoken", `Bearer ${refreshTokenAsClient}`)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("hasNextPage");
    expect(response.body).toHaveProperty("totalPages");
    expect(response.body).toHaveProperty("page");
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    return expect(response.body.page).toBe(1);
  });

  test("when access GET /api/v1/resources/creams authenticated as MEMBER role, list max ten first creams", async () => {
    const response = await request(app)
      .get(creamResourcePath)
      .set("authorization", `Bearer ${accessTokenAsClient}`)
      .set("refreshtoken", `Bearer ${refreshTokenAsClient}`)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("hasNextPage");
    expect(response.body).toHaveProperty("totalPages");
    expect(response.body).toHaveProperty("page");
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    return expect(response.body.page).toBe(1);
  });

  test("when access GET /api/v1/resources/creams without authentication, return 401 status", async () => {
    const response = await request(app)
      .get("/api/v1/resources/creams")
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  // GET
  test("when access GET /api/v1/resources/:id with authentication as Admin, return 200 and the cream at body reponse", async () => {
    cream = await prismaClient.cream.findFirst({
      where: { name: "Test Cream" },
    });

    const response = await request(app)
      .get(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsAdmin)
      .set("refreshToken", refreshTokenAsAdmin)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", cream.name);
    expect(response.body).toHaveProperty("amount", cream.amount);
    expect(response.body).toHaveProperty("id", cream.id);
    expect(response.body).toHaveProperty("available", cream.available);
    expect(response.body).toHaveProperty("unit", cream.unit);
    return expect(response.body).toHaveProperty("price", cream.price);
  });

  test("when access GET /api/v1/resources/:id with authentication as Client, return 200 and the cream at body reponse", async () => {
    const response = await request(app)
      .get(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsClient)
      .set("refreshToken", refreshTokenAsClient)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", cream.name);
    expect(response.body).toHaveProperty("amount", cream.amount);
    expect(response.body).toHaveProperty("id", cream.id);
    expect(response.body).toHaveProperty("available", cream.available);
    expect(response.body).toHaveProperty("unit", cream.unit);
    return expect(response.body).toHaveProperty("price", cream.price);
  });

  test("when access GET /api/v1/resources/:id with authentication as Member, return 200 and the cream at body reponse", async () => {
    const response = await request(app)
      .get(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsMember)
      .set("refreshToken", refreshTokenAsMember)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("name", cream.name);
    expect(response.body).toHaveProperty("amount", cream.amount);
    expect(response.body).toHaveProperty("id", cream.id);
    expect(response.body).toHaveProperty("available", cream.available);
    expect(response.body).toHaveProperty("unit", cream.unit);
    return expect(response.body).toHaveProperty("price", cream.price);
  });

  test("when access GET /api/v1/resources/:id without authentication, return 401 and the message at body reponse with 'Unauthorized: No access token provided'", async () => {
    const response = await request(app)
      .get(creamResourcePath + `/${cream.id}`)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  // UPDATE
  test("when access PUT /api/v1/resources/creams/:id authenticated as ADMIN role, update at DB a cream resource with name 'Test Cream' to 'Test Cream Edited'", async () => {
    const response = await request(app)
      .put(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsAdmin)
      .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
      .send(updateCreamRequestBody)
      .expect(200);

    expect(response.statusCode).toBe(200);

    return await prismaClient.cream.delete({ where: { id: cream.id } });
  });

  test("when access PUT /api/v1/resources/creams/:id authenticated as ADMIN role and body empty, return 422 status", async () => {
    const response = await request(app)
      .put(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsAdmin)
      .set("refreshToken", "Bearer " + refreshTokenAsAdmin)
      .expect(422);

    return expect(response.statusCode).toBe(422);
  });

  test("when access PUT /api/v1/resources/creams/:id without authentication, return 401", async () => {
    const response = await request(app)
      .put(creamResourcePath + `/${cream.id}`)
      .send(updateCreamRequestBody)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  test("when access PUT /api/v1/resources/creams/:id with authentication different of 'ADMIN' role user, return 401", async () => {
    const responseAsClient = await request(app)
      .put(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsClient)
      .send(updateCreamRequestBody)
      .expect(401);

    const responseAsMember = await request(app)
      .put(creamResourcePath + `/${cream.id}`)
      .set("authorization", "Bearer " + accessTokenAsMember)
      .send(updateCreamRequestBody)
      .expect(401);

    expect(responseAsMember.statusCode).toBe(401);

    return expect(responseAsClient.statusCode).toBe(401);
  });

  // DELETE
  test("when access DELETE /api/v1/resources/creams/:id authenticated as ADMIN role, update at DB a cream resource with name 'Test Cream' to 'Test Cream Edited'", () => {});

  test("when access DELETE /api/v1/resources/creams/:id without authentication, return 401", () => {});

  test("when access DELETE /api/v1/resources/creams/:id with authentication different of 'ADMIN' role user, return 401", () => {});
});
