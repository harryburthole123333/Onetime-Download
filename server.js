// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const app = express();
const PORT = 3000;

const SELLER_KEY = "6adc373edb18eae817c7c38177ed3deb";
const FILE_PATH = path.join(__dirname, "files", "FullBright.zip");
const DOWNLOAD_LOG = path.join(__dirname, "downloadedKeys.json");

let downloadedKeys = [];
if (fs.existsSync(DOWNLOAD_LOG)) {
  downloadedKeys = JSON.parse(fs.readFileSync(DOWNLOAD_LOG));
}

app.use(express.static("public"));
app.use(express.json());

app.post("/download", async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Key is required" });

  if (downloadedKeys.includes(key)) {
    return res.status(403).json({ error: "This key has already been used." });
  }

  try {
    const checkRes = await axios.get(
      `https://keyauth.win/api/seller/?sellerkey=${SELLER_KEY}&type=verify&key=${key}`
    );

    if (!checkRes.data.success) {
      return res.status(401).json({ error: "Invalid or expired key." });
    }

    downloadedKeys.push(key);
    fs.writeFileSync(DOWNLOAD_LOG, JSON.stringify(downloadedKeys));

    res.download(FILE_PATH, "FullBright.zip");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "KeyAuth verification failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
