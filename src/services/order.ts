import { kafka } from "@libs/kafka";
import { Request, Response } from "express";

export const createServiceOrder = async (req: Request, res: Response) => {
  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: "createServiceOrder",
    messages: [{ value: JSON.stringify(req.body) }],
  });

  await producer.disconnect();

  return res.status(200).send("testServiceOrder");
};
