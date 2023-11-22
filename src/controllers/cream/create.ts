import { createCreamSerializer } from "@/serializeres/resources/creams";
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
    return res.status(500).json({ message: error.message });
  }
};
