"use client";
import "../style/global.css";
import { useState, useEffect } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // ✅ Fetch parsed data only when CSV is uploaded successfully
  async function fetchParsedData() {
    try {
      setIsFetching(true);
      const response = await fetch("/api/progress");
      if (response.ok) {
        const data = await response.json();
        setParsedData(data);
      }
    } catch (error) {
      console.error("❌ Error fetching parsed data:", error);
    } finally {
      setIsFetching(false);
    }
  }

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
      fetchParsedData(); // ✅ Fetch parsed data only after upload success
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
            onChange={(e) => {
              setFile(e.target.files[0]);
              setIsSuccess(false); // ✅ Reset success popup when new file is chosen
              setParsedData(null); // ✅ Reset parsed data for new upload
            }}
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

      {/* ✅ Success Popup */}
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

      {/* ✅ Show Parsed Data After Processing */}
      {parsedData && (
        <div className="bg-white p-6 shadow-md rounded-lg mt-6 w-96">
          <h3 className="text-lg font-bold text-gray-800">📊 Parsed Data:</h3>
          {isFetching ? (
            <p className="text-gray-500">Fetching parsed data...</p>
          ) : (
            <ul className="mt-2">
              {parsedData.users.map((user, index) => (
                <li key={index} className="border-b p-2">
                  {user.name} - {user.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
