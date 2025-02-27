# 📌 Next.js CSV Processing with Redis Queue (Page Router)

A **Next.js** application that allows users to **upload CSV files**, processes them in the **background using Redis queues**, and sends user data to an API endpoint for further processing. The frontend displays **live parsing progress** and shows parsed data after processing.

---

## 📖 Features

✅ **File Upload via Next.js API Route (Page Router) using Multer**  
✅ **Stores CSV files** in `public/uploads/`  
✅ **Adds jobs** to a **Redis queue** for background processing  
✅ **Worker.js** fetches the job and **parses the CSV**  
✅ **Sends each user entry to an API** for further processing  
✅ **Frontend fetches job progress and displays parsed data**  
✅ **Success popup after CSV upload**  
✅ **Fully asynchronous and scalable** with **BullMQ & Redis**

---

## 🏗️ Project Structure

```
nextjs-csv-processing/
│── .next/                     # Next.js build folder
│── node_modules/               # Dependencies
│── public/                     
│   ├── uploads/                # Stores uploaded CSV files
│── pages/
│   ├── api/
│   │   ├── upload.js           # API Route for file upload & adding to queue
│   │   ├── progress.js         # API Route to fetch parsing progress
│   │   ├── users.js            # Mock API endpoint for processing CSV data
│   ├── index.js                # Frontend UI for uploading CSV files
│── lib/
│   ├── queue.js                # Redis queue setup using BullMQ
│── worker.js                    # Background job processor
│── .gitignore                   # Ignore unnecessary files
│── package.json                 # Project dependencies
│── README.md                    # Project documentation
│── next.config.js                # Next.js configuration
```

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/nextjs-csv-processing.git
cd nextjs-csv-processing
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start Redis Server

Make sure you have **Redis** installed & running:

```bash
redis-server
```

### 4️⃣ Start the Next.js App

```bash
npm run dev
```

### 5️⃣ Start the Worker

In a **separate terminal window**, run the worker to process the jobs:

```bash
node worker.js
```

---

## 📂 API Endpoints

| Method   | Endpoint      | Description                        |
| -------- | ------------- | ---------------------------------- |
| **POST** | `/api/upload` | Uploads CSV & adds to Redis Queue  |
| **GET**  | `/api/progress` | Fetches CSV parsing progress |
| **POST** | `/api/users`  | Mock API that receives parsed data |

---

## 📜 Code Breakdown

### 📌 `pages/api/upload.js` (Handles CSV Upload & Adds to Queue)

```javascript
import fs from "fs/promises";
import path from "path";
import { userQueue } from "../../lib/queue";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  upload.single("csvfile")(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "File upload failed" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(uploadDir, req.file.filename);
    await userQueue.add("processCsv", { filePath });
    res.status(200).json({ message: "File uploaded successfully and added to queue." });
  });
}
```

---

### 📌 `pages/api/progress.js` (Fetches Parsing Progress)

```javascript
import { userQueue } from "../../lib/queue";

export default async function handler(req, res) {
  const jobs = await userQueue.getJobs(["completed"]);
  const users = jobs.map(job => job.returnvalue);
  res.json({ users });
}
```

---

### 📌 `worker.js` (Processes CSV File & Sends Data to API)

```javascript
import { Worker } from "bullmq";
import csv from "csv-parser";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const connection = { host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT, 10) };

const worker = new Worker("userQueue", async (job) => {
  const filePath = path.join(process.cwd(), process.env.UPLOAD_DIR, job.data.filename);
  const users = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => users.push(row))
      .on("end", async () => {
        for (const user of users) {
          await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`, user);
        }
        resolve(users);
      })
      .on("error", reject);
  });
}, { connection });
```

---

## 🎯 Conclusion

This project **demonstrates a scalable way to handle CSV uploads in Next.js (Page Router) with Redis Queues**, ensuring smooth background processing while providing **live UI updates**. 🚀

If you have any issues, feel free to ask! 🎉🔥

---

**📌 Enjoy coding!** 🖥️🚀

