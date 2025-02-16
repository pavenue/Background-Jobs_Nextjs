export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const userData = req.body;
    console.log("Received user data:", userData);

    return res.status(200).json({ message: "User processed successfully" });
  } catch (error) {
    console.error("Error processing user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
