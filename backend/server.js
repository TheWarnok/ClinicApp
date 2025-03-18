const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./agendamentos.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite.");
});

db.run(`
  CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL
  )
`);

app.get("/agendamentos", (req, res) => {
  db.all("SELECT * FROM agendamentos", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/agendamentos", (req, res) => {
  const { cliente, data, hora } = req.body;
  if (!cliente || !data || !hora) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const stmt = db.prepare(
    "INSERT INTO agendamentos (cliente, data, hora) VALUES (?, ?, ?)"
  );
  stmt.run(cliente, data, hora, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: "Agendamento criado" });
  });
  stmt.finalize();
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
