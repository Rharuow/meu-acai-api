import request from "supertest";
import { encodeSha256 } from "@/lib/crypto";
import { prismaClient } from "@/lib/prisma";
import { app } from "@/app";

describe("Signin route", () => {
  test("when access POST route '/api/v1/signgin' contains in body the username and password correclty", async () => {
    const requestBody = {
      username: "Test Admin",
      password: "123",
    };
    try {
      const adminRole = await prismaClient.role.findFirstOrThrow({
        where: { name: "ADMIN" },
      });

      const hasUser = await prismaClient.user.findFirst({
        where: { name: "Test Admin", password: encodeSha256("123") },
      });

      !hasUser &&
        (await prismaClient.user.create({
          data: {
            name: "Test Admin",
            password: encodeSha256("123"),
            roleId: adminRole.id,
          },
        }));

      const response = await request(app)
        .post("/api/v1/signgin")
        .send(requestBody)
        .set("Accept", "application/json")
        .expect(200);

      console.log(response.body);

      expect(response.body).toHaveProperty("token");
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  });
});
