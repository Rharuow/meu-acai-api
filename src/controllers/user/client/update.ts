import { updateClientSerializer } from "@serializer/resources/user/client";
import { getClient, updateClient } from "@repositories/user/client";
import { unprocessableEntity } from "@serializer/erros/422";
import { Request, Response } from "express";

export const updateClientController = async (req: Request, res: Response) => {
  const { user, client: clientFields } = req.body;

  const { id } = req.params;

  try {
    const client = clientFields
      ? await updateClient({ userId: user.id, id, fields: clientFields })
      : await getClient({ id });

    return updateClientSerializer({ res, user, client });
  } catch (error) {
    console.log("Error updating client = ", error);
    return unprocessableEntity(res, {
      message: "Error updating client = " + error.message,
    });
  }
};
