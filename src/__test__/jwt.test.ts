import request from "supertest";
import { app } from "@/app";
import { verify } from "jsonwebtoken";
import { createAdminRoleIfNotExist } from "./utils/createAdminRoleIfNotExists";
import { createUserIfNotExist } from "./utils/createUserIfNotExists copy";

type User = {
  id: string;
  name: string;
  password: string;
  roleId: string;
};

let accessToken: string;

const requestBody = {
  username: "Test Admin",
  password: "123",
};

beforeAll(async () => {
  const adminId = await createAdminRoleIfNotExist();
  await createUserIfNotExist(adminId);
});

describe("Signin route", () => {
  test("when access POST route '/api/v1/signin' contains in body the username and password correclty", async () => {
    try {
      const response = await request(app)
        .post("/api/v1/signin")
        .send(requestBody)
        .set("Accept", "application/json")
        .expect(200);

      expect(response.body).toHaveProperty("accessToken");

      accessToken = response.body.accessToken;

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
      console.log(error);
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
});
