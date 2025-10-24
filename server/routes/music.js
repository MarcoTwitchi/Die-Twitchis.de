const express = require('express');
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();
const fs = require("fs");
const path = require('path');
const mm = require("music-metadata");
const { db2 } = require('../db');


// Alle Songs abrufen
router.get('/', (req, res) => {
    db2.all('SELECT * FROM music', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});


//router.post('/', express.json(), (req, res) => {
//    const { artist, title, genre, year } = req.body;
//    const sql = 'INSERT INTO music (artist, title, genre, year) VALUES (?, ?, ?, ?)';
//    db2.run(sql, [artist, title, genre, year], function(err) {
//        if (err) return res.status(500).send(err.message);
//        res.json({ id: this.lastID });
//    });
//});


function getAllFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {      
      getAllFiles(fullPath, fileList); // 🌀 Wenn es ein Ordner ist → weiter rein
    } else  if (!stats.isDirectory() && file.toLowerCase().endsWith(".mp3")) { // 🎵 Wenn es eine Datei ist → hinzufügen
  fileList.push(fullPath);
}
});

  return fileList;
}

async function saveFilesToDatabase(fileList) {
  for (const filePath of fileList) {
    const fileName = path.basename(filePath);

    // Nur MP3-Dateien analysieren
    if (path.extname(filePath).toLowerCase() !== ".mp3") continue;

    try {      // Metadaten auslesen
      const metadata = await mm.parseFile(filePath);
      const common = metadata.common || {};
      const artist = common.artist || "Unbekannt";
      const title = common.title || fileName.replace(".mp3", "");
      const album = common.album || "";
      const genre = Array.isArray(common.genre) ? common.genre.join(", ") : common.genre || "";
      const year = common.year || "";

      // In DB speichern
      db2.run(
        `INSERT OR IGNORE INTO music ( artist, title, album, genre, year, filepath, filename)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ artist, title, album, genre, year, filePath, fileName],
        (err) => {
          if (err) console.error("Fehler beim Einfügen:", err.message);
        }
      );
    } catch (err) {
      console.error(`Fehler beim Lesen der Metadaten von ${filePath}:`, err.message);
    }
  }

  console.log("Dateien wurden inklusive Metadaten in die Datenbank eingetragen.");  
}


function checkDuplicates() {
  db2.all(
    `SELECT filename, COUNT(*) as count FROM music GROUP BY filename HAVING count > 1`,
    (err, rows) => {
      if (err) throw err;
      if (rows.length > 0) {
        console.log("⚠️ Doppelte Dateien gefunden:");
        rows.forEach((row) => console.log(`- ${row.filename} (${row.count}x)`));
      } else {
        console.log("✅ Keine Duplikate gefunden.");
      }
    }
  );
};

// 🔹 Musikdatenbank automatisch beim Start aktualisieren
(async () => {
  const musicDir = "D:\\Datenbank";
  const allFiles = getAllFiles(musicDir);
  await saveFilesToDatabase(allFiles);
  checkDuplicates();
})();

// 🔹 Manuelles Triggern (Browser: http://localhost:3000/api/music/scan)
router.get('/scan', async (req, res) => {
  try {
    const musicDir = "D:\\Datenbank";
    const allFiles = getAllFiles(musicDir);
    await saveFilesToDatabase(allFiles);
    checkDuplicates();
    res.send("✅ Musikdatenbank neu eingelesen!");
  } catch (err) {
    res.status(500).send("❌ Fehler beim Scan: " + err.message);
  }
});

// 🔹 Wunsch prüfen und speichern
router.post('/request', express.json(), (req, res) => {
    const { artist, title } = req.body;
    if (!artist || !title) return res.status(400).send('Artist und Title erforderlich.');

    const sqlCheck = 'SELECT * FROM music WHERE artist LIKE ? AND title LIKE ?';
    db2.get(sqlCheck, [`%${artist}%`, `%${title}%`], (err, row) => {
        if (err) return res.status(500).send(err.message);

        let status = row ? 'found' : 'missing';
        const sqlInsert = 'INSERT INTO requests (artist, title, status, created_at) VALUES (?, ?, ?, datetime("now"))';
        db2.run(sqlInsert, [artist, title, status], function(err) {
            if (err) return res.status(500).send(err.message);
            res.json({ id: this.lastID, status });
        });
    });
});

// 🔹 Offene Wünsche abrufen (für Java oder Adminseite)
router.get('/requests', (req, res) => {
    db2.all('SELECT * FROM requests ORDER BY created_at DESC LIMIT 50', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

module.exports = router;


