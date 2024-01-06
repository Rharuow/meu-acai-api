import { Request, Response } from "express";

export const producerCreateServiceOrder = async (
  req: Request,
  res: Response
) => {
  try {
    return res.status(204).send("Sent message to order service");
  } catch (error) {
    console.error("Error producing message:", error);
    return res.status(500).send("Internal Server Error");
  }
};
