const express = require('express');
const router = express.Router();
const db = require('../db');



// Wünsche abrufen
router.get('/', (req, res) => {
  db.all('SELECT * FROM wishes ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Wunsch eintragen
router.post('/', express.json(), (req, res) => {
  const { name, song, message } = req.body;
  if (!name || !song) return res.status(400).send("Name und Song müssen angegeben werden.");

  const sql = 'INSERT INTO wishes (name, song, message) VALUES (?, ?, ?)';
  db.run(sql, [name, song, message], function(err) {
    if (err) return res.status(500).send(err.message);
    res.json({ id: this.lastID });
  });
});

module.exports = router;
