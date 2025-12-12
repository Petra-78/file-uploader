export async function postNewFile(req, res) {
  console.log("Uploaded file:", req.file);

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  return res.send("File uploaded successfully");
}
