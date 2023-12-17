import { updateAddress } from "@repositories/user/client";
import { badRequest } from "@serializer/erros/400";
import { updateAddressSerializer } from "@serializer/resources/user/client";
import { Request, Response } from "express";

export const updateAddressController = async (
  req: Request<
    { id: string },
    {},
    { address: { house: string; square: string } },
    qs.ParsedQs
  >,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    const client = await updateAddress({ address, cliendId: id });

    return updateAddressSerializer({ res, user: client });
  } catch (error) {
    console.error("update address error = ", error);
    return badRequest({ res, message: "error updating address = " + error });
  }
};
