import { updateCreamSerializer } from "@/serializeres/resources/creams";
import { updateCream } from "@repositories/creams";
import { Request, Response } from "express";

export const updateCreamController = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("id = ", id);

  const fields = req.body as UpdateCreamRequestBody;

  try {
    const cream = await updateCream({ id, fields });

    return res.json(updateCreamSerializer(cream));
  } catch (error) {
    console.log("update cream error", error);
    return res.status(500);
  }
};
