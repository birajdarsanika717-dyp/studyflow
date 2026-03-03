import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("studyflow.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    type TEXT, -- 'flashcards', 'quiz', 'test'
    data TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES study_sessions(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/sessions", (req, res) => {
    const sessions = db.prepare("SELECT * FROM study_sessions ORDER BY created_at DESC").all();
    res.json(sessions);
  });

  app.post("/api/sessions", (req, res) => {
    const { id, title, content } = req.body;
    db.prepare("INSERT INTO study_sessions (id, title, content) VALUES (?, ?, ?)").run(id, title, content);
    res.json({ success: true });
  });

  app.get("/api/sessions/:id/materials", (req, res) => {
    const materials = db.prepare("SELECT * FROM study_materials WHERE session_id = ?").all(req.params.id);
    res.json(materials);
  });

  app.post("/api/materials", (req, res) => {
    const { id, session_id, type, data } = req.body;
    db.prepare("INSERT INTO study_materials (id, session_id, type, data) VALUES (?, ?, ?, ?)").run(id, session_id, type, JSON.stringify(data));
    res.json({ success: true });
  });

  app.delete("/api/sessions/:id", (req, res) => {
    db.prepare("DELETE FROM study_materials WHERE session_id = ?").run(req.params.id);
    db.prepare("DELETE FROM study_sessions WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
