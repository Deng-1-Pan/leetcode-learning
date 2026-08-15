import { access, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const rootFlag = process.argv.indexOf('--root');
const root = rootFlag >= 0 ? resolve(process.argv[rootFlag + 1]) : resolve(import.meta.dirname, '..');
const problemsDirectory = join(root, 'problems');
const requiredFields = ['id', 'title', 'difficulty', 'tags', 'vizType', 'leetcodeUrl', 'languages'];

async function isDirectory(path) { try { await access(path, constants.R_OK); return true; } catch { return false; } }
async function readMeta(path) {
  let meta;
  try { meta = JSON.parse(await readFile(path, 'utf8')); } catch (error) { throw new Error(`Invalid meta.json at ${path}: ${error.message}`); }
  for (const field of requiredFields) if (meta[field] === undefined) throw new Error(`Missing ${field} in ${path}`);
  if (!Array.isArray(meta.tags) || !Array.isArray(meta.languages)) throw new Error(`tags and languages must be arrays in ${path}`);
  return meta;
}

const entries = await readdir(problemsDirectory, { withFileTypes: true });
const problems = [];
for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
  const metaPath = join(problemsDirectory, entry.name, 'meta.json');
  if (!await isDirectory(dirname(metaPath))) continue;
  problems.push(await readMeta(metaPath));
}
problems.sort((a, b) => a.title.localeCompare(b.title, 'en'));
const output = `${JSON.stringify(problems, null, 2)}\n`;
const destination = join(root, 'problems-index.json');
await mkdir(dirname(destination), { recursive: true });
const temporary = `${destination}.tmp`;
await writeFile(temporary, output, 'utf8');
await rename(temporary, destination);
process.stdout.write(`Generated ${problems.length} problem(s) at ${destination}\n`);
