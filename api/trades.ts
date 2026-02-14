import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-trading-pro-minz';

// Middleware to verify token
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('No token provided');
  
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET);
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyToken(req);
    const userId = user.userId;

    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM trades 
        WHERE user_id = ${userId} 
        ORDER BY date DESC
      `;
      // Map DB fields to frontend interface
      const trades = result.rows.map(row => ({
        id: row.id,
        date: row.date,
        pair: row.pair,
        type: row.type,
        lot: parseFloat(row.lot),
        pnl: parseFloat(row.pnl),
        notes: row.notes
      }));
      return res.status(200).json(trades);
    }

    if (req.method === 'POST') {
      const { date, pair, type, lot, pnl, notes } = req.body;
      
      const result = await sql`
        INSERT INTO trades (user_id, date, pair, type, lot, pnl, notes)
        VALUES (${userId}, ${date}, ${pair}, ${type}, ${lot}, ${pnl}, ${notes})
        RETURNING *;
      `;
      
      const row = result.rows[0];
      const newTrade = {
        id: row.id,
        date: row.date,
        pair: row.pair,
        type: row.type,
        lot: parseFloat(row.lot),
        pnl: parseFloat(row.pnl),
        notes: row.notes
      };
      
      return res.status(200).json(newTrade);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM trades WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error(error);
    if (error.message === 'No token provided' || error.name === 'JsonWebTokenError') {
       return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(500).json({ error: error.message });
  }
}