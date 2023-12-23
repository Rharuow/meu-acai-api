import { Request, Response } from "express";
import { badRequest } from "@serializer/erros/400";
import { UpdateProductRequestBody } from "@/types/product/updateRequestBody";
import { updateProductRepository } from "@repositories/products";
import { updateProductSerializer } from "@serializer/resources/product";

export const updateProductController = async (
  req: Request<{ id: string }, {}, UpdateProductRequestBody, {}>,
  res: Response
) => {
  try {
    const product = await updateProductRepository({
      fields: req.body,
      id: req.params.id,
    });

    return updateProductSerializer({ res, product });
  } catch (error) {
    return badRequest({
      res,
      message: "Error updating product = " + error.message,
    });
  }
};
