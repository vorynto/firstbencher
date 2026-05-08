const { Client } = require("pg");
const crypto = require("crypto");

async function migrateEventsSlug() {
  const client = new Client({
    connectionString:
      "postgresql://postgres:iwG17MfkyVh1ZV1NPcDm09sE7kmFBAyO@db.firstbencher.com:5432/postgres",
  });
  try {
    await client.connect();

    // Add slug column safely
    await client.query(`
            ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
        `);
    console.log("Added slug column to events");

    // Backfill slug for existing events
    const res = await client.query(
      "SELECT id, title FROM events WHERE slug IS NULL",
    );
    for (const row of res.rows) {
      let slug = row.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!slug) slug = "workshop-" + crypto.randomBytes(4).toString("hex");

      // simple check for uniqueness collision just in case (we might just append id if needed)
      await client.query("UPDATE events SET slug = $1 WHERE id = $2", [
        slug,
        row.id,
      ]);
    }
    console.log("Backfilled slugs for existing events");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    await client.end();
  }
}
migrateEventsSlug();
