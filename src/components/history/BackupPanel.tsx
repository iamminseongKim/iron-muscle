import { t } from '../../i18n';
import React, { useRef, useState } from 'react';
import { Download, FileText, Upload, ShieldAlert, Smartphone, Info, HardDrive } from 'lucide-react';
import { createBackup, parseBackup, restoreBackup, WorkoutBackup } from '../../utils/backup';
import { WorkoutSession } from '../../types/workout';
import { loadSavedSessions } from '../../utils/storage';
import { generateAiCoachingMarkdown } from '../../utils/aiPromptGenerator';
import { saveFileToDevice } from '../../utils/nativeFile';

export function BackupPanel({ onRestored }: { onRestored: (sessions: WorkoutSession[], date?: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<WorkoutBackup | null>(null);
  const [message, setMessage] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const preview = (raw: string) => {
    try {
      setPending(parseBackup(raw));
      setMessage('');
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  const backupJson = async () => {
    setBusy(true);
    setMessage('');
    try {
      const data = JSON.stringify(createBackup(), null, 2);
      const filename = `iron-muscle-${new Date().toISOString().slice(0, 10)}.json`;
      const res = await saveFileToDevice(filename, data, 'application/json');
      if (res.cancelled) {
        setMessage(t('저장을 취소했습니다.'));
      } else {
        setMessage(res.message || t('백업 파일을 저장했습니다. 앱 삭제 전 파일이 있는지 확인하세요.'));
        setText(data);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const backupMarkdown = async () => {
    setBusy(true);
    setMessage('');
    try {
      const sessions = loadSavedSessions();
      if (!sessions || sessions.length === 0) {
        setMessage(t('저장된 운동 기록이 없습니다.'));
        return;
      }
      const todayStr = new Date().toISOString().slice(0, 10);
      const md = generateAiCoachingMarkdown(sessions, { scope: 'all', selectedDate: todayStr, selectedBodyPart: 'all' });
      const filename = `IronMuscle_All_Workouts_${todayStr}.md`;
      const res = await saveFileToDevice(filename, md, 'text/markdown');
      if (res.cancelled) {
        setMessage(t('저장을 취소했습니다.'));
      } else {
        setMessage(res.message || t('전체 마크다운 일지 파일을 저장했습니다.'));
        setText(md);
      }
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const totalSets = pending ? pending.sessions.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0) : 0;
  const totalVolume = pending ? pending.sessions.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.reduce((x, set) => x + set.weight * set.reps, 0), 0), 0) : 0;

  return (
    <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-3 space-y-3 text-xs border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-1.5 text-[#1D1D1F] dark:text-white">
          <HardDrive size={16} className="text-[#0F766E] dark:text-[#2DD4BF]" />
          {t("기록 백업 · 복원 (마크다운 / JSON)")}
        </h3>
      </div>
      <p className="text-gray-500 leading-relaxed">
        {t("앱 삭제 전 파일로 백업하거나, 기존에 추출했던 마크다운 일지(.md) 및 백업 파일을 불러와 기록을 온전히 복원할 수 있습니다.")}
      </p>

      {/* 액션 버튼 그룹 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          disabled={busy}
          onClick={backupJson}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Download size={14} />
          <span>{t("파일로 백업 (.json)")}</span>
        </button>

        <button
          disabled={busy}
          onClick={backupMarkdown}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] border border-[#0F766E]/30 font-bold transition hover:bg-teal-100 dark:hover:bg-[#0F766E]/30 active:scale-95 disabled:opacity-50"
        >
          <FileText size={14} />
          <span>{t("전체 마크다운(.md) 내보내기")}</span>
        </button>

        <button
          onClick={() => input.current?.click()}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 font-bold transition hover:bg-gray-200 dark:hover:bg-white/15 active:scale-95"
        >
          <Upload size={14} />
          <span>{t("일지 / 백업 파일 복원")}</span>
        </button>
      </div>

      {/* 안전 보존 가이드 카드 */}
      <div className="rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40 p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-[#0F766E] dark:text-[#2DD4BF] text-xs">
          <Info size={15} />
          <span>{t('로컬 저장소 보존 및 안전 백업 가이드')}</span>
        </div>
        <div className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 space-y-2">
          <p>
            <strong>{t('현재 저장 방식')}:</strong> {t('모든 운동 기록과 헬스장 기구 세팅은 현재 기기의 브라우저 로컬 저장소(LocalStorage)에 안전하게 보존됩니다.')}
          </p>
          <div className="bg-white/80 dark:bg-black/20 rounded-lg p-2.5 space-y-1 border border-teal-100 dark:border-white/5">
            <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1">
              <Smartphone size={13} className="text-[#0F766E] dark:text-[#2DD4BF]" />
              {t('가장 안전한 보존 방법 (홈 화면에 추가 · PWA)')}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {t('사파리/크롬 공유 메뉴에서 [홈 화면에 추가]를 실행하면 독립된 앱 공간에 영구 보존되어 브라우저 캐시 삭제 시에도 안전합니다.')}
            </p>
          </div>
          <div className="bg-white/80 dark:bg-black/20 rounded-lg p-2.5 space-y-1 border border-amber-200/60 dark:border-amber-900/40">
            <div className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <ShieldAlert size={13} />
              {t('데이터 소실 주의 안내')}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {t('브라우저 방문 기록/캐시 삭제 또는 시크릿 탭 사용 시 기록이 소실될 수 있으니, 중요한 기록은 [파일로 백업] 또는 [전체 마크다운 내보내기]로 정기 보관하세요.')}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept=".md,.json,text/markdown,text/plain,application/json"
        className="hidden"
        aria-label={t("복원할 백업 또는 마크다운 파일")}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 10_000_000) setMessage(t('10MB 이하 파일을 선택하세요.'));
            else preview(await file.text());
          }
          e.target.value = '';
        }}
      />

      <details className="mt-1">
        <summary className="cursor-pointer py-1.5 text-gray-500 font-medium">{t("마크다운 일지 / 백업 텍스트 직접 붙여넣기")}</summary>
        <div className="mt-2 space-y-2">
          <textarea
            aria-label={t("운동 일지 텍스트")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-28 rounded-lg border border-gray-200 dark:border-white/10 p-2 bg-transparent text-xs font-mono"
            placeholder={t("앱에서 추출했던 마크다운 일지(_YYYYMMDD.md) 내용이나 백업 JSON을 여기에 붙여넣으세요.")}
          />
          <button className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white font-bold" onClick={() => preview(text)}>
            {t("일지 내용 확인")}
          </button>
        </div>
      </details>

      {pending && (
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-2 border border-gray-200 dark:border-white/10">
          <p className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">
            {t("운동")} {pending.sessions.length}{t("회 확인됨")} ({t("총")} {totalSets}{t("세트")} · {t("볼륨")} {totalVolume.toLocaleString()}kg)
            {pending.customExercises.length > 0 ? ` · ${t("사용자 운동")} ${pending.customExercises.length}${t("종")}` : ''}
            {pending.activeSession ? ` · ${t("진행 중인 운동 포함")}` : ''}
          </p>
          <p className="text-gray-500">
            {pending.sessions.map((s) => `${s.date} ${s.title} (${s.exercises.length}${t("개 종목")})`).slice(0, 3).join(' / ')}
          </p>
          <div className="flex gap-4 pt-1">
            <button
              className="font-bold text-[#0F766E] dark:text-[#2DD4BF] py-1.5 px-3 rounded-lg bg-[#0F766E]/10"
              onClick={() => {
                try {
                  const result = restoreBackup(pending);
                  onRestored(result.sessions, pending.sessions[0]?.date);
                  setMessage(`${t("기록 복원 완료")}: ${result.added}${t("회 추가됨")} (${t("기존 중복")} ${result.skipped}${t("회 건너뜀")})`);
                  setPending(null);
                  setText('');
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }}
            >
              {t("기존 기록과 합치기 (중복 제외 병합)")}
            </button>
            <button className="py-1.5 px-3" onClick={() => setPending(null)}>{t("취소")}</button>
          </div>
        </div>
      )}
      {message && <p role="status" className="text-[#0F766E] dark:text-[#2DD4BF] pt-1 font-medium">{message}</p>}
    </section>
  );
}
