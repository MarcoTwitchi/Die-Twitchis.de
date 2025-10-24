// 1️⃣ Wir laden die Module
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors");
const fs = require('fs');



// 2️⃣ Server starten
const app = express();
app.use(cors());          
app.use(express.json());  
const PORT = 3000;

const musicDir = "D:\\Datenbank"; 
function getAllFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {      
      getAllFiles(fullPath, fileList); // 🌀 Wenn es ein Ordner ist → weiter rein
    } else {
            if (!stats.isDirectory() && file.toLowerCase().endsWith(".mp3")) { // 🎵 Wenn es eine Datei ist → hinzufügen
  fileList.push(fullPath);}
    }
  });

  return fileList;
}

app.get("/api/list", (req, res) => {
  const files = getAllFiles(musicDir);
  res.json(files);
})


const musicRoutes = require('./routes/music');
app.use('/api/music', musicRoutes);

const wishesRoutes = require('./routes/wishes');
app.use('/api/wishes', wishesRoutes);

const guestbookRoutes = require('./routes/guestbook');
app.use('/api/guestbook', guestbookRoutes);

const statsRoutes = require('./routes/stats');
app.use('/api/stats', statsRoutes);


// 3️⃣ Verbindung zur SQLite-Datenbank herstellen (Datei wird automatisch angelegt)
const db = new sqlite3.Database("..\\Datenbank\\db\\test.db", (err) => {
  if (err) {  const path = require("path");
console.log("📁 Aktuelles Verzeichnis:", __dirname);
    console.error("❌ Fehler beim Öffnen der Datenbank:", err.message);
  } else {
    console.log("✅ Verbindung zur Datenbank hergestellt.");
  }
});

// 4️⃣ Eine einfache Route zum Testen
app.get("/", (req, res) => {
  res.send("Hallo von deinem Node.js-Server! Alles gut bei dir ???");
});

// 5️⃣ Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft mit http://localhost:${PORT}`)

});