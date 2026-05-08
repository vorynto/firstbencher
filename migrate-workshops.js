const { Client } = require('pg');

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log("Connected to PostgreSQL");

        const query = `
        CREATE TABLE IF NOT EXISTS workshops (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          short_description TEXT,
          workshop_date TIMESTAMP WITH TIME ZONE NOT NULL,
          duration TEXT,
          location TEXT,
          image_url TEXT,
          category TEXT,
          active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist so this is idempotent
        DROP POLICY IF EXISTS "Public read: workshops" ON workshops;
        DROP POLICY IF EXISTS "Admin full: workshops" ON workshops;

        CREATE POLICY "Public read: workshops" ON workshops FOR SELECT USING (active = true);
        CREATE POLICY "Admin full: workshops" ON workshops FOR ALL USING (is_admin()) WITH CHECK (is_admin());
        `;

        await client.query(query);
        console.log("Migration for workshops table ran successfully");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

migrate();
