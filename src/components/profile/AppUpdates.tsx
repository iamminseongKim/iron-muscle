import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Download } from 'lucide-react';
import { t } from '../../i18n';
import packageJson from '../../../package.json';
import { AppRelease, AppUpdater, checkLatestRelease, isNewerVersion } from '../../services/updates/releases';

export function AppUpdates() {
  const [release, setRelease] = useState<AppRelease>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const mounted = useRef(false);
  const running = useRef(false);
  const android = Capacitor.getPlatform() === 'android';
  async function check() {
    if (running.current) return;
    running.current = true; setBusy(true); setMessage(''); setRelease(undefined);
    try {
      const latest = await checkLatestRelease();
      if (mounted.current) setRelease(latest);
    } catch { if (mounted.current) setMessage('업데이트 확인에 실패했습니다. 인터넷 연결을 확인하고 다시 시도하세요.'); }
    finally { running.current = false; if (mounted.current) setBusy(false); }
  }
  useEffect(() => { mounted.current = true; void check(); return () => { mounted.current = false; }; }, []);
  if (!android) return null;
  const newer = release && isNewerVersion(release.version, packageJson.version);
  return <section className="soft-surface bg-white dark:bg-[#1E1B24] p-5 space-y-4" aria-labelledby="app-updates-title">
    <h3 id="app-updates-title" className="font-bold flex items-center gap-2"><Download size={18}/>{t('앱 업데이트')}</h3>
    <p className="text-sm">{t('현재 버전')} · v{packageJson.version}</p>
    <button disabled={busy} onClick={() => void check()} className="rounded-xl px-4 py-3 bg-gray-100 dark:bg-white/10 text-sm font-bold disabled:opacity-40">{t(busy ? '확인 중...' : '업데이트 확인')}</button>
    <div aria-live="polite" className="text-sm space-y-3">
      {release && <>
        <p>{t(newer ? '새 버전이 있습니다.' : '최신 버전을 사용하고 있습니다.')} · v{release.version}</p>
        {release.notes && <details><summary className="cursor-pointer font-semibold">{t('업데이트 내용')}</summary><p className="whitespace-pre-wrap break-words mt-3 max-h-64 overflow-y-auto">{release.notes}</p></details>}
        {newer && android && (release.apkUrl ? <button disabled={busy} className="rounded-xl px-4 py-3 bg-accent text-white font-bold disabled:opacity-40" onClick={async () => {
          setBusy(true); setMessage('');
          try { await AppUpdater.openInBrowser({ url: release.apkUrl! }); setMessage('브라우저에서 다운로드를 진행한 뒤 APK를 열어 설치하세요.'); }
          catch { setMessage('브라우저를 열지 못했습니다. 다시 시도하세요.'); }
          finally { setBusy(false); }
        }}>{t('브라우저에서 APK 다운로드')}</button> : <p>{t('설치 파일이 아직 준비되지 않았습니다. 잠시 후 다시 확인하세요.')}</p>)}
      </>}
      {message && <p>{t(message)}</p>}
    </div>
    {android && <p className="text-xs text-gray-500">{t('설치는 Android 확인 화면에서 직접 승인합니다. 기존 앱을 삭제하지 말고 업데이트로 설치하세요.')}</p>}
  </section>;
}
