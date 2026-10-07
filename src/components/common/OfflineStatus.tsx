import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { t } from '../../i18n';

export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported' | 'error'>('loading');
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    let live = true;
    const connected = () => setOnline(navigator.onLine);
    window.addEventListener('online', connected); window.addEventListener('offline', connected);
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) setStatus('unsupported');
    else navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(registration => {
      if (!live) return;
      const check = () => {
        if (!live) return;
        if (registration.active) setStatus('ready');
        if (registration.waiting) setUpdate(true);
      };
      check();
      const observe = () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          check();
          if (live && worker.state === 'redundant' && !registration.active) setStatus('error');
        });
      };
      registration.addEventListener('updatefound', observe);
      observe();
      navigator.serviceWorker.ready.then(() => { if (live) setStatus('ready'); });
      void registration.update().catch(() => {});
    }).catch(() => { if (live) setStatus('error'); });
    return () => { live = false; window.removeEventListener('online', connected); window.removeEventListener('offline', connected); };
  }, []);
  if (Capacitor.isNativePlatform()) return null;
  return <details className="mx-4 mt-2 text-xs text-gray-500">
    <summary className="cursor-pointer">{t(!online ? '오프라인 · 이 기기에 기록 중' : status === 'ready' ? '오프라인 준비 완료' : status === 'loading' ? '오프라인 준비 중...' : '오프라인 준비를 완료하지 못했습니다.')}</summary>
    <p className="mt-2">{t('준비 완료 후에는 인터넷 없이 다시 열어 운동을 기록할 수 있습니다. 처음 보는 3D 모델은 인터넷이 필요합니다. 브라우저 데이터 삭제에 대비해 파일 백업도 보관하세요.')}</p>
    {update && <p className="mt-1 text-accent-600">{t('새 버전이 준비되었습니다. 운동을 마친 뒤 모든 앱 탭을 닫고 다시 열면 적용됩니다.')}</p>}
  </details>;
}
