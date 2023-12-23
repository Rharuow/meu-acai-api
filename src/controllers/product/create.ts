import { CreateProductRequestBody } from "@/types/product/createRequestBody";
import { createProductRepository } from "@repositories/products";
import { badRequest } from "@serializer/erros/400";
import { createProductSerializer } from "@serializer/resources/product";
import { Request, Response } from "express";

export const createProductController = async (
  req: Request<{}, {}, CreateProductRequestBody, {}>,
  res: Response
) => {
  try {
    const product = await createProductRepository(req.body);

    return createProductSerializer({ res, product });
  } catch (error) {
    return badRequest({
      res,
      message: `Error creating product = ${error.message}`,
    });
  }
};
