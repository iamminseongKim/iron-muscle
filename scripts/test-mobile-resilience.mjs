import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';

// 1. Verify CSS has iOS zoom prevention and keyboard-aware modal rules
const css = fs.readFileSync('src/index.css', 'utf8');
assert.ok(css.includes('font-size: 16px'), 'Must include 16px font-size to prevent iOS Safari auto-zoom on input focus');
assert.ok(css.includes('.keyboard-aware-modal'), 'Must include .keyboard-aware-modal definition');
assert.ok(css.includes('html[data-keyboard-open="true"]'), 'Must handle data-keyboard-open attribute');

// 2. Verify all relevant modals use keyboard-aware-modal class
const editModal = fs.readFileSync('src/components/history/EditSessionModal.tsx', 'utf8');
assert.ok(editModal.includes('keyboard-aware-modal'), 'EditSessionModal must be keyboard-aware');

const gymModal = fs.readFileSync('src/components/profile/GymEquipmentModal.tsx', 'utf8');
assert.ok(gymModal.includes('keyboard-aware-modal'), 'GymEquipmentModal must be keyboard-aware');

const groupModal = fs.readFileSync('src/components/workout/ExerciseGroupModal.tsx', 'utf8');
assert.ok(groupModal.includes('keyboard-aware-modal'), 'ExerciseGroupModal must be keyboard-aware');

const searchSelect = fs.readFileSync('src/components/workout/SearchableExerciseSelect.tsx', 'utf8');
assert.ok(searchSelect.includes('keyboard-aware-modal'), 'SearchableExerciseSelect must be keyboard-aware');

// 3. Test storage resilience on corrupted data
const routinesBundle = await build({
  entryPoints: ['src/utils/routines.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});

const storage = new Map();
globalThis.localStorage = {
  getItem: k => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k),
};
globalThis.window = { dispatchEvent: () => {} };
globalThis.Event = class {};

const { loadRoutines, saveRoutine } = await import(
  `data:text/javascript;base64,${Buffer.from(routinesBundle.outputFiles[0].text).toString('base64')}`
);

// Corrupted JSON in localStorage must not crash loadRoutines
storage.set('iron_routines_v1', 'INVALID_JSON_%%%');
assert.doesNotThrow(() => {
  const result = loadRoutines();
  assert.deepEqual(result, []);
}, 'loadRoutines must gracefully fallback to empty array on corrupted JSON');

// 4. Test ErrorBoundary module integrity
const errorBoundarySource = fs.readFileSync('src/components/common/ErrorBoundary.tsx', 'utf8');
assert.ok(errorBoundarySource.includes('getDerivedStateFromError'), 'ErrorBoundary must implement getDerivedStateFromError');
assert.ok(errorBoundarySource.includes('componentDidCatch'), 'ErrorBoundary must implement componentDidCatch');
assert.ok(errorBoundarySource.includes('handleExportBackup'), 'ErrorBoundary must provide emergency backup export');
assert.ok(errorBoundarySource.includes('handleClearActiveSession'), 'ErrorBoundary must provide active session reset');

// 5. Verify App.tsx and main.tsx wire ErrorBoundary
const mainSource = fs.readFileSync('src/main.tsx', 'utf8');
assert.ok(mainSource.includes('ErrorBoundary'), 'main.tsx must wrap application in ErrorBoundary');
assert.ok(mainSource.includes('unhandledrejection'), 'main.tsx must catch unhandled rejections');

const appSource = fs.readFileSync('src/App.tsx', 'utf8');
assert.ok(appSource.includes('<ErrorBoundary scoped>'), 'App.tsx must scope-wrap tab views in ErrorBoundary');

console.log('PASS: mobile keyboard UX, iOS auto-zoom prevention, storage corrupt recovery and ErrorBoundary resiliency');
