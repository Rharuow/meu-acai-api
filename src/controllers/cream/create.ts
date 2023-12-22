import { unprocessableEntity } from "@serializer/erros/422";
import { createCreamSerializer } from "@serializer/resources/creams";
import { Prisma } from "@prisma/client";
import { createCream } from "@repositories/creams";
import { Request, Response } from "express";
import { CreateCreamRequestBody } from "@/types/creams/createRequestbody";

export const createCreamController = async (
  req: Request<{}, {}, CreateCreamRequestBody, {}>,
  res: Response
) => {
  try {
    const cream = await createCream(req.body);

    return res.json(createCreamSerializer(cream));
  } catch (error) {
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const { clientVersion, ...errorSanitized } = error;
      // Handle the unique constraint violation error here
      return unprocessableEntity(
        res,
        `Unique constraint failed on the fields: ${errorSanitized.meta.target}`
      );
    } else {
      // Handle other errors
      return unprocessableEntity(res, { message: error.message });
    }
  }
};
