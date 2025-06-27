
function uploadFile() {
  const input = document.getElementById("fileInput");
  const file = input.files[0];
  if (!file) {
    alert("Please select a file first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  fetch("https://your-backend-url/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      alert("Upload successful!");
      console.log(data);
    })
    .catch((err) => {
      alert("Upload failed!");
      console.error(err);
    });
}
