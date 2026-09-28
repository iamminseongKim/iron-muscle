import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await page.evaluate(async () => {
    const fixture = await import('/scripts/fixtures/equipment-review.tsx');
    const { saveGymState } = await import('/src/utils/gymStorage.ts');
    saveGymState({
      activeGymId: 'gym-a',
      gyms: [
        { id: 'gym-a', name: 'Gym A', includeFreeWeights: true, machines: {}, updatedAt: '' },
        { id: 'gym-b', name: 'Gym B', includeFreeWeights: true, machines: {}, updatedAt: '' },
      ],
    });
    fixture.quickAddCard();
  });
  await page.waitForSelector('button[title="Gym A"]');
  await page.click('button[title="Gym A"]');
  await page.waitForFunction(() => document.body.textContent.includes('헬스장에 등록됨'));
  const first = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_gym_equipment_profile_v1')));
  const config = first.gyms[0].machines.Machine_Bench_Press;
  assert.equal(config.length, 1);
  assert.equal(config[0].exerciseId, 'Machine_Bench_Press');
  assert.equal(config[0].weightUnit, 'lbs');
  assert.equal(config[0].brand, undefined);
  assert.deepEqual(first.gyms[1].machines, {});
  await page.evaluate(async () => {
    const { switchActiveGym } = await import('/src/utils/gymStorage.ts');
    switchActiveGym('gym-b');
  });
  await page.waitForSelector('button[title="Gym B"]');
  await page.click('button[title="Gym B"]');
  const second = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_gym_equipment_profile_v1')));
  assert.equal(second.gyms[0].machines.Machine_Bench_Press.length, 1);
  assert.equal(second.gyms[1].machines.Machine_Bench_Press.length, 1);
  console.log('PASS quick gym registration, active gym isolation, no duplicate config, no automatic brand');
} finally {
  await browser.close();
}
