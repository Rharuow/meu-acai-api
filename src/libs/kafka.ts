import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
  clientId: "meu-açai",
  brokers: ["localhost:9092"],
  logLevel: logLevel.ERROR,
});
