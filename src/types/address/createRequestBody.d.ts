import { Address } from "@prisma/client";

export type CreateAddressRequestBody = Pick<Address, "house" | "square">;
