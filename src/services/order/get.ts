import { Request, Response } from "express";

export const getServiceOrder = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  try {
    return res.send("Send message to get order");
  } catch (error) {
    console.error("Error producing message:", error);
    return res.status(500).send("Internal Server Error");
  }
};
