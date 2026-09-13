import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

// 1. 개인정보처리방침 파일 존재 및 필수 키워드 검증
const htmlPath = path.join(root, 'public', 'privacy.html');
const mdPath = path.join(root, 'PRIVACY_POLICY.md');

assert(fs.existsSync(htmlPath), 'public/privacy.html 파일이 존재해야 합니다.');
assert(fs.existsSync(mdPath), 'PRIVACY_POLICY.md 파일이 존재해야 합니다.');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const mdContent = fs.readFileSync(mdPath, 'utf8');

for (const [name, content] of [['privacy.html', htmlContent], ['PRIVACY_POLICY.md', mdContent]]) {
  assert(content.includes('Iron Muscle'), `${name}에 서비스명이 포함되어야 합니다.`);
  assert(content.includes('개인정보'), `${name}에 개인정보 관련 내용이 포함되어야 합니다.`);
  assert(content.includes('AdMob'), `${name}에 AdMob 광고 식별자 수집 안내가 포함되어야 합니다.`);
  assert(content.includes('로컬'), `${name}에 로컬 저장소 보관 안내가 포함되어야 합니다.`);
}

// 2. Mock localStorage 환경 구성
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

// 3. UserSettings & AdService 번들링 검증
const storageSource = fs.readFileSync(path.join(root, 'src', 'utils', 'storage.ts'), 'utf8');
assert(storageSource.includes('loadUserSettings'), 'storage.ts에 loadUserSettings가 정의되어야 합니다.');
assert(storageSource.includes('saveUserSettings'), 'storage.ts에 saveUserSettings가 정의되어야 합니다.');
assert(storageSource.includes('isAdFreeUser'), 'storage.ts에 isAdFreeUser가 정의되어야 합니다.');

const adServiceSource = fs.readFileSync(path.join(root, 'src', 'services', 'adService.ts'), 'utf8');
assert(adServiceSource.includes('showInterstitialAd'), 'adService.ts에 showInterstitialAd가 구현되어야 합니다.');
assert(adServiceSource.includes('ca-app-pub-3940256099942544'), 'adService.ts에 구글 공식 테스트 광고 ID가 포함되어야 합니다.');
assert(adServiceSource.includes('isAdFree'), 'adService.ts에 isAdFree 검사 로직이 포함되어야 합니다.');

// 4. WorkoutShareCard 및 WorkoutHistoryView 연동 검증
const shareCardSource = fs.readFileSync(path.join(root, 'src', 'components', 'history', 'WorkoutShareCard.tsx'), 'utf8');
assert(shareCardSource.includes('adService.showInterstitialAd'), 'WorkoutShareCard에서 저장 시 adService.showInterstitialAd가 호출되어야 합니다.');

const historyViewSource = fs.readFileSync(path.join(root, 'src', 'components', 'history', 'WorkoutHistoryView.tsx'), 'utf8');
assert(historyViewSource.includes('adService.showInterstitialAd'), 'WorkoutHistoryView에서 AI 추출 시 adService.showInterstitialAd가 호출되어야 합니다.');

console.log('PASS: Privacy policy files, Ad-Free settings, AdService test IDs, and trigger points verified successfully.');
