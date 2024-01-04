import { kafka } from "@libs/kafka";
import { KafkaJSConnectionError } from "kafkajs";
import { Request, Response } from "express";
import { ResponseKafka } from "@/types/services/response";

const producer = kafka.producer({ allowAutoTopicCreation: true });
const consumer = kafka.consumer({ groupId: "deleteServiceOrderResponse" });

export const deleteServiceOrder = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response
) => {
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({
      topic: "responseDeleteOrder",
      fromBeginning: true,
    });

    let response: ResponseKafka;

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

    await producer.send({
      topic: "deleteServiceOrder",
      messages: [{ value: req.params.id }],
    });

    await producer.disconnect();

    return res
      .status(response.status || 204)
      .json({ message: response.message });
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
