import { prismaClient } from "@libs/prisma";
import { Address } from "@prisma/client";
import { badRequest } from "@serializer/erros/400";
import { NextFunction, Request, Response } from "express";

export const validationIfAddressAlreadyExists = async (
  req: Request<
    { id: string },
    {},
    { address: { house: Address["house"]; square: Address["square"] } },
    qs.ParsedQs
  >,
  res: Response,
  next: NextFunction
) => {
  const {
    address: { house, square },
  } = req.body;
  try {
    const address = await prismaClient.address.findUnique({
      where: {
        house_square: {
          house,
          square,
        },
      },
    });
    if (!address) return next();

    return badRequest({ res, message: "Address already exists" });
  } catch (error) {
    console.error("error in middleware of address already exists", error);
    return badRequest({
      res,
      message: "middleware address already exists" + error.message,
    });
  }
};
