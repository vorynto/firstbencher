const { Client } = require("pg");

async function migrate() {
  const dbUrl = process.env.DATABASE_URL.replace(
    "127.0.0.1",
    "db.firstbencher.com",
  );
  console.log("Trying:", dbUrl);
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to DB, running migrations...");

    const queries = [
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';`,
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 1) DEFAULT 5.0;`,
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';`,
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]';`,
      `ALTER TABLE courses ADD COLUMN IF NOT EXISTS popular_order INTEGER DEFAULT 0;`,
    ];

    for (const query of queries) {
      console.log("Executing:", query);
      await client.query(query);
    }

    console.log("Migrations applied successfully.");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await client.end();
  }
}

migrate();
