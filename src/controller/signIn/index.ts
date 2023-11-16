import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { prismaClient } from "@/lib/prisma";
import { encodeSha256 } from "@/lib/crypto";

export const signIn = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prismaClient.user.findFirstOrThrow({
      where: { name: username, password: encodeSha256(password) },
    });

    const token = jwt.sign(user, process.env.TOKEN_SECRET, {
      expiresIn: Math.floor(Date.now() / 1000) + 60 * 60, // token with 1 hour of expiration
    });

    return res
      .status(200)
      .json({ message: "Token session created successfully", token });
  } catch (error) {
    console.log("signIn controller = ", error);
    if (error.message === "NotFoundError: No User found error")
      return res
        .status(404)
        .json({ error: "User not found", message: "The user not registred." });
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong on the server.",
    });
  }
};
