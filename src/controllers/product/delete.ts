import {
  deleteManyProductsRepository,
  deleteProductRepository,
} from "@repositories/products";
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

export const deleteManyProductsController = async (
  req: Request<{}, {}, {}, { resourceIds: Array<string> } & qs.ParsedQs>,
  res: Response
) => {
  const { resourceIds } = req.query;
  try {
    await deleteManyProductsRepository({ ids: resourceIds });
    return res.status(204).send("products deleted successfully");
  } catch (error) {
    return badRequest({ res });
  }
};
