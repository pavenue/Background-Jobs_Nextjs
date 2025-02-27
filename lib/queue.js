import { Queue } from "bullmq";

const connection = { host: `${process.env.REDIS_HOST}`, port: `${process.env.REDIS_PORT}` };

export const userQueue = new Queue("userQueue", { connection });

console.log(" Redis Queue Initialized");
