import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testFiles = [
  'test-exercise-discovery.mjs',
  'test-regressions.mjs',
  'test-backup.mjs',
  'test-markdown-parser.mjs',
  'test-custom-exercises.mjs',
  'test-quick-sets.mjs',
  'test-workout-card.mjs',
  'test-progression.mjs',
  'test-workout-safety.mjs',
  'test-session-merge.mjs',
  'test-ai-prompts.mjs',
  'test-session-bodyparts.mjs',
  'test-i18n.mjs',
  'test-localized-exports.mjs',
  'test-health.mjs',
  'test-gym-workout.mjs',
  'test-equipment.mjs',
  'test-calendar.mjs',
];

const startTime = Date.now();

function runTest(file) {
  return new Promise((resolvePromise, rejectPromise) => {
    const fullPath = resolve(__dirname, file);
    const proc = spawn(process.execPath, [fullPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => {
      stdout += chunk;
    });

    proc.stderr.on('data', chunk => {
      stderr += chunk;
    });

    proc.on('close', code => {
      if (code === 0) {
        resolvePromise({ file, stdout, stderr, code });
      } else {
        rejectPromise({ file, stdout, stderr, code });
      }
    });

    proc.on('error', err => {
      rejectPromise({ file, stdout, stderr, error: err });
    });
  });
}

console.log(`Starting ${testFiles.length} test suites in parallel...`);

Promise.all(testFiles.map(runTest))
  .then(results => {
    for (const r of results) {
      if (r.stdout.trim()) console.log(r.stdout.trim());
    }
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nALL ${testFiles.length} TEST SUITES PASSED in ${elapsed}s!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`\nTEST FAILED in ${err.file} (code: ${err.code || 'error'})`);
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    if (err.error) console.error(err.error);
    process.exit(err.code || 1);
  });
