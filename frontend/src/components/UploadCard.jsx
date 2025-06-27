import React, { useState } from 'react'
import axios from 'axios'

const UploadCard = () => {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleChange = (e) => {
    setFile(e.target.files[0])
    setStatus('')
  }

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post('https://your-backend-url/upload', formData)
      setStatus('✅ File uploaded successfully')
    } catch (err) {
      console.error(err)
      setStatus('❌ Upload failed')
    }
  }

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{status}</p>
    </div>
  )
}

export default UploadCard