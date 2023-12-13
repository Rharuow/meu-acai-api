import { updateClientSerializer } from "@serializer/resources/user/client";
import { getClient, updateClient } from "@repositories/user/client";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";
import { UpdateUserRequestBody } from "@/types/user/updateRequestBody";
import { UpdateClientRequestBody } from "@/types/user/client/updateRequestBody";

export const updateClientController = async (
  req: Request<
    { id: string; userId: string },
    {},
    UpdateUserRequestBody & UpdateClientRequestBody,
    qs.ParsedQs
  >,
  res: Response
) => {
  const { id, userId } = req.params;

  try {
    const client = await updateClient({ id, userId, fields: req.body });

    return updateClientSerializer({ res, client });
  } catch (error) {
    return unprocessableEntity(res, {
      message: "Error updating client = " + error.message,
    });
  }
};
