import { Address } from "@prisma/client";
import { Response } from "express";

export const createAddressSerializer = ({
  address,
  res,
}: {
  address: Address;
  res: Response;
}) =>
  res.json({
    message: "Address created successfully",
    data: address,
  });

export const createManyAddressSerializer = ({
  addresses,
  res,
}: {
  addresses: Array<Address>;
  res: Response;
}) =>
  res.json({
    message: "Addresses created successfully",
    data: addresses,
  });
