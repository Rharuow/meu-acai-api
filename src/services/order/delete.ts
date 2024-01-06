import { kafka } from "@libs/kafka";
import { KafkaJSConnectionError } from "kafkajs";
import { NextFunction, Request, Response } from "express";
import { ResponseKafka } from "@/types/services/response";

const producer = kafka.producer({ allowAutoTopicCreation: true });
const consumer = kafka.consumer({ groupId: "deleteOrder" });

export const producerDeleteServiceOrder = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    await producer.connect();
    await producer.send({
      topic: "deletingOrder",
      messages: [{ value: req.params.id }],
    });

    await producer.disconnect();
    return next();
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

export const consumerDeleteServiceOrder = async (
  req: Request,
  res: Response
) => {
  let response: ResponseKafka;
  await consumer.connect();
  await consumer.subscribe({ topic: "deletedOrder" });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        response = JSON.parse(String(message.value));
      } catch (error) {
        console.error("Error processing message:", error);
        // Optionally handle the error, e.g., log it or take necessary actions
        throw new Error("Error processing message:" + error);
      }
    },
  });

  if (response)
    return res.status(response.status).json({
      message: response.message,
      ...(response.data && { data: response.data }),
    });

  return res
    .status(500)
    .json({ message: "Some error in consumer the create service order" });
};
