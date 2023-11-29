import { unprocessableEntity } from "@serializer/erros/422";
import { updateCreamSerializer } from "@serializer/resources/creams";
import { updateCream } from "@repositories/creams";
import { Request, Response } from "express";
import { UpdateCreamRequestBody } from "@/types/creams/updateRequestBody";

export const updateCreamController = async (req: Request, res: Response) => {
  const { id } = req.params;

  const fields = req.body as UpdateCreamRequestBody;

  try {
    const cream = await updateCream({ id, fields });

    return res.json(updateCreamSerializer(cream));
  } catch (error) {
    return unprocessableEntity(res, { message: error.message });
  }
};
