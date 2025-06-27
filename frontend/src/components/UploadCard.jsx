import React, { useRef } from "react";

export default function UploadCard({ onUpload, status }) {
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Excel File
      </label>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        ref={fileRef}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-50 file:text-indigo-700
                   hover:file:bg-indigo-100"
      />
      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
