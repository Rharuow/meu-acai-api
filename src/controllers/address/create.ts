import {
  createAddressSerializer,
  createManyAddressSerializer,
} from "@serializer/resources/address";
import {
  createAddress,
  createManyAddress,
  getAddressByHouseAndSquare,
} from "@repositories/address";
import { NextFunction, Request, Response } from "express";
import { badRequest } from "@serializer/erros/400";
import { CreateUserRequestBody } from "@/types/user/createRequestbody";
import { CreateAddressRequestBody } from "@/types/address/createRequestBody";
import { unprocessableEntity } from "@serializer/erros/422";

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
      return next();
    }

    const address = await createAddress({ house, square });

    if (req.body.next) {
      req.body.addressId = address.id;
      return next();
    }

    return createAddressSerializer({ res, address });
  } catch (error) {
    return badRequest({ res, message: "Error while creating address" });
  }
};
