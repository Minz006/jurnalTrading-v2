import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Create Users Table with label column
    // Note: If table exists, this won't add the column automatically in SQL.
    // In a real migration, we would use ALTER TABLE.
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
        label VARCHAR(50) DEFAULT 'Trader',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Try to add column if it doesn't exist (Simple migration attempt for existing DBs)
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS label VARCHAR(50) DEFAULT 'Trader';`;
    } catch (e) {
      // Ignore if column exists or not supported in specific version
      console.log('Column migration check skipped or failed', e);
    }

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