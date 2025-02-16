import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);

  async function uploadCSV(event) {
    event.preventDefault();

    if (!file) {
      alert("Please select a file");
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
      console.log("Success:", result);
      alert(result.message);
    } catch (error) {
      console.error("Upload Error:", error.message);
      alert(`Error: ${error.message}`);
    }
  }

  return (
    <div>
      <h2>CSV Upload and Background Processing</h2>
      <form onSubmit={uploadCSV}>
        <input
          type="file"
          id="csvfile"
          name="csvfile"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Upload CSV</button>
      </form>
    </div>
  );
}
