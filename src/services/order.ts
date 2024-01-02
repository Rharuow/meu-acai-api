import { kafka } from "@libs/kafka";
import { KafkaJSConnectionError } from "kafkajs";
import { Request, Response } from "express";

const producer = kafka.producer();

export const createServiceOrder = async (req: Request, res: Response) => {
  try {
    await producer.connect();

    await producer.send({
      topic: "createServiceOrder",
      messages: [{ value: JSON.stringify(req.body) }],
    });

    console.log("Message sent successfully");

    await producer.disconnect();

    return res.status(200).send("testServiceOrder");
  } catch (error) {
    console.error("Error producing message:", error);
    if (error instanceof KafkaJSConnectionError) {
      // Handle Kafka errors
      // Handle specific error types as needed
      return res.status(500).send("Kafka Not Connected" + error.message);
      // Handle other Kafka errors or provide a generic response
    } else {
      // Handle other errors or provide a generic response
      return res.status(500).send("Internal Server Error");
    }
  }
};
