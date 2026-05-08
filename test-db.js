const { Client } = require("pg");

async function test() {
  const client = new Client({
    connectionString:
      "postgresql://postgres:iwG17MfkyVh1ZV1NPcDm09sE7kmFBAyO@db.firstbencher.com:5432/postgres",
  });
  try {
    await client.connect();
    console.log("Connected to db.firstbencher.com");
    await client.end();
  } catch (e) {
    console.error(e);
  }
}
test();
