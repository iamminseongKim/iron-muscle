# 머신 운동 보강 (2026-09-09)

기존 879종 / 머신 71종에 중복되지 않는 머신 8종을 추가했습니다 (887종 / 머신 79종).
제조사 공식 제품 목록으로 기구의 존재와 명칭을 확인했습니다. 설명과 기본 동작은 직접 요약했으며 제조사 매뉴얼의 번역이나 의료적 효능 보장이 아닙니다. 사진은 무단 복제하지 않았습니다.

- [Hammer Strength 공식 목록](https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded): 벨트 스쿼트, D.Y. 로우
- [글루트 드라이브](https://shop.lifefitness.com/products/hammer-strength-plate-loaded-glute-drive): 힙 쓰러스트 머신
- [로우 로우](https://www.lifefitness.com/en-us/catalog/strength-training/plate-loaded/plate-loaded-iso-lateral-low-row)
- [펜듈럼 스쿼트](https://www.lifefitness.com/es-es/productos/fuerza/plate-loaded/pendulum-x-squat)
- [2025 공식 카탈로그](https://www.lifefitness.com.au/wp-content/uploads/2025/04/LF-HS_ProductCatalogue_2025_low-res.pdf): 풀오버, 시티드 레터럴 레이즈, 닐링 레그 컬

추가 항목의 기본 부하는 확인한 플레이트 제품 기준입니다. 다른 기구에서는 기록 카드의 핀/원판 토글과 브랜드/설정 필드를 사용합니다. 기존 운동 ID는 유지합니다. 추가 데이터는 `src/data/additionalMachines.ts`에서 관리합니다.

## 추가 보강: 여러 제조사와 검색 (2026-09-09)

위의 8종에 이어 10종을 추가해 총 897종, 머신 89종입니다. 기본 브랜드는 확인한 제품 예시이며 기록에서 변경할 수 있습니다. 같은 동작의 브랜드 차이만으로 기존 기록 ID를 바꾸지 않았습니다.

| 추가 운동 | 공식 자료 |
| --- | --- |
| 스탠딩 힙 어브덕션 | [Panatta](https://www.panattasport.com/it/free-weight-special/standing-abductor/) |
| 수평 레그 프레스 | [Panatta](https://www.panattasport.com/it/fit-evo/horizontal-leg-press/) |
| 서큘러 랫 풀다운 | [Panatta](https://www.panattasport.com/en/free-weight-special/super-lat-pulldown-circular) |
| 익스트림 로우 | [PRIME](https://www.primefitnessusa.com/products/plate-loaded-extreme-row) |
| 멀티 힙 익스텐션 | [PRIME](https://www.primefitnessusa.com/products/hybrid-multi-hip) |
| 시티드 레터럴 레이즈 핀머신 | [PRIME](https://www.primefitnessusa.com/products/hybrid-lateral-raise) |
| 스탠딩 체스트 프레스, 인클라인 펙 플라이, 동키 카프 레이즈 머신 | [Gymleco 목록](https://gymleco.com/collections/all) |
| 업라이트 로우 머신 | [Gymleco](https://gymleco.com/products/032-upright-row) |

기존 바이킹 프레스는 [Gymleco](https://gymleco.com/products/038-viking-press), 스탠딩 레터럴 레이즈는 [Arsenal](https://theshop.myarsenalstrength.com/products/m-1-selectorized-standing-lateral-raise)의 공식 자료를 확인하고 별칭 검색을 보강했습니다. 두 기존 ID는 유지합니다. 검색어를 입력하면 부위와 관계없이 검색하며 장비 필터는 유지합니다.

## v3.8.0: 브랜드 없는 종목과 탐색 개선 (2026-09-10)

머신 6종 추가: 전체 903종, 머신 95종. 기존 10종의 기본 브랜드 지정을 제거했습니다.
기존 ID와 검색 별칭은 유지하므로 저장된 기록과 익숙한 검색어는 계속 사용할 수 있습니다.
브랜드는 사용자가 기록에 선택한 값만 사용합니다. 부하 방식은 아래 제품 예시 기준이며 기구별로 변경할 수 있습니다.

| 추가 운동 | 공식 자료 |
| --- | --- |
| 수직 레그 프레스 | [Panatta](https://www.panattasport.com/en/free-weight-special/vertical-leg-press/) |
| 토르소 로테이션 | [Life Fitness](https://www.lifefitness.com/en-gb/catalog/strength-training/selectorized/insignia-series-torso-rotation) |
| 글루트 킥백, 시티드 백 익스텐션 | [Cybex 운동 안내](https://locator.lifefitness.com/virtualcoach/eagle-nx.aspx) |
| 독립 레버 랫 풀다운, 독립 레버 트라이셉스 | [Gymleco 제품 목록: 011, 051](https://gymleco.com/collections/all) |

탐색 화면도 종목 추가 화면과 같은 별칭·띄어쓰기·초성 검색을 사용합니다.
장비 필터만 선택해도 초기화가 가능하고, 빈 결과 안내와 근육 필터 해제 버튼을 제공합니다.

하단 메뉴에 운동 탐색을 연결했습니다. 기존 `Torso_Rotation`은 원본 동작이 공을 들고 하는 회전이므로 이름을 '볼 몸통 회전'으로 바로잡고 코어로 분류했습니다. 새 머신 종목과 구별하며 기존 ID는 보존합니다.
