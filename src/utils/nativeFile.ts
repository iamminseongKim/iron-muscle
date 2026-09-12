import { Capacitor, registerPlugin } from '@capacitor/core';

export const nativeBackup = registerPlugin<{
  save(options: { filename: string; data: string; mimeType?: string; encoding?: 'base64' }): Promise<{ cancelled: boolean }>;
}>('WorkoutBackup');

export async function saveFileToDevice(
  filename: string,
  content: string,
  mimeType: string = 'text/markdown'
): Promise<{
  success: boolean;
  cancelled?: boolean;
  message?: string;
}> {
  // 1. Android Capacitor 네이티브 파일 저장 (SAF: Storage Access Framework)
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const result = await nativeBackup.save({
        filename,
        data: content,
        mimeType: filename.endsWith('.md') ? 'text/*' : mimeType,
      });
      if (result.cancelled) {
        return { success: false, cancelled: true, message: '저장을 취소했습니다.' };
      }
      return { success: true, message: `[${filename}] 파일이 기기에 저장되었습니다.` };
    } catch (e: any) {
      console.warn('Android native file save failed, falling back:', e);
    }
  }

  // 2. 모바일 Web Share API 시도 (iOS '파일에 저장', Mac/모바일 시스템 공유 시트)
  if (typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([content], filename, { type: `${mimeType};charset=utf-8` });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return { success: true, message: `[${filename}] 파일 저장을 완료했습니다.` };
      }
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        return { success: false, cancelled: true, message: '저장을 취소했습니다.' };
      }
      console.warn('Web Share failed, falling back to blob:', shareErr);
    }
  }

  // 3. 브라우저 표준 Blob / a[download] 다운로드
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return { success: true, message: `[${filename}] 다운로드가 시작되었습니다.` };
  } catch (blobErr) {
    // 4. Data URI Fallback
    try {
      const encodedUri = `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: `[${filename}] 다운로드가 완료되었습니다.` };
    } catch (uriErr: any) {
      return { success: false, message: `다운로드 실패: ${uriErr.message || '지원되지 않는 환경입니다.'}` };
    }
  }
}

/** Preserve PNG bytes through Android SAF and browser file sharing. */
export async function saveWorkoutImage(filename: string, dataUrl: string): Promise<{ message: string }> {
  const data = dataUrl.split(',')[1];
  if (!data || !dataUrl.startsWith('data:image/png;base64,')) throw new Error('Invalid PNG');
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    const result = await nativeBackup.save({ filename, data, mimeType: 'image/png', encoding: 'base64' });
    return { message: result.cancelled ? '저장을 취소했습니다.' : '운동 인증 이미지를 저장했습니다.' };
  }
  const bytes = Uint8Array.from(atob(data), char => char.charCodeAt(0));
  const file = new File([bytes], filename, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '오늘의 운동 인증' });
      return { message: '공유 창으로 이미지를 전달했습니다.' };
    } catch (error) {
      if ((error as Error).name === 'AbortError') return { message: '공유를 취소했습니다.' };
    }
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { message: 'PNG 이미지 다운로드를 시작했습니다.' };
}
