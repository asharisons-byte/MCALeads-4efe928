import { db } from './src/db/index.js';
import { leads } from './src/db/schema.js';
import { sql, desc } from 'drizzle-orm';

async function test() {
  try {
    let query = db.select().from(leads);
    query = query.where(sql`${leads.deletedAt} IS NULL`);
    const rows = await query.orderBy(desc(leads.createdAt)).limit(1);
    console.log('Success:', rows);
  } catch (err) {
    console.error('Failure:', err);
  }
}
test();
