import { Response } from "express";
import { Product } from "@prisma/client";

export const createProductSerializer = ({
  res,
  product,
}: {
  res: Response;
  product: Product;
}) =>
  res.json({
    message: "Product created successfully",
    data: product,
  });
