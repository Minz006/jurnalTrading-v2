import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-trading-pro-minz';

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

  const { action } = req.query;

  try {
    // === PUBLIC ROUTES ===
    
    if (action === 'register' && req.method === 'POST') {
      const { email, password, initialBalance, label } = req.body;
      
      const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const balance = parseFloat(initialBalance) || 0;
      const userLabel = label || 'Trader';

      const result = await sql`
        INSERT INTO users (email, password, initial_balance, label)
        VALUES (${email}, ${hashedPassword}, ${balance}, ${userLabel})
        RETURNING id, email, initial_balance, label;
      `;

      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        token,
        user: { ...user, initialBalance: parseFloat(user.initial_balance), isLoggedIn: true }
      });
    } 
    
    if (action === 'login' && req.method === 'POST') {
      const { email, password } = req.body;
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
          label: user.label || 'Trader',
          isLoggedIn: true
        }
      });
    }

    if (action === 'forgot-password' && req.method === 'POST') {
      const { email } = req.body;
      // Set reset_requested flag to TRUE
      await sql`UPDATE users SET reset_requested = TRUE WHERE email = ${email}`;
      // Always return success to prevent email enumeration, or specific if needed
      return res.status(200).json({ message: 'Permintaan reset telah dikirim ke Admin.' });
    }

    // === PROTECTED ROUTES (Need Token) ===
    if (action === 'delete-account' && req.method === 'DELETE') {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new Error('No token provided');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Delete trades first
        await sql`DELETE FROM trades WHERE user_id = ${decoded.userId}`;
        // Delete user
        await sql`DELETE FROM users WHERE id = ${decoded.userId}`;

        return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Auth Error:', error);
    if (error.message && error.message.includes('does not exist')) {
      return res.status(500).json({ error: 'Database belum disetup.' });
    }
    return res.status(500).json({ error: error.message });
  }
}