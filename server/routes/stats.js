const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
    const ip = req.ip;
    const country = "Unknown"; // später API-Abfrage ergänzen

    const sql = 'INSERT INTO stats (ip, country) VALUES (?, ?)';
    db.run(sql, [ip, country], function(err) {
        if (err) return res.status(500).send(err.message);
        res.json({ id: this.lastID });
    });
});

router.get('/', (req, res) => {
    db.all('SELECT * FROM stats ORDER BY visit_time DESC LIMIT 20', [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

module.exports = router;
