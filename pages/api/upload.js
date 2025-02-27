import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { userQueue } from "../../lib/queue";


dotenv.config();

export const config = {
  api: {
    bodyParser: false, 
  },
};

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR);

async function ensureUploadDir() {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(" Upload directory ensured:", uploadDir);
  } catch (error) {
    console.error(" Error creating upload directory:", error);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await ensureUploadDir();

  upload.single("csvfile")(req, res, async (err) => {
    if (err) {
      console.error(" Multer Error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    if (!req.file) {
      console.error(" No file received.");
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const filePath = path.join(uploadDir, req.file.filename);
      console.log(" File received and saved at:", filePath);

      
      await userQueue.add("processCsv", { filename: req.file.filename });

      res.status(200).json({ message: "File uploaded successfully and added to queue." });
    } catch (error) {
      console.error(" Error processing file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
