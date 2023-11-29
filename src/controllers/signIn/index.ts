import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getUserByNameAndPassword } from "@repositories/user";
import { unprocessableEntity } from "@serializer/erros/422";

export const signInController = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  try {
    const user = await getUserByNameAndPassword({ password, name }, ["Role"]);

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
    if (error.message === "NotFoundError: No User found error")
      return res
        .status(404)
        .json({ error: "User not found", message: "The user not registred." });
    return unprocessableEntity(res);
  }
};
