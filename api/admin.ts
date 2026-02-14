import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

// Helper to read admin password safely
const getAdminPassword = () => {
  try {
    const configPath = path.join((process as any).cwd(), 'admin.json');
    const file = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(file);
    return config.password;
  } catch (e) {
    console.error("Could not read admin.json", e);
    return "admin123"; // Fallback if file missing (dev mode)
  }
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;
  const adminPassword = getAdminPassword();

  try {
    // 1. Admin Login
    if (action === 'login' && req.method === 'POST') {
      const { password } = req.body;
      if (password === adminPassword) {
        return res.status(200).json({ success: true, token: 'admin-session-valid' });
      }
      return res.status(401).json({ error: 'Password Admin Salah' });
    }

    // Middleware check for other actions (Simple token check)
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin-session-valid') {
       return res.status(401).json({ error: 'Unauthorized Admin' });
    }

    // 2. Get All Users
    if (req.method === 'GET') {
      const result = await sql`
        SELECT id, email, initial_balance, label, reset_requested, created_at 
        FROM users 
        ORDER BY created_at DESC
      `;
      return res.status(200).json(result.rows);
    }

    // 3. Reset User Password (Confirm Reset)
    if (action === 'reset' && req.method === 'POST') {
      const { userId } = req.body;
      const defaultPassword = '123456'; // Default password after reset
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      await sql`
        UPDATE users 
        SET password = ${hashedPassword}, reset_requested = FALSE 
        WHERE id = ${userId}
      `;
      return res.status(200).json({ message: `Password direset menjadi: ${defaultPassword}` });
    }

    // 4. Delete User (Admin Action)
    if (action === 'delete' && req.method === 'DELETE') {
      const { id } = req.query;
      
      // Delete trades first (Constraints)
      await sql`DELETE FROM trades WHERE user_id = ${id}`;
      // Delete user
      await sql`DELETE FROM users WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'User berhasil dihapus' });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}