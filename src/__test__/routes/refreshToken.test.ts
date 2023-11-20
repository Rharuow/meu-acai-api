import { app } from "@/app";
import { User } from "@prisma/client";
import { VerifyErrors, verify } from "jsonwebtoken";
import request from "supertest";
import { createAdminRoleIfNotExist } from "../utils/createAdminRoleIfNotExists";
import { createUserIfNotExist } from "../utils/createUserIfNotExists copy";
import { userAdmin } from "../utils/userAdmin";

const futureTime = Math.floor(Date.now() / 1000) + 10;

beforeAll(async () => {
  const adminId = await createAdminRoleIfNotExist();
  await createUserIfNotExist(adminId);
});

describe("Refresh token router", () => {
  test("when the accessToken expires, the refresh token router is called to regenerate a new access token", async () => {
    const responseSignIn = await request(app)
      .post("/api/v1/signin")
      .send(userAdmin)
      .set("Accept", "application/json")
      .expect(200);

    const accessToken = responseSignIn.body.accessToken;
    const refreshToken = responseSignIn.body.refreshToken;

    const responseRefreshToken = await request(app)
      .post("/api/v1/refresh-token")
      .set("Accept", "application/json")
      .set("authorization", `Bearer ${accessToken}`)
      .set("refreshToken", `Bearer ${refreshToken}`)
      .expect(200);

    const secondAccessToken = responseRefreshToken.body.accessToken;

    verify(
      accessToken,
      process.env.TOKEN_SECRET,
      { clockTimestamp: futureTime },
      (err: VerifyErrors, user: User) => {
        expect(err).toBeTruthy();
        expect(user).toBeUndefined();
        expect(err.name).toBe("TokenExpiredError");
        expect(err.message).toBe("jwt expired");
      }
    );

    verify(
      secondAccessToken,
      process.env.TOKEN_SECRET,
      (err: VerifyErrors, user: User) => {
        console.log("User = ", user);
        expect(err).toBeNull();
        expect(user).toBeTruthy();
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("roleId");
      }
    );
  });
});
