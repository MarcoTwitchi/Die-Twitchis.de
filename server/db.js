const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = 'D:\\Website Erstellen\\Datenbank\\db\\test.db';

// Prüfen, ob Ordner existiert
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
};

// Verbindung zur Datenbank
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('✅ Datenbank verbunden:', dbPath);
    }
});

// Beispiel-Tabellen anlegen
db.serialize(() => {
    
    db.run(`CREATE TABLE IF NOT EXISTS wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      song TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS guestbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        country TEXT,
        visit_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

const db2Path = 'D:\\Website Erstellen\\Datenbank\\db\\music.db';

// Prüfen, ob Ordner existiert
const db2Dir = path.dirname(db2Path);
if (!fs.existsSync(db2Dir)) {
    fs.mkdirSync(db2Dir, { recursive: true });
};

// Verbindung zur Datenbank
const db2 = new sqlite3.Database(db2Path, (err) => {
    if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err.message);
    } else {
        console.log('✅ Datenbank verbunden:', db2Path);
    }
});

// Beispiel-Tabellen anlegen
db2.serialize(() => {
       db2.run(`CREATE TABLE IF NOT EXISTS music (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist TEXT,
  title TEXT,
  album TEXT,
  genre TEXT,
  year TEXT,
  filepath TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL
)`);
});

module.exports = { db, db2 };

