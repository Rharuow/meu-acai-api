import { deleteProductRepository } from "@repositories/products";
import { badRequest } from "@serializer/erros/400";
import { Request, Response } from "express";

export const deleteProductController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteProductRepository({ id });
    return res.status(204).send("Product deleted successfully");
  } catch (error) {
    return badRequest({
      res,
      message: "Error deleting product = " + error.message,
    });
  }
};
