import { Product } from "@prisma/client";

export type CreateProductRequestBody = Pick<
  Product,
  "size" | "maxCreamsAllowed" | "maxToppingsAllowed" | "price" | "adminId"
> &
  Partial<Pick<Product, "available" | "photo" | "name">>;
