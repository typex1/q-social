import express from 'express';
import cors from 'cors';
import { Database } from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { validateMessageContent } from '../../shared/validation/message';
import { logError } from '../../shared/utils/logger';

const app = express();
const db = new Database('./data/messages.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_created_at 
    ON messages(created_at DESC)
  `);
});

const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',') 
  : ['http://localhost:3000', 'https://d3c5n6gwy2qi31.cloudfront.net'];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.post('/api/messages', async (req, res) => {
  try {
    const { content } = req.body;
    
    const validation = validateMessageContent(content);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        code: 'VALIDATION_ERROR'
      });
    }
    
    const message = {
      id: uuidv4(),
      content: content.trim(),
      createdAt: Date.now()
    };
    
    db.run(
      'INSERT INTO messages (id, content, created_at) VALUES (?, ?, ?)',
      [message.id, message.content, message.createdAt],
      (err) => {
        if (err) {
          logError('Database insert error', err);
          return res.status(500).json({
            error: 'Failed to create message',
            code: 'DATABASE_ERROR'
          });
        }
        
        res.status(201).json({ message });
      }
    );
  } catch (error) {
    logError('Server error in POST /api/messages', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    db.all(
      'SELECT id, content, created_at as createdAt FROM messages ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          logError('Database query error', err);
          return res.status(500).json({
            error: 'Failed to retrieve messages',
            code: 'DATABASE_ERROR'
          });
        }
        
        res.json({ messages: rows });
      }
    );
  } catch (error) {
    logError('Server error in GET /api/messages', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});
