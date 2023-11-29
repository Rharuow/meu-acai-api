import jwt from "jsonwebtoken";
import { Role, User } from "@prisma/client";
import { Request, Response } from "express";

export const refreshTokenController = async (req: Request, res: Response) => {
  const refreshToken = String(req.headers.refreshtoken).split("Bearer ")[1];

  // Verify the refresh token
  jwt.verify(
    String(refreshToken),
    process.env.TOKEN_SECRET,
    (err: any, user: User & { role?: Role }) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid refresh token" });
      }

      // If the refresh token is valid, issue a new access token
      const newAccessToken = jwt.sign(
        { id: user.id, name: user.name, roleId: user.roleId, role: user.role },
        process.env.TOKEN_SECRET,
        {
          expiresIn: process.env.NODE_ENV === "test" ? 5 : "15m", // token with 15 minutes of expiration
        }
      );

      return res.json({ accessToken: newAccessToken });
    }
  );
};
