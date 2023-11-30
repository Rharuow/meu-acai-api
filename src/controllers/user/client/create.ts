import { createClient } from "@repositories/user/client";
import { createClientSerializer } from "@serializer/resources/user/client";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

export const createClientController = async (req: Request, res: Response) => {
  const { user, address } = req.body;
  try {
    const client = await createClient({
      userId: user.id,
      address,
    });

    return createClientSerializer({ res, user, client });
  } catch (error) {
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const { clientVersion, ...errorSanitized } = error;
      // Handle the unique constraint violation error here
      return unprocessableEntity(res, {
        errorSanitized,
        message: `Unique constraint failed on the fields: ${errorSanitized.meta.target}`,
      });
    } else {
      // Handle other errors
      return unprocessableEntity(res, { message: error.message });
    }
  }
};
