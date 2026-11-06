import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { Client } from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const rootEnv = path.join(root, '.env');
const exampleEnv = path.join(root, '.env.example');
const backendEnv = path.join(backend, '.env');
const frontendEnv = path.join(root, 'frontend', '.env.local');

function log(message) { console.log(`\n[SalePro setup] ${message}`); }
function parseEnv(file) {
  const values = {};
  for (const raw of fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}
function runNode(script, args, cwd) {
  // Prisma's Windows query-engine DLL can be briefly held by antivirus/indexing
  // or another Node process. Retry transient EPERM/rename failures before failing.
  const maxAttempts = args[0] === 'generate' ? 4 : 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = spawnSync(process.execPath, [script, ...args], { cwd, stdio: 'inherit', env: process.env });
    if (result.error) throw result.error;
    if (result.status === 0) return;
    if (attempt < maxAttempts) {
      log(`Prisma generation did not complete (attempt ${attempt}/${maxAttempts}); retrying in ${attempt * 2} seconds. Close running Node processes if the DLL is locked...`);
      const waitMs = attempt * 2000;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
      continue;
    }
    throw new Error(`Command failed after ${maxAttempts} attempt(s): ${path.basename(script)} ${args.join(' ')}`);
  }
}

async function ensureDatabase(databaseUrl) {
  const target = new URL(databaseUrl);
  const databaseName = decodeURIComponent(target.pathname.replace(/^\//, ''));
  if (!databaseName || !/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error('DATABASE_URL must contain a simple PostgreSQL database name (letters, numbers, underscores).');
  }
  const admin = new URL(target.toString());
  admin.pathname = '/postgres';
  admin.searchParams.delete('schema');
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const found = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (found.rowCount === 0) {
      log(`Creating PostgreSQL database "${databaseName}"...`);
      await client.query(`CREATE DATABASE "${databaseName.replaceAll('"', '""')}"`);
    } else {
      log(`Database "${databaseName}" already exists; preserving its data.`);
    }
  } finally {
    await client.end();
  }
}

// Existing databases may contain customer data. Never run db push automatically
// against a non-empty database because Prisma can propose destructive table changes.
async function hasExistingPublicTables(databaseUrl) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name <> '_prisma_migrations'
      ) AS has_tables
    `);
    return result.rows[0]?.has_tables === true;
  } finally {
    await client.end();
  }
}

async function main() {
  if (!fs.existsSync(rootEnv)) {
    if (!fs.existsSync(exampleEnv)) throw new Error('Missing .env.example. Cannot create environment configuration.');
    fs.copyFileSync(exampleEnv, rootEnv);
    log('Created root .env from .env.example. Review credentials before production use.');
  }
  if (!fs.existsSync(backendEnv)) {
    fs.copyFileSync(rootEnv, backendEnv);
    log('Created backend/.env from root .env.');
  }
  const rootValues = parseEnv(rootEnv);
  const frontendApi = rootValues.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';
  if (!fs.existsSync(frontendEnv)) {
    fs.writeFileSync(frontendEnv, `NEXT_PUBLIC_API_URL=${frontendApi}\n`, 'utf8');
    log('Created frontend/.env.local with the API URL.');
  }
  const env = { ...process.env, ...parseEnv(rootEnv), ...parseEnv(backendEnv) };
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is missing from .env.');
  process.env.DATABASE_URL = env.DATABASE_URL;
  for (const [key, value] of Object.entries(env)) if (process.env[key] === undefined) process.env[key] = value;

  log('Checking PostgreSQL and creating the application database if needed...');
  await ensureDatabase(env.DATABASE_URL);

  const prismaCli = path.join(root, 'node_modules', 'prisma', 'build', 'index.js');
  const tsxCli = path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  if (!fs.existsSync(prismaCli)) throw new Error('Prisma CLI not found. Run npm run install:all again.');
  if (!fs.existsSync(tsxCli)) throw new Error('tsx not found. Run npm run install:all again.');

  log('Generating Prisma Client...');
  runNode(prismaCli, ['generate'], backend);

  const databaseHasTables = await hasExistingPublicTables(env.DATABASE_URL);
  if (databaseHasTables) {
    log('Existing PostgreSQL tables detected. Skipping automatic prisma db push and demo seeding to protect existing data.');
    log('Your existing warehouses table is mapped by @@map("warehouses"). Review schema changes and run npm run db:push manually only after taking a database backup.');
  } else {
    log('Empty database detected. Creating tables from the Prisma schema...');
    runNode(prismaCli, ['db', 'push'], backend);
    log('Seeding demo roles, companies, users and sample records...');
    runNode(tsxCli, ['prisma/seed.ts'], backend);
  }
  log('Setup complete. Start the application with npm run dev.');
}

main().catch((error) => {
  console.error('\n[SalePro setup] ERROR:', error.message);
  console.error('Check PostgreSQL service, DATABASE_URL, and the error above. Existing database data was not reset.');
  process.exit(1);
});
