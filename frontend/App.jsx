
import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    alert("File selected: " + file.name);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Survey Dashboard</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Upload</button>
    </div>
  );
}

export default App;
