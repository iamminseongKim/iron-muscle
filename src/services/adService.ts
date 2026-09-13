import { isAdFreeUser, saveUserSettings } from '../utils/storage';

/**
 * 구글 공식 테스트 AdMob 광고 단위 ID (Test Ad Unit IDs)
 * ⚠️ 개발 및 테스트 중에는 반드시 이 테스트 ID를 사용해야 계정 정지(Invalid Traffic)를 방지할 수 있습니다.
 */
export const ADMOB_CONFIG = {
  testInterstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  },
  // 추후 구글 애드몹 콘솔에서 발급받은 실제 광고 단위 ID를 입력
  productionInterstitial: {
    android: '',
    ios: '',
  },
};

export type AdPlacement = 'workout_share' | 'ai_markdown';

export interface AdSimulationEventDetail {
  placement: AdPlacement;
  title: string;
  description: string;
  resolve: (proceed: boolean) => void;
}

class AdService {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    // 추후 @capacitor-community/admob 플러그인 설치 시:
    // await AdMob.initialize({ requestTrackingAuthorization: true });
  }

  public isAdFree(): boolean {
    return isAdFreeUser();
  }

  public setAdFree(enabled: boolean): void {
    saveUserSettings({
      isAdFree: enabled,
      adFreeActivatedAt: enabled ? new Date().toISOString() : undefined,
    });
  }

  /**
   * 전면 광고 1회 노출 요청
   * - 광고 없는 버전(Ad-Free)인 경우: 즉시 true 반환 (광고 건너뜀)
   * - 일반 버전: 네이티브 AdMob 호출 또는 시뮬레이션 광고 모달 표시 후 true 반환
   */
  public async showInterstitialAd(placement: AdPlacement): Promise<boolean> {
    // 1. 광고 제거(Ad-Free) 사용자는 지연 없이 즉시 통과
    if (this.isAdFree()) {
      return true;
    }

    // 2. 브라우저/개발 환경 또는 네이티브 플러그인 연동 전: 시뮬레이션 모달 표시
    return new Promise<boolean>((resolve) => {
      const placementName = placement === 'workout_share' ? '운동 인증 카드 저장' : 'AI 분석용 마크다운 추출';
      const event = new CustomEvent<AdSimulationEventDetail>('iron_show_ad_simulation', {
        detail: {
          placement,
          title: `광고 미리보기 (${placementName})`,
          description: '실제 출시 시 Google AdMob 전면 광고가 1회 노출되는 지점입니다. (Ad-Free 활성화 시 노출 생략)',
          resolve,
        },
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(event);
      } else {
        resolve(true);
      }
    });
  }
}

export const adService = new AdService();
