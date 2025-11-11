import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // serve index.html

const sql = neon(process.env.DATABASE_URL);

// Init database otomatis
sql(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE IF NOT EXISTS contents (
    id TEXT PRIMARY KEY,
    chapter INTEGER,
    section TEXT,
    title TEXT,
    description TEXT,
    file_names TEXT[],
    file_types TEXT[],
    file_sizes TEXT[],
    file_contents TEXT[],
    file_datas TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

// API Routes
app.get('/api/students', async (req, res) => {
  const result = await sql(`SELECT * FROM students ORDER BY name`);
  res.json(result);
});

app.post('/api/students', async (req, res) => {
  const { id, name } = req.body;
  await sql(`INSERT INTO students (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [id, name]);
  res.json({ success: true });
});

app.get('/api/contents', async (req, res) => {
  const { chapter, section } = req.query;
  let query = `SELECT * FROM contents WHERE chapter = $1 AND section = $2 ORDER BY created_at DESC`;
  const result = await sql(query, [chapter, section]);
  res.json(result);
});

app.post('/api/contents', async (req, res) => {
  const { id, chapter, section, title, description, fileNames, fileTypes, fileSizes, fileContents, fileDatas } = req.body;
  await sql(`
    INSERT INTO contents (
      id, chapter, section, title, description,
      file_names, file_types, file_sizes, file_contents, file_datas
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `, [id, chapter, section, title, description, fileNames, fileTypes, fileSizes, fileContents, fileDatas]);
  res.json({ success: true });
});

app.delete('/api/contents/:id', async (req, res) => {
  await sql(`DELETE FROM contents WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server jalan di port ${port}`);
});
