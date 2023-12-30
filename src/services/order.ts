import { kafka } from "@libs/kafka";
import { Request, Response } from "express";

export const createServiceOrder = async (req: Request, res: Response) => {
  const producer = kafka.producer();

  await producer.connect();
  await producer.send({
    topic: "createServiceOrder",
    messages: [{ value: "TESTING CREATE SERVICE ORDER MESSAGE" }],
  });

  await producer.disconnect();

  return res.status(200).send("testServiceOrder");
};
