import { app } from "@/app";
import request from "supertest";
import { userAdmin } from "../../utils/userAdmin";
import { prismaClient } from "@libs/prisma";

let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  const response = await request(app)
    .post("/api/v1/signin")
    .send(userAdmin)
    .set("Accept", "application/json")
    .expect(200);

  accessToken = response.body.accessToken;
  refreshToken = response.body.refreshToken;
});

const createCreamRequestBody: CreateCreamRequestBody = {
  name: "Test Cream",
  price: 9.99,
  amount: 1,
  unit: "unit",
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
      .set("authorization", `Bearer ${accessToken}`)
      .set("refreshToken", `Bearer ${refreshToken}`)
      .send(createCreamRequestBody)
      .expect(200);

    return expect(response.statusCode).toBe(200);
  });

  test("when access POST /api/v1/resources/creams without authentication, return 401", async () => {
    const response = await request(app)
      .post(creamResourcePath)
      .send(createCreamRequestBody)
      .expect(401);

    return expect(response.statusCode).toBe(401);
  });

  test("when access POST /api/v1/resources/creams with authentication different of 'ADMIN' role user, return 401", () => {});

  // LIST
  test("when access GET /api/v1/resources/creams authenticated as ADMIN role, list max ten first creams", async () => {
    const response = await request(app)
      .get(creamResourcePath)
      .set("authorization", `Bearer ${accessToken}`)
      .set("refreshtoken", `Bearer ${refreshToken}`)
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

  // UPDATE
  test("when access PUT /api/v1/resources/creams/:id authenticated as ADMIN role, update at DB a cream resource with name 'Test Cream' to 'Test Cream Edited'", () => {});

  test("when access PUT /api/v1/resources/creams/:id without authentication, return 401", () => {});

  test("when access PUT /api/v1/resources/creams/:id with authentication different of 'ADMIN' role user, return 401", () => {});

  // DELETE
  test("when access DELETE /api/v1/resources/creams/:id authenticated as ADMIN role, update at DB a cream resource with name 'Test Cream' to 'Test Cream Edited'", () => {});

  test("when access DELETE /api/v1/resources/creams/:id without authentication, return 401", () => {});

  test("when access DELETE /api/v1/resources/creams/:id with authentication different of 'ADMIN' role user, return 401", () => {});
});
