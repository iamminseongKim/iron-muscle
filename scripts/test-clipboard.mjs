import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundle = await build({ entryPoints: ['src/utils/clipboard.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { copyText } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
let nativeText = '', fieldCount = 0, focusRestored = 0, fallback = false;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard: { writeText: async text => { nativeText = text; } } } });
globalThis.document = {
  activeElement: { focus() { focusRestored++; } },
  createElement: () => ({ value: '', style: {}, setAttribute() {}, focus() {}, select() {}, setSelectionRange() {}, remove() { fieldCount--; } }),
  body: { appendChild() { fieldCount++; } },
  execCommand: () => fallback,
};
assert.equal(await copyText('workout'), true);
assert.equal(nativeText, 'workout');
assert.equal(fieldCount, 0);
navigator.clipboard.writeText = async () => { throw Error('permission denied'); };
assert.equal(await copyText('manual'), false);
assert.equal(fieldCount, 0);
assert.equal(focusRestored, 1);
fallback = true;
assert.equal(await copyText('legacy'), true);
document.execCommand = () => { throw Error('unsupported'); };
assert.equal(await copyText('blocked'), false);
assert.equal(fieldCount, 0);
assert.equal(focusRestored, 3);
console.log('PASS clipboard native success, denied permission, false/throw fallback, cleanup and focus restoration');
