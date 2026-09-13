import { t } from '../../i18n';
import React, { useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { createBackup, parseBackup, restoreBackup, WorkoutBackup } from '../../utils/backup';
import { WorkoutSession } from '../../types/workout';

const nativeBackup = registerPlugin<{ save(options: { filename: string; data: string }): Promise<{ cancelled: boolean }> }>('WorkoutBackup');

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

  const backup = async () => {
    setBusy(true);
    setMessage('');
    try {
      const data = JSON.stringify(createBackup(), null, 2);
      const filename = `iron-muscle-${new Date().toISOString().slice(0, 10)}.json`;
      if (Capacitor.getPlatform() === 'android') {
        const result = await nativeBackup.save({ filename, data });
        setMessage(result.cancelled ? '저장을 취소했습니다.' : '백업 파일을 저장했습니다. 앱 삭제 전 파일이 있는지 확인하세요.');
      } else {
        const file = new File([data], filename, { type: 'application/json' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: '운동 기록 백업' });
          setMessage('선택한 앱에서 파일 저장을 완료해 주세요.');
        } else {
          const url = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          setText(data);
          setMessage('파일 다운로드를 요청했습니다. 저장되지 않으면 아래 백업 텍스트를 복사해 별도로 보관하세요.');
        }
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
    <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-3 space-y-2 text-xs">
      <h3 className="font-bold text-sm">기록 백업 · 복원 (마크다운 / JSON)</h3>
      <p className="text-gray-500">
        앱 삭제 전 파일로 백업하거나, 기존에 추출했던 마크다운 일지(.md) 및 백업 파일을 불러와 기록을 온전히 복원할 수 있습니다.
      </p>
      <div className="flex gap-2">
        <button disabled={busy} onClick={backup} className="px-3 py-2 rounded-lg bg-[#0F766E] text-white font-bold">
          파일로 백업
        </button>
        <button onClick={() => input.current?.click()} className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10 font-bold">
          일지 / 백업 파일 복원 (.md, .json)
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept=".md,.json,text/markdown,text/plain,application/json"
        className="hidden"
        aria-label="복원할 백업 또는 마크다운 파일"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            if (file.size > 10_000_000) setMessage('10MB 이하 파일을 선택하세요.');
            else preview(await file.text());
          }
          e.target.value = '';
        }}
      />
      <details className="mt-1">
        <summary className="cursor-pointer py-1.5 text-gray-500 font-medium">마크다운 일지 / 백업 텍스트 직접 붙여넣기</summary>
        <div className="mt-2 space-y-2">
          <textarea
            aria-label="운동 일지 텍스트"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-28 rounded-lg border border-gray-200 dark:border-white/10 p-2 bg-transparent text-xs font-mono"
            placeholder="앱에서 추출했던 마크다운 일지(_YYYYMMDD.md) 내용이나 백업 JSON을 여기에 붙여넣으세요."
          />
          <button className="px-3 py-1.5 rounded-lg bg-[#0F766E] text-white font-bold" onClick={() => preview(text)}>
            일지 내용 확인
          </button>
        </div>
      </details>
      {pending && (
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-lg space-y-2 border border-gray-200 dark:border-white/10">
          <p className="font-bold text-[#0F766E]">
            운동 {pending.sessions.length}회 확인됨 (총 {totalSets}세트 · 볼륨 {totalVolume.toLocaleString()}kg)
            {pending.customExercises.length > 0 ? ` · 사용자 운동 ${pending.customExercises.length}종` : ''}
            {pending.activeSession ? ' · 진행 중인 운동 포함' : ''}
          </p>
          <p className="text-gray-500">
            {pending.sessions.map((s) => `${s.date} ${s.title} (${s.exercises.length}종목)`).slice(0, 3).join(' / ')}
          </p>
          <div className="flex gap-4 pt-1">
            <button
              className="font-bold text-[#0F766E] py-1.5 px-3 rounded-lg bg-[#0F766E]/10"
              onClick={() => {
                try {
                  const result = restoreBackup(pending);
                  onRestored(result.sessions, pending.sessions[0]?.date);
                  setMessage(`기록 복원 완료: ${result.added}회 추가됨 (기존 중복 ${result.skipped}회 건너뜀)`);
                  setPending(null);
                  setText('');
                } catch (e) {
                  setMessage((e as Error).message);
                }
              }}
            >
              기존 기록에 합쳐 복원
            </button>
            <button className="py-1.5 px-3" onClick={() => setPending(null)}>{t("취소")}</button>
          </div>
        </div>
      )}
      {message && <p role="status" className="text-gray-500 pt-1 font-medium">{message}</p>}
    </section>
  );
}
