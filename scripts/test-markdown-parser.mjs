import assert from 'node:assert/strict';
import { build } from 'esbuild';

// Bundle backup.ts which imports markdownParser.ts
const res = await build({
  entryPoints: ['src/utils/backup.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node'
});
const api = await import(`data:text/javascript;base64,${Buffer.from(res.outputFiles[0].text).toString('base64')}`);

const memory = new Map();
globalThis.localStorage = {
  getItem: k => memory.get(k) ?? null,
  setItem: (k, v) => memory.set(k, v),
  removeItem: k => memory.delete(k)
};
globalThis.window = { dispatchEvent: () => {} };
globalThis.CustomEvent = class {};

const userMarkdown = `# 🏋️‍♂️ [Iron Muscle Tracker] 전문 운동 일지 분석 요청서

> **분석 기간**: 2026-09-09 ~ 2026-09-09 (총 1회 세션)
> **총 누적 볼륨**: 13,000 kg | **총 반복수**: 350 회

### ⚠️ 중량 기록 및 장비별 측정 원칙 (AI 코치 필수 준수 사항)
1. **덤벨(Dumbbell) 운동**: 기록된 중량은 **모두 한쪽(편측, Single-Arm/Per-Hand) 무게**입니다. (예: 덤벨 벤치프레스 20kg은 한 손에 20kg씩 양손 총 40kg의 중량을 다룬 것이므로, 볼륨 계산 및 부하 분석 시 편측 기준 특성을 정확히 반영해야 합니다).
2. **스미스머신(Smith Machine) 운동**: 머신 자체의 기본 봉 무게를 **완전 제외한 순수 원판(Plate) 무게만 기록**된 값입니다. (예: 스미스 60kg는 봉 무게를 가산하지 않은 순수 추가 원판 무게 기준입니다).

---

## 📅 세션 1: 2026-09-09 (하체 루틴)
- **소요 시간**: 1분 | **컨디션**: 💪 | **총 볼륨**: 13,000kg | **평균 RPE**: 7.2

### 1. 머신 힙 어덕션 (내전근) [슈퍼세트 A-1] (핀머신 / 투암(양측))
- **기구 브랜드**: 프리모션
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 40kg | 15회 | 60kg | 6 | - | 30초 | 양쪽 | - |
| #2 | 40kg | 15회 | 60kg | 6 | - | 67초 | 양쪽 | - |
| #3 | 40kg | 15회 | 60kg | - | - | 82초 | 양쪽 | - |

### 2. 머신 힙 어브덕션 (외전근) [슈퍼세트 A-2] (핀머신 / 투암(양측))
- **기구 브랜드**: 프리모션
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 40kg | 15회 | 60kg | 6 | - | - | 양쪽 | - |
| #2 | 40kg | 15회 | 60kg | 6 | - | - | 양쪽 | - |
| #3 | 40kg | 15회 | 60kg | 6 | - | - | 양쪽 | - |

### 3. 스미스머신 백스쿼트 [💡 봉 제외 원판만 기록] (machine / 투암(양측))
- **기구 브랜드**: NewTech (뉴텍)
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 0kg | 20회 | 0kg | 6 | 2-0-1s | 68초 | - | - |
| #2 | 40kg | 5회 | 47kg | 6 | 2-0-1s | 70초 | - | - |
| #3 | 60kg | 5회 | 70kg | 7 | 2-0-1s | 121초 | 양쪽 | - |
| #4 | 80kg | 10회 | 107kg | 8.5 | 1-0-1s | 144초 | 양쪽 | - |
| #5 | 80kg | 10회 | 107kg | 9 | 1-0-1s | 94초 | 양쪽 | - |

### 4. 머신 핵 스쿼트 (machine / 투암(양측))
- **기구 브랜드**: 프리모션
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 80kg | 10회 | 107kg | 8 | 2-0-1s | 72초 | - | 브이스쿼트임 |
| #2 | 80kg | 10회 | 107kg | 8 | 2-0-1s | 64초 | 양쪽 | 브이스쿼트임 |
| #3 | 80kg | 10회 | 107kg | 8 | 2-0-1s | 71초 | 양쪽 | 브이스쿼츠임 |

### 5. 레그 익스텐션 (핀머신 / 투암(양측))
- **기구 브랜드**: 신코
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 25kg | 15회 | 38kg | 7 | - | 51초 | - | - |
| #2 | 25kg | 15회 | 38kg | 7 | - | 56초 | - | - |
| #3 | 25kg | 15회 | 38kg | 7 | - | 61초 | 양쪽 | - |
| #4 | 25kg | 15회 | 38kg | 7 | - | 33초 | 양쪽 | - |

### 6. 스미스머신 오버헤드 숄더 프레스 [💡 봉 제외 원판만 기록] (machine / 투암(양측))
- **기구 브랜드**: 포커스
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 0kg | 20회 | 0kg | 6 | - | 32초 | - | 이거 바이킹 프레스임 |
| #2 | 20kg | 10회 | 27kg | 7 | - | 77초 | - | - |
| #3 | 40kg | 10회 | 53kg | 8 | - | 60초 | 양쪽 | - |
| #4 | 60kg | 10회 | 80kg | 9.5 | - | 79초 | 양쪽 | - |

### 7. 사이드 레터럴 레이즈 [💡 한쪽 무게 기준] (핀머신 / 원암(편측))
- **기구 브랜드**: NewTech (뉴텍)
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 40kg | 10회 | 53kg | 8 | - | 36초 | - | 이거 스탠딩 레터럴 레이즈 머신임 |
| #2 | 40kg | 10회 | 53kg | 8 | - | 48초 | - | - |
| #3 | 40kg | 10회 | 53kg | 8 | - | 48초 | 양쪽 | - |
| #4 | 40kg | 10회 | 53kg | 8 | - | 87초 | 양쪽 | - |

### 8. 바벨 업라이트 로우 (barbell / 투암(양측))
| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |
|---|---|---|---|---|---|---|---|---|
| #1 | 20kg | 10회 | 27kg | 7 | - | 49초 | - | - |
| #2 | 20kg | 10회 | 27kg | 7 | - | 62초 | - | - |
| #3 | 20kg | 10회 | 27kg | 7 | - | - | 양쪽 | - |

---
`;

// Parse directly through parseBackup(rawString)
const parsedBackup = api.parseBackup(userMarkdown);
assert.equal(parsedBackup.sessions.length, 1);

// Restore through restoreBackup
const restoreRes = api.restoreBackup(parsedBackup);
assert.equal(restoreRes.added, 1);

const storedSessions = api.createBackup().sessions;
assert.equal(storedSessions.length, 1);
assert.equal(storedSessions[0].date, '2026-09-09');
assert.equal(storedSessions[0].exercises.length, 8);

console.log('PASS: parseBackup and restoreBackup end-to-end test with Markdown workout input!');
