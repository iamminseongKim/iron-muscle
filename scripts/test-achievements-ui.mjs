import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const languages = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de'];
const packs = Object.fromEntries(await Promise.all(languages.map(async language => [language, JSON.parse(await readFile(`src/i18n/locales/${language}/ui.json`, 'utf8'))])));
const session = (index, date) => ({
  id: `badge-session-${index}`, title: `Training ${index}`, date,
  startTime: `${date}T10:00:00Z`, endTime: `${date}T11:00:00Z`, durationSeconds: 3600, completed: true, weightUnit: 'kg',
  exercises: ['barbell-squat', 'bench-press', 'deadlift'].map(exerciseId => ({
    id: `${index}-${exerciseId}`, exerciseId, equipmentType: 'barbell', weightUnit: 'kg',
    sets: [{ id: `set-${index}-${exerciseId}`, setNumber: 1, weight: 50 + index, reps: 5, completed: true, setType: 'WORKING' }],
  })),
});
const history = Array.from({ length: 10 }, (_, index) => session(index, `2026-01-${String(index + 5).padStart(2, '0')}`));
await mkdir('output/achievements', { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.emulateTimezone('America/Los_Angeles');
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3021', { waitUntil: 'networkidle2' });
  const clickText = async text => {
    assert.ok(await page.evaluate(text => {
      const node = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && node.textContent.trim() === text);
      node?.click(); return !!node;
    }, text), `Visible button ${text}`);
  };
  const openMy = async () => {
    await page.click('[data-bottom-navigation] button:last-child');
    await page.waitForSelector('[data-achievements]');
  };
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('iron_language', 'ko'); });
  await page.reload({ waitUntil: 'networkidle2' });
  await openMy();
  assert.ok((await page.$eval('[data-achievements]', node => node.textContent)).includes('아직 획득한 배지가 없습니다.'));
  await page.click('[data-badge-open-collection]');
  await page.waitForSelector('dialog[open] [data-badge-collection]');
  await page.click('[data-badge="days-10"]');
  await page.waitForSelector('[data-badge-detail="days-10"]');
  assert.equal(await page.$eval('[data-badge-detail] progress', node => node.value), 0);
  assert.equal(await page.$('[data-badge-detail] time'), null, 'locked badge has no invented acquisition date');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]'));
  assert.ok(await page.$eval('[data-badge-open-collection]', node => node === document.activeElement), 'close restores opener focus');
  await page.evaluate(history => localStorage.setItem('iron_workout_sessions_v1', JSON.stringify(history)), history);
  await page.reload({ waitUntil: 'networkidle2' });
  const rawHistory = await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1'));
  await openMy();
  await page.waitForSelector('[data-badge-level="days-10"]');
  assert.ok((await page.$eval('[data-badge-level]', node => node.textContent)).includes('브론즈'), 'ten workout days reach Bronze');
  assert.ok((await page.$eval('[data-badge-next="days-30"]', node => node.textContent)).includes('실버'), 'Silver is the next level');
  assert.equal(await page.$eval('[data-badge-next] progress', node => node.max), 30);
  assert.equal(await page.$eval('[data-badge-next] progress', node => node.value), 10);
  assert.ok(await page.evaluate(() => {
    const section = document.querySelector('[data-achievements]');
    const language = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === 'ENEnglish');
    return !!(section.compareDocumentPosition(language) & Node.DOCUMENT_POSITION_FOLLOWING);
  }), 'badges precede language settings');
  await page.screenshot({ path: 'output/achievements/my-light.png' });
  await page.click('[data-badge-preview="days-10"]');
  await page.waitForSelector('[data-badge-detail="days-10"]');
  assert.equal(await page.$eval('[data-badge-detail] time', node => node.dateTime), '2026-01-14');
  assert.ok((await page.$eval('[data-badge-detail] time', node => node.textContent)).includes('14'), 'acquisition date must not shift in a negative UTC offset');
  assert.ok((await page.$eval('[data-badge-detail]', node => node.textContent)).includes('Training 9'));
  await page.keyboard.press('Escape');
  await page.click('[data-badge-open-collection]');
  await page.waitForSelector('[data-badge-collection]');
  assert.equal(await page.$$eval('[data-badge-group="workout-days"] [data-badge]', nodes => nodes.length), 7, 'seven workout levels are visible together');
  await page.screenshot({ path: 'output/achievements/collection-light.png' });
  await page.click('[data-badge="big-three"]');
  await page.waitForSelector('[data-badge-detail="big-three"]');
  assert.equal(await page.$$eval('[data-badge-detail] li', nodes => nodes.length), 3);
  assert.equal(await page.$eval('[data-badge-detail] time', node => node.dateTime), '2026-01-06');
  assert.ok((await page.$eval('[data-badge-detail]', node => node.textContent)).includes('51 kg'));
  await page.screenshot({ path: 'output/achievements/detail-light.png' });
  for (const dark of [false, true]) for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), dark);
    assert.ok(await page.evaluate(() => {
      const dialog = document.querySelector('dialog[open]');
      return document.documentElement.scrollWidth <= innerWidth && dialog.scrollWidth <= dialog.clientWidth;
    }), `detail layout ${width} dark=${dark}`);
    if (dark && width === 390) await page.screenshot({ path: 'output/achievements/detail-dark.png' });
  }
  for (let index = 0; index < 15; index++) {
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.querySelector('dialog[open]').contains(document.activeElement) || document.activeElement === document.body), 'native dialog contains keyboard focus');
  }
  await page.keyboard.press('Escape');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  for (const language of languages) {
    const languageLabel = { ko: 'KO한국어', en: 'ENEnglish', ja: 'JA日本語', 'zh-CN': '简简体中文', 'zh-TW': '繁繁體中文', es: 'ESEspañol', fr: 'FRFrançais', de: 'DEDeutsch' }[language];
    await clickText(languageLabel);
    await page.click('[data-badge-open-collection]');
    await page.waitForSelector('dialog[open] [data-badge-collection]');
    let text = await page.$eval('dialog[open]', node => node.textContent);
    assert.ok(text.includes(packs[language]['배지 컬렉션']), `translated collection ${language}`);
    if (language !== 'ko') assert.ok(!/[가-힣]/.test(text), `no Korean in ${language} collection`);
    await page.click('[data-badge="weeks-4"]');
    text = await page.$eval('[data-badge-detail]', node => node.textContent);
    if (language !== 'ko') assert.ok(!/[가-힣]/.test(text), `no Korean in ${language} weekly detail`);
    assert.ok(await page.evaluate(() => document.querySelector('dialog[open]').scrollWidth <= document.querySelector('dialog[open]').clientWidth), `translated layout ${language}`);
    await page.keyboard.press('Escape');
  }
  assert.equal(await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1')), rawHistory, 'browsing badges preserves exact workout storage');
  await clickText('KO한국어');
  await page.evaluate(() => { localStorage.setItem('iron_workout_sessions_v1', '[]'); window.dispatchEvent(new Event('iron_sessions_change')); });
  await page.waitForFunction(() => document.querySelector('[data-achievements]').textContent.includes('아직 획득한 배지가 없습니다.'));
  const backupPath = `${process.cwd()}/output/achievements/restore.json`;
  await writeFile(backupPath, JSON.stringify({ format: 'iron-muscle-backup', version: 1, exportedAt: new Date().toISOString(), sessions: history, customExercises: [], activeSession: null }));
  const fileInput = await page.$('input[type="file"][aria-label="복원할 백업 또는 마크다운 파일"]');
  await fileInput.uploadFile(backupPath);
  await page.waitForFunction(() => [...document.querySelectorAll('button')].some(node => node.textContent.includes('기존 기록과 합치기')));
  await clickText('기존 기록과 합치기 (중복 제외 병합)');
  await page.waitForSelector('[data-badge-preview="days-10"]');
  await page.evaluate(history => {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    localStorage.setItem('iron_active_session_v1', JSON.stringify({ ...history[0], id: 'badge-completion', title: 'Return workout', date, startTime: new Date(Date.now() - 600_000).toISOString(), endTime: undefined, durationSeconds: 600, completed: false }));
  }, history);
  await page.reload({ waitUntil: 'networkidle2' });
  const complete = await page.$('.md\\:hidden [role="button"]');
  assert.ok(complete, 'mobile hold to finish');
  await complete.focus();
  await page.keyboard.down('Space');
  await page.waitForSelector('[data-workout-complete]', { timeout: 8000 });
  await page.keyboard.up('Space');
  await page.waitForSelector('[data-new-achievements]');
  assert.ok(await page.$('[data-new-achievements] [data-badge-preview="comeback"]'), 'celebrate newly earned comeback badge');
  assert.equal(await page.$('[data-new-achievements] [data-badge-preview="first-workout"]'), null, 'do not celebrate historical badge again');
  await page.click('[data-new-achievements] [data-badge-preview="comeback"]');
  await page.waitForSelector('[data-badge-detail="comeback"]');
  assert.ok((await page.$eval('[data-badge-detail]', node => node.textContent)).includes('Return workout'));
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle2' });
  assert.equal(await page.$('[data-new-achievements]'), null, 'no repeated celebration on launch');
  const eliteHistory = Array.from({ length: 365 }, (_, index) => session(index, new Date(Date.UTC(2025, 0, index + 1)).toISOString().slice(0, 10)));
  await page.evaluate(history => {
    localStorage.setItem('iron_workout_sessions_v1', JSON.stringify(history));
    window.dispatchEvent(new Event('iron_sessions_change'));
  }, eliteHistory);
  await openMy();
  await page.waitForSelector('[data-badge-level="days-365"]');
  assert.equal(await page.$('[data-badge-next]'), null, 'Elite has no invented next level');
  assert.ok((await page.$eval('[data-achievements]', node => node.textContent)).includes('최고 단계 달성'));
  await page.click('[data-badge-open-collection]');
  assert.deepEqual(await page.$$eval('[data-badge-group="workout-days"] [data-badge-art]', nodes => nodes.map(node => Number(node.dataset.badgeTier))), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(await page.$$eval('[data-badge-group="workout-days"] [data-badge-art]', nodes => new Set(nodes.map(node => node.style.color)).size), 7, 'each earned workout tier has a distinct palette');
  assert.ok(await page.evaluate(() => {
    const ids = [...document.querySelectorAll('dialog[open] svg [id]')].map(node => node.id);
    return ids.length === new Set(ids).size;
  }), 'badge gradients have unique IDs within the gallery');
  await page.screenshot({ path: 'output/achievements/all-levels-light.png' });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.screenshot({ path: 'output/achievements/all-levels-dark.png' });
  assert.deepEqual(errors, []);
  console.log('PASS seven distinct badge levels and next/maximum progression, empty state, top placement, earned dates and PR evidence, native dialog navigation/focus, 320/390/768px light/dark, eight languages, exact record preservation, live recalculation, actual backup restore, completion-only new badges.');
} finally {
  await browser.close();
}
