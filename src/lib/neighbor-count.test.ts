import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { expect, it } from "vitest";

it("counts hosts plus co-hosts while excluding merged duplicate offers", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TABLE public.host_offers (cohosts jsonb, merged_into uuid);
    `);
    await db.exec(readFileSync("drizzle/migrations/0010_count_host_neighbors.sql", "utf8"));
    const total = async () => (await db.query<{ total: number }>("SELECT public.count_host_neighbors() AS total")).rows[0]?.total;
    expect(await total()).toBe(0);
    await db.exec(`INSERT INTO public.host_offers VALUES ('[]', NULL);`);
    expect(await total()).toBe(1);
    await db.exec(`INSERT INTO public.host_offers VALUES ('[{"name":"Carlye Morley"},{"name":"Ashley Kam"}]', NULL);`);
    expect(await total()).toBe(4);
    await db.exec(`INSERT INTO public.host_offers VALUES ('[{"name":"Duplicate"}]', '00000000-0000-0000-0000-000000000001');`);
    expect(await total()).toBe(4);
  } finally {
    await db.close();
  }
}, 20_000);