import { Topping } from "@prisma/client";

export type CreateToppingRequestBody = Pick<
  Topping,
  "name" | "amount" | "price" | "adminId"
> &
  Partial<Pick<Topping, "available" | "isSpecial" | "photo" | "unit">>;
