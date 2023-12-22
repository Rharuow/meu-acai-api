import { Topping } from "@prisma/client";

export type UpdateToppingRequestBody = Partial<
  Pick<
    Topping,
    "amount" | "available" | "isSpecial" | "name" | "photo" | "price" | "unit"
  >
>;
