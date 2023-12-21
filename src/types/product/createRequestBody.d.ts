import { Product } from "@prisma/client";

export type CreateProductRequestBody = {
  name?: Product["name"];
  price: Product["price"];
  size: Product["size"];
  maxCreamsAllowed: Product["maxCreamsAllowed"];
  maxToppingsAllowed: Product["maxToppingsAllowed"];
  adminId: Product["adminId"];
  available?: Product["available"];
  photo?: Product["photo"];
};
