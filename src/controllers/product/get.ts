import { getProductRepository } from "@repositories/products";
import { badRequest } from "@serializer/erros/400";
import { getProductSerializer } from "@serializer/resources/product";
import { Request, Response } from "express";

export const getProductController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const product = await getProductRepository({ id });
    return getProductSerializer({ product, res });
  } catch (error) {
    return badRequest({
      res,
      message: "Error getting product = " + error.message,
    });
  }
};
