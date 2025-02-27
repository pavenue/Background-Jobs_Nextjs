let parsedData = null; // Temporary storage for parsed data

export default function handler(req, res) {
  if (req.method === "POST") {
    parsedData = req.body;
    return res.status(200).json({ message: "Parsed data stored" });
  } 
  
  if (req.method === "GET") {
    if (!parsedData) {
      return res.status(404).json({ error: "No parsed data available yet" });
    }
    return res.status(200).json(parsedData);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
