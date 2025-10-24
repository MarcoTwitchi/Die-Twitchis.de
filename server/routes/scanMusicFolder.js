const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db2 = new sqlite3.Database('./database/music.db');

const musicFolder = 'D:\\Datenbank';



function scanDirectory(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDirectory(filePath));
        } else if (file.endsWith('.mp3')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = scanDirectory(musicFolder);
console.log(`Gefundene Dateien: ${files.length}`);

files.forEach(file => {
    const filename = path.basename(file, '.mp3');
    const [artist, title] = filename.split(' - ');
    db2.run('INSERT OR IGNORE INTO music (artist, title, path) VALUES (?, ?, ?)', [artist || '', title || '', file]);
});



console.log('Scan abgeschlossen!');
db2.close();
