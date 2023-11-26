import { deleteUser } from "@/repositories/user";
import { unprocessableEntity } from "@/serializer/erros/422";
import { Request, Response } from "express";

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await deleteUser({ id });

    return res.status(204).send("cream is deleted");
  } catch (error) {
    console.error("error deleting user", error.message);
    return unprocessableEntity(res);
  }
};
