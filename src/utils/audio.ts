import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Web Audio API를 활용한 순수 합성 사운드 (외부 mp3 파일 다운로드 불필요)
class AudioManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 세트 완료 찰칵/성공음
  playSuccessSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);

      // 모바일 햅틱 진동
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // 타이머 종료 알림 (딩-동 2회 멜로디)
  playTimerComplete() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const playChime = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.4, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
      };

      playChime(659.25, 0.0, 0.35); // E5
      playChime(523.25, 0.25, 0.45); // C5
      playChime(783.99, 0.6, 0.55); // G5

      // 모바일 진동
      Haptics.notification({ type: NotificationType.Success }).catch(() => {});
    } catch (e) {
      console.warn('Timer sound error', e);
    }
  }
}

export const soundManager = new AudioManager();
