export interface UserSettings {
  /** 광고 제거(Ad-Free / Pro) 활성화 여부 */
  isAdFree: boolean;
  /** 광고 제거가 활성화된 일시 (ISO 문자열) */
  adFreeActivatedAt?: string;
  /** 스토어 인앱 결제 영수증 또는 라이선스 키 (추후 확장용) */
  licenseKey?: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  isAdFree: false,
};
