"use client";
import "../style/global.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  // ✅ Fetch parsed data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/progress");
        if (response.ok) {
          const data = await response.json();
          setParsedData(data);
        }
      } catch (error) {
        console.error("❌ Error fetching parsed data:", error);
      }
    }, 5000); // ✅ Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  async function uploadCSV(event) {
    event.preventDefault();

    if (!file) {
      alert("❌ Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Success:", result);
      setIsSuccess(true);
    } catch (error) {
      console.error("❌ Upload Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
          Upload CSV File
        </h2>
        <form onSubmit={uploadCSV} className="flex flex-col gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded-lg p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Upload
          </button>
        </form>
      </div>

      {isSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-green-600">✅ Success!</h3>
            <p className="text-gray-600">Your CSV file has been uploaded successfully.</p>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Show parsed data after processing */}
      {parsedData && (
        <div className="bg-white p-6 shadow-md rounded-lg mt-6 w-96">
          <h3 className="text-lg font-bold text-gray-800">📊 Parsed Data:</h3>
          <ul className="mt-2">
            {parsedData.users.map((user, index) => (
              <li key={index} className="border-b p-2">
                {user.name} - {user.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
