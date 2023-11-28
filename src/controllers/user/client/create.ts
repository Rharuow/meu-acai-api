import { createClient, createManyClients } from "@repositories/user/client";
import {
  createClientSerializer,
  createManyClientSerializer,
} from "@serializer/resources/user/client";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

export const createClientController = async (req: Request, res: Response) => {
  const { user, addressId } = req.body;
  try {
    const client = await createClient({
      userId: user.id,
      addressId,
    });

    return createClientSerializer({ res, user, client });
  } catch (error) {
    console.log(" create client controller = ", error);
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Unique constraint violation:", error.message);
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

export const createManyClientsController = async (
  req: Request,
  res: Response
) => {
  const { users } = req.body as {
    users: Array<{ id: string; addressId: string }>;
  };

  try {
    await createManyClients({ users });

    return createManyClientSerializer({ res });
  } catch (error) {
    console.error("Error creating client = ", error.message);
    return unprocessableEntity(res, {
      message: "Error creating client = " + error.message,
    });
  }
};
