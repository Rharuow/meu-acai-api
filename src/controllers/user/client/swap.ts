import { swapClient } from "@repositories/user/client";
import { badRequest } from "@serializer/erros/400";
import { swapClientSerializer } from "@serializer/resources/user/client";
import { Request, Response } from "express";

export const swapClientController = async (
  req: Request<{ id: string }, {}, { memberId: string }, qs.ParsedQs>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const user = await swapClient({ id, memberId });

    return swapClientSerializer({ res, user });
  } catch (error) {
    console.error("Failed to swap client = ", error);

    return badRequest({
      res,
      message: "Failed to swap client = " + error.message,
    });
  }
};
