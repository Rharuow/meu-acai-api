import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "meu-açai",
  brokers: ["localhost:9092"],
});
