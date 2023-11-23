import { unpermittedParam } from "@/serializeres/erros/422";
import { createCreamSerializer } from "@/serializeres/resources/creams";
import { Prisma } from "@prisma/client";
import { createCream } from "@repositories/creams";
import { Request, Response } from "express";

export const createCreamController = async (req: Request, res: Response) => {
  const fields = req.body as CreateCreamRequestBody;

  const { adminId } = res.locals as { adminId: string };

  try {
    const cream = await createCream({ ...fields, adminId: adminId });

    return res.json(createCreamSerializer(cream));
  } catch (error) {
    console.log(" create cream controller = ", error);
    // Check if the error is due to a unique constraint violation
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Unique constraint violation:", error.message);
      const { clientVersion, ...errorSanitized } = error;
      // Handle the unique constraint violation error here
      return unpermittedParam(res, {
        errorSanitized,
        message: `Unique constraint failed on the fields: ${errorSanitized.meta.target}`,
      });
    } else {
      // Handle other errors
      return res.status(500).json({ message: error.message });
    }
  }
};
