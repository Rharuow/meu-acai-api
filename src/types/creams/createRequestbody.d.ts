import { Cream } from "@prisma/client";

export type CreateCreamRequestBody = Pick<
  Cream,
  "name" | "amount" | "price" | "unit" | "adminId"
> &
  Partial<Pick<Cream, "photo">>;
