import React from "react";

export default function DataPreview({ data }) {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4">Parsed Data</h2>
      <table className="min-w-full text-sm text-left border border-gray-200">
        <thead className="bg-gray-100 border-b">
          <tr>
            {Object.keys(data[0] || {}).map((key) => (
              <th key={key} className="px-4 py-2">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b">
              {Object.values(row).map((val, j) => (
                <td key={j} className="px-4 py-2">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
