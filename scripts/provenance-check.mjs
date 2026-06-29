import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const names = Object.keys(deps).sort();
const twoYearsAgo = Date.now() - 1000 * 60 * 60 * 24 * 730;

const results = [];
let flagged = 0;

for (const name of names) {
  const entry = { name, exists: false, latestVersion: null, versionCount: 0, maintainerCount: 0, repository: false, lastPublished: null, verdict: 'flag', flags: [] };

  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);
    if (!res.ok) {
      entry.flags.push(`registry returned ${res.status}`);
      results.push(entry);
      flagged++;
      continue;
    }
    const data = await res.json();
    entry.exists = true;
    entry.latestVersion = data['dist-tags']?.latest ?? null;
    entry.versionCount = data.versions ? Object.keys(data.versions).length : 0;
    entry.maintainerCount = data.maintainers ? data.maintainers.length : 0;
    entry.repository = Boolean(data.repository?.url || data.repository);
    const times = data.time ? Object.entries(data.time).filter(([k]) => k !== 'created' && k !== 'modified') : [];
    if (times.length > 0) {
      times.sort((a, b) => new Date(a[1]) - new Date(b[1]));
      const latestTime = data.time[entry.latestVersion];
      entry.lastPublished = latestTime ?? times[times.length - 1][1];
    }

    if (entry.versionCount === 0) entry.flags.push('no published versions');
    if (entry.maintainerCount === 0) entry.flags.push('no maintainers');
    if (!entry.repository) entry.flags.push('no repository link');
    if (entry.lastPublished) {
      const pubDate = new Date(entry.lastPublished).getTime();
      if (pubDate < twoYearsAgo) entry.flags.push('not published in last 2 years (abandoned)');
    }

    entry.verdict = entry.flags.length === 0 ? 'pass' : 'flag';
    if (entry.verdict === 'flag') flagged++;
  } catch (err) {
    entry.flags.push(`fetch error: ${err.message}`);
    flagged++;
  }
  results.push(entry);
}

const report = {
  scannedAt: new Date().toISOString(),
  total: names.length,
  flagged,
  packages: results,
};

console.log(JSON.stringify(report, null, 2));

if (flagged > 0) {
  console.error(`\n${flagged}/${names.length} dependencies flagged — investigate before merging.`);
  process.exit(1);
}