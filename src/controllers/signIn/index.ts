import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getUser } from "@repositories/user";

export const signInController = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await getUser({ password, username }, ["Role"]);

    const accessToken = jwt.sign(
      { id: user.id, name: user.name, roleId: user.roleId, role: user.role },
      process.env.TOKEN_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "test" ? 5 : "15m", // token with 15 minutes of expiration
      }
    );

    const refreshToken = jwt.sign(
      { id: user.id, name: user.name, roleId: user.roleId, role: user.role },
      process.env.TOKEN_SECRET,
      {
        expiresIn: process.env.NODE_ENV === "test" ? 10 : "1d", // token with 1 hour of expiration
      }
    );

    return res.status(200).json({
      message: "Token session created successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user.id,
        name: user.name,
        roleId: user.roleId,
        role: user.role,
      },
    });
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
