import { access, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { supportedVizTypes } from '../engine/viz-registry.js';

const rootFlag = process.argv.indexOf('--root');
const root = rootFlag >= 0 ? resolve(process.argv[rootFlag + 1]) : resolve(import.meta.dirname, '..');
const problemsDirectory = join(root, 'problems');
const sharedRequiredFields = ['id', 'title', 'difficulty', 'tags', 'leetcodeUrl'];
const legacyRequiredFields = ['vizType', 'languages'];
const approachRequiredFields = ['id', 'label', 'sourceType', 'vizType', 'languages', 'code'];

async function isDirectory(path) { try { await access(path, constants.R_OK); return true; } catch { return false; } }
async function readMeta(path) {
  let meta;
  try { meta = JSON.parse(await readFile(path, 'utf8')); } catch (error) { throw new Error(`Invalid meta.json at ${path}: ${error.message}`); }
  for (const field of sharedRequiredFields) if (meta[field] === undefined) throw new Error(`Missing ${field} in ${path}`);
  if (!Array.isArray(meta.tags)) throw new Error(`tags must be an array in ${path}`);
  if (meta.approaches !== undefined) {
    if (!Array.isArray(meta.approaches) || meta.approaches.length === 0) throw new Error(`approaches must be a non-empty array in ${path}`);
    const ids = new Set();
    for (const approach of meta.approaches) {
      for (const field of approachRequiredFields) if (approach?.[field] === undefined) throw new Error(`Missing approach.${field} in ${path}`);
      if (ids.has(approach.id)) throw new Error(`Duplicate approach id ${approach.id} in ${path}`);
      ids.add(approach.id);
      if (!['official', 'community', 'debug'].includes(approach.sourceType)) throw new Error(`Unsupported approach sourceType ${approach.sourceType} in ${path}`);
      if (!supportedVizTypes.includes(approach.vizType)) throw new Error(`Unsupported approach vizType ${approach.vizType} in ${path}`);
      if (!Array.isArray(approach.languages) || !approach.code || typeof approach.code !== 'object') throw new Error(`approach.languages and approach.code must be valid in ${path}`);
    }
  } else {
    for (const field of legacyRequiredFields) if (meta[field] === undefined) throw new Error(`Missing ${field} in ${path}`);
    if (!Array.isArray(meta.languages)) throw new Error(`languages must be an array in ${path}`);
    if (!supportedVizTypes.includes(meta.vizType)) throw new Error(`Unsupported vizType ${meta.vizType} in ${path}`);
  }
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
