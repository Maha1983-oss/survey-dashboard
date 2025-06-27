import React, { useState } from "react";
import UploadCard from "./components/UploadCard";
import DataPreview from "./components/DataPreview";

export default function App() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");

  const handleUpload = async (file) => {
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/survey/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setData(result.data);
        setStatus("Upload successful ✅");
      } else {
        setStatus(result.error || "Upload failed ❌");
      }
    } catch (err) {
      setStatus("Network error ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📊 Survey Dashboard</h1>
      <UploadCard onUpload={handleUpload} status={status} />
      {data && <DataPreview data={data} />}
    </div>
  );
}
