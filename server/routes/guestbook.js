const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔒 einfache Wortprüfung
const badWords = ["idiot", "spam", "werbung", "beleidigung"];

function containsBadWord(text) {
    return badWords.some(word => text.toLowerCase().includes(word));
}

router.get('/', (req, res) => {
    db.all('SELECT * FROM guestbook ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

router.post('/', express.json(), (req, res) => {
    const { name, message } = req.body;

    if (containsBadWord(message)) {
        return res.status(400).send("Dein Eintrag enthält unzulässige Wörter!");
    }

    const sql = 'INSERT INTO guestbook (name, message) VALUES (?, ?)';
    db.run(sql, [name, message], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
});

module.exports = router;
