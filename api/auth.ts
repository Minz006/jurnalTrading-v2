import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Secret key for JWT (Should be in env vars, but using fallback for demo)
const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-trading-pro-minz';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query; // ?action=login or ?action=register

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password, initialBalance } = req.body;

    if (action === 'register') {
      // Check if user exists
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const balance = parseFloat(initialBalance) || 0;

      const result = await sql`
        INSERT INTO users (email, password, initial_balance)
        VALUES (${email}, ${hashedPassword}, ${balance})
        RETURNING id, email, initial_balance;
      `;

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        token,
        user: {
          email: user.email,
          initialBalance: parseFloat(user.initial_balance),
          isLoggedIn: true
        }
      });
    } 
    
    else if (action === 'login') {
      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'User tidak ditemukan' });
      }

      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ error: 'Password salah' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        token,
        user: {
          email: user.email,
          initialBalance: parseFloat(user.initial_balance),
          isLoggedIn: true
        }
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}