import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Create Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        label VARCHAR(50) DEFAULT 'Trader',
        reset_requested BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Migrations for existing tables
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS label VARCHAR(50) DEFAULT 'Trader';`;
    } catch (e) { console.log('Label column exists/error', e); }

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_requested BOOLEAN DEFAULT FALSE;`;
    } catch (e) { console.log('Reset column exists/error', e); }

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;`;
      // Optional: Set existing users to active to prevent lockout during update
      // await sql`UPDATE users SET is_active = TRUE WHERE is_active IS NULL`;
    } catch (e) { console.log('is_active column exists/error', e); }

    // Create Trades Table
    await sql`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        pair VARCHAR(50) NOT NULL,
        type VARCHAR(10) NOT NULL,
        lot DECIMAL(10, 2) NOT NULL,
        pnl DECIMAL(10, 2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Setup Error:', error);
    return res.status(500).json({ error: error.message });
  }
}