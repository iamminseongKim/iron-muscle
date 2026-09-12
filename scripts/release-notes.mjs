import fs from 'node:fs';
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const tag = process.argv[2] || `v${version}`;
if (tag.startsWith('v') && tag !== `v${version}`) throw new Error('Release tag must match package version');
const updates = fs.readFileSync(`releases/${version}.md`, 'utf8').trim();
if (!updates.includes('최신 업데이트 핵심 요약')) throw new Error('Version-specific update summary required');
fs.writeFileSync('release-notes.md', `# Iron Muscle Tracker ${tag}\n\n${updates}\n\n### 설치 파일\n\n- Android: 아래 Assets의 IronMuscle-${tag}.apk를 내려받아 설치하세요.\n- iOS: IronMuscle-iOS.ipa는 서명되지 않은 사이드로딩용 파일입니다.\n\n운동 기록은 기기 내부에 저장됩니다.\n`);
