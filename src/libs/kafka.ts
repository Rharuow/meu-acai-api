import { Kafka, logLevel } from "kafkajs";

export const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"],
  logLevel: logLevel.ERROR,
});
