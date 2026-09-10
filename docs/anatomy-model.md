# 통합 3D 해부도 (v3.9.0)

전면·후면·양쪽 보기는 동일한 GLB 모델을 다른 카메라로 렌더링한다. 기존 평면 PNG를 3D로 변환한 것이 아니며, 근육 결이나 외형이 기존 일러스트와 같다고 주장하지 않는다.

## 자산

- 배포 원본: https://github.com/JohanBellander/BodyExplorer/tree/7d04bf3c4de2bd9cb234dd51d7e6857c099afafd/public
- anatomy.glb (25,133,568 bytes), skeleton.glb (9,831,304 bytes), mesh_mapping.json
- BodyParts3D / DBCLS: CC BY-SA 2.1 Japan; Z-Anatomy / Gauthier Kervyn and contributors: CC BY-SA 4.0.
- 원본 라이선스는 각 출처의 모델에 계속 적용된다. 출처별 구분은 mesh_mapping.json에 보존했다. 앱 MIT 라이선스로 재허가하지 않는다.
- 앱 내 출처 링크: public/anatomy/NOTICE.html. 모든 모델은 앱 패키지에 포함되며 실행 시 외부 CDN에 의존하지 않는다.

## 처리 및 한계

GLTFLoader로 로딩 후 원본 Z-up 좌표를 Y-up으로 정규화한다. 원본 근육 이름을 앱의 운동 부위에 연결하고 그룹별 geometry를 합쳐 draw call을 줄인다. 출처의 모델 변환 과정은 고정 버전 저장소 raw_models 디렉터리에 공개되어 있다.

근육별 구분과 색상은 운동 부위 안내용이다. 심부 근육은 표면에서 가려질 수 있다. 척추기립근을 볼 수 있도록 흉요근막의 넓은 막은 표시에서 제외한다. 피부나 머리카락을 복원하지 않는다. 일반 가슴 운동은 쇄골부 대흉근도 함께 표시한다. 전면·후면에서 선택은 동일한 부위 키를 사용한다.

초기 로딩·실패·재시도 상태를 제공하며, 실패 시 예전의 다른 모형으로 몰래 전환하지 않는다. 화면 밖 또는 백그라운드에서는 렌더를 건너뛴다. 렌더러·geometry·material·이벤트·비동기 완료 후 자산은 화면 종료 시 정리한다.
