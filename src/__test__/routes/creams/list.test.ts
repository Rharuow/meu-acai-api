import { app } from "@/app";
import request from "supertest";
import { userAdmin } from "../../utils/userAdmin";

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

describe("list cream", () => {
  test("when access /api/v1/resources/creams authenticated as ADMIN role, list max ten first creams", async () => {
    const response = await request(app)
      .get("/api/v1/resources/creams")
      .set("authorization", accessToken)
      .set("refreshtoken", refreshToken)
      .expect(200);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("nextPage");
    expect(response.body).toHaveProperty("data");
    expect(response.body).toHaveProperty("hasNextPage");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("page");
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    expect(response.body.page).toBe(1);
  });

  test("when access /api/v1/resources/creams without authentication, return 401 status", async () => {
    const response = await request(app)
      .get("/api/v1/resources/creams")
      .expect(401);

    expect(response.statusCode).toBe(401);
  });

  test("when access /api/v1/resources/creams with authentication with role invalid, return 401 status", async () => {
    const response = await request(app)
      .get("/api/v1/resources/creams")
      .set("authorization", accessToken)
      .set("refreshtoken", refreshToken)
      .expect(401);

    expect(response.statusCode).toBe(401);
  });
});
