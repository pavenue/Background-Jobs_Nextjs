import { Worker } from "bullmq";
import csv from "csv-parser";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const connection = { 
  host: process.env.REDIS_HOST, 
  port: parseInt(process.env.REDIS_PORT, 10) 
};

console.log(" Worker is running and waiting for jobs...");

const worker = new Worker(
  process.env.WORKER_QUEUE_NAME,
  async (job) => {
    const filePath = path.join(process.cwd(), process.env.UPLOAD_DIR, job.data.filename);
    console.log(` Processing CSV file: ${filePath}`);

    const users = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.name && row.email) {
            users.push(row);
          } else {
            console.error(" Invalid row:", row);
          }
        })
        .on("end", async () => {
          console.log(` Parsed ${users.length} users. Sending to API...`);

          for (const user of users) {
            try {
              await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, user);
              console.log(`📤 Sent: ${user.email}`);
            } catch (error) {
              console.error(` Failed to send ${user.email}:`, error.message);
            }
          }

          console.log(" CSV processing complete!");
          resolve();
        })
        .on("error", reject);
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(` Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(` Job failed: ${job.id}`, err);
});
