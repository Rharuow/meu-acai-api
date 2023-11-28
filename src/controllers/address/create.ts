import { createAddressSerializer } from "@serializer/resources/address";
import {
  createAddress,
  getAddressByHouseAndSquare,
} from "@repositories/address";
import { NextFunction, Request, Response } from "express";
import { badRequest } from "@serializer/erros/400";

export const createAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { square, house } = req.body.address;

    const addressAlreadyExist = await getAddressByHouseAndSquare({
      house,
      square,
    });

    if (addressAlreadyExist && !!addressAlreadyExist.clientId) {
      return badRequest({ res, message: "Address already exists" });
    }

    if (addressAlreadyExist) {
      req.body.addressId = addressAlreadyExist.id;
      console.log("addressAlreadyExist", req.body);
      return next();
    }

    const address = await createAddress({ house, square });

    if (req.body.next) {
      req.body.addressId = address.id;
      console.log("req.body.next ", req.body);
      return next();
    }

    return createAddressSerializer({ res, address });
  } catch (error) {
    console.error("error creating address = ", error.message);
    return badRequest({ res, message: "Error while creating address" });
  }
};
