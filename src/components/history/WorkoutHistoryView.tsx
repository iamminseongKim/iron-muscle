import exportMessages from '../../i18n/exportMessages.json';
import { useLanguage } from '../../i18n';
import { t } from '../../i18n';
import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Download, Copy, Check, 
  Sparkles, Bot, Clock, Dumbbell, Flame, Zap, Trophy, MessageSquare, 
  FileText, ArrowRight, Share2, Layers, Edit3, Trash2, RotateCcw 
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WeightUnit } from '../../types/workout';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE } from '../../utils/calculations';
import { loadSavedSessions, saveSessions, clearAllSessions, loadSampleDataForDemo } from '../../utils/storage';
import { WorkoutShareCard } from './WorkoutShareCard';
import { BackupPanel } from './BackupPanel';
import { EditSessionModal } from './EditSessionModal';
import { saveFileToDevice } from '../../utils/nativeFile';
import { adService } from '../../services/adService';
import { mergeDaySessions } from '../../utils/sessionMerge';
import {
  filterSessionsForAiExport,
  extractAvailableBodyParts,
  generateAiCoachingMarkdown,
  AiExportScope,
  TargetBodyPart,
  BODY_PART_OPTIONS,
} from '../../utils/aiPromptGenerator';

interface WorkoutHistoryViewProps {
  weightUnit?: WeightUnit;
}

export const WorkoutHistoryView: React.FC<WorkoutHistoryViewProps> = ({ weightUnit = 'kg' }) => {
  const language = useLanguage();
  const exportLabels = exportMessages[language];
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadSavedSessions());
  const [viewScope, setViewScope] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);

  // Edit Modal State
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Date states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return today;
  });

  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  });

  const [currentYear, setCurrentYear] = useState<number>(() => {
    return new Date().getFullYear();
  });

  // AI Export Modal State
  const [isAiExportOpen, setIsAiExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<AiExportScope>('day');
  const [exportDate, setExportDate] = useState<string>(() => selectedDate);
  const [exportCustomStart, setExportCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().slice(0, 10);
  });
  const [exportCustomEnd, setExportCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedBodyPart, setSelectedBodyPart] = useState<TargetBodyPart>('all');
  const [copied, setCopied] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  const handleOpenAiExport = () => {
    setExportDate(selectedDate);
    setIsAiExportOpen(true);
  };

  // 과거 운동 삭제 핸들러
  const handleDeleteSession = (sessionId: string, sessionDate: string) => {
    if (window.confirm(`${sessionDate}의 운동 기록을 정말 삭제하시겠습니까?`)) {
      const updated = sessions.filter((s) => s.id !== sessionId);
      setSessions(updated);
      saveSessions(updated);
    }
  };

  // 과거 운동 수정 모달 열기
  const handleOpenEditSession = (session: WorkoutSession) => {
    setEditingSession(session);
    setIsEditModalOpen(true);
  };

  // 과거 운동 수정 저장
  const handleSaveEditedSession = (updatedSession: WorkoutSession) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    setSessions(updated);
    saveSessions(updated);
  };

  // 오늘 운동 기록 합치기 피드백
  const [mergeFeedback, setMergeFeedback] = useState<string>('');

  // 오늘 날짜의 2개 이상 운동 세션을 하나로 통합
  const handleMergeDaySessions = () => {
    if (dailySessions.length < 2) return;

    const totalExCount = dailySessions.reduce((acc, s) => acc + (s.exercises?.length || 0), 0);
    const totalSetCount = dailySessions.reduce(
      (acc, s) => acc + (s.exercises || []).reduce((sum, e) => sum + (e.sets?.length || 0), 0),
      0
    );
    const totalMinutes = Math.round(
      dailySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
    );

    const confirmed = window.confirm(
      `[오늘 운동 기록 합치기]\n\n${selectedDate}에 기록된 ${dailySessions.length}개의 세션을 하나로 합치시겠습니까?\n\n• 총 종목: ${totalExCount}개\n• 총 세트: ${totalSetCount}세트\n• 총 소요 시간: ${totalMinutes}분\n\n모든 종목과 세트, 무게 기록이 손상 없이 순서대로 통합됩니다.`
    );

    if (!confirmed) return;

    try {
      const merged = mergeDaySessions(dailySessions);
      const daySessionIds = new Set(dailySessions.map((s) => s.id));
      const restSessions = sessions.filter((s) => !daySessionIds.has(s.id));
      const updated = [merged, ...restSessions];
      setSessions(updated);
      saveSessions(updated);
      setMergeFeedback(`오늘의 운동 기록 ${dailySessions.length}개가 하나로 깔끔하게 합쳐졌습니다!`);
      setTimeout(() => setMergeFeedback(''), 4000);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  // 샘플 데이터 불러오기 (데모용)
  const handleLoadSampleData = () => {
    const samples = loadSampleDataForDemo();
    setSessions(samples);
  };

  // 전체 기록 초기화
  const handleClearAllHistory = () => {
    if (window.confirm('저장된 모든 운동 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllSessions();
      setSessions([]);
    }
  };

  // Available dates that have workouts
  const workoutDates = useMemo(() => {
    return new Set(sessions.map((s) => s.date));
  }, [sessions]);

  // Filtered sessions based on date / month / year
  const dailySessions = useMemo(() => {
    return sessions.filter((s) => s.date === selectedDate);
  }, [sessions, selectedDate]);

  const monthlySessions = useMemo(() => {
    return sessions.filter((s) => s.date.startsWith(currentMonth));
  }, [sessions, currentMonth]);

  const yearlySessions = useMemo(() => {
    return sessions.filter((s) => s.date.startsWith(String(currentYear)));
  }, [sessions, currentYear]);

  // Navigation handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handlePrevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setCurrentMonth(prev.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setCurrentMonth(next.toISOString().slice(0, 7));
  };

  // AI 내보내기용 대상 세션 및 마크다운 계산
  const dateScopedSessions = useMemo(() => {
    return filterSessionsForAiExport(sessions, {
      scope: exportScope,
      selectedDate: exportDate,
      customStartDate: exportCustomStart,
      customEndDate: exportCustomEnd,
      selectedBodyPart: 'all',
    });
  }, [sessions, exportScope, exportDate, exportCustomStart, exportCustomEnd]);

  const availableBodyParts = useMemo(() => {
    return extractAvailableBodyParts(dateScopedSessions);
  }, [dateScopedSessions]);

  const exportTargetSessions = useMemo(() => {
    if (selectedBodyPart === 'all') return dateScopedSessions;
    return filterSessionsForAiExport(sessions, {
      scope: exportScope,
      selectedDate: exportDate,
      customStartDate: exportCustomStart,
      customEndDate: exportCustomEnd,
      selectedBodyPart,
    });
  }, [sessions, exportScope, exportDate, exportCustomStart, exportCustomEnd, selectedBodyPart, dateScopedSessions]);

  const currentMarkdown = useMemo(() => {
    return generateAiCoachingMarkdown(exportTargetSessions, {
      language,
      scope: exportScope,
      selectedDate: exportDate,
      customStartDate: exportCustomStart,
      customEndDate: exportCustomEnd,
      selectedBodyPart,
    });
  }, [exportTargetSessions, exportScope, exportDate, exportCustomStart, exportCustomEnd, selectedBodyPart, language]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(currentMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = currentMarkdown;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = async () => {
    const partSuffix = selectedBodyPart !== 'all' ? `_${selectedBodyPart}` : '';
    const datePart =
      exportScope === 'day'
        ? exportDate.replace(/-/g, '')
        : exportScope === 'week'
        ? `${exportDate.replace(/-/g, '')}_week`
        : exportScope === 'month'
        ? `${exportDate.slice(0, 7).replace(/-/g, '')}`
        : exportScope === 'custom'
        ? `${exportCustomStart.replace(/-/g, '')}_${exportCustomEnd.replace(/-/g, '')}`
        : `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_all`;
    const filename = `IronMuscle_${datePart}${partSuffix}.md`;

    // 💡 사용자가 다운로드 시 클립보드 복사는 수행하지 않고, 실제 파일 다운로드/저장만 실행
    const res = await saveFileToDevice(filename, currentMarkdown, 'text/markdown');
    if (res.message) {
      setDownloadFeedback(res.cancelled ? t("저장을 취소했습니다.") : res.success ? `${t("저장")}: ${filename}` : `${t("저장")} ✕`);
      setTimeout(() => setDownloadFeedback(null), 3000);
    }
  };

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 상단 헤더 & AI 마크다운 추출 버튼 */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-2">
            <Calendar size={20} className="text-[#0F766E]" />{t("운동 기록 조회")}</h2>
          <p className="text-xs text-gray-400">날짜별, 월별, 연별 운동 일지 및 AI 분석 추출</p>
        </div>

        {/* 🤖 AI 분석용 Markdown 추출 버튼 */}
        <button
          type="button"
          onClick={async () => {
            await adService.showInterstitialAd('ai_markdown');
            handleOpenAiExport();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#5856D6] hover:opacity-95 text-white rounded-full text-xs font-black shadow-md shadow-teal-900/20 active:scale-98 transition"
        >
          <Bot size={14} />
          <span>{t("AI 분석 추출")}</span>
        </button>
      </div>

      <BackupPanel onRestored={(restored,date) => {setSessions(restored);if(date){setSelectedDate(date);setCurrentMonth(date.slice(0,7));setCurrentYear(Number(date.slice(0,4)));setViewScope('daily');}}} />

      {/* 뷰 모드 스위처 (일간 / 월간 / 연간) */}
      <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-1 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setViewScope('daily')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            viewScope === 'daily'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >{t("일간 (날짜별)")}</button>
        <button
          type="button"
          onClick={() => setViewScope('monthly')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            viewScope === 'monthly'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >{t("월간 (월별)")}</button>
        <button
          type="button"
          onClick={() => setViewScope('yearly')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            viewScope === 'yearly'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >{t("연간 (년별)")}</button>
      </div>

      {/* ================= 1. 일간 (날짜별 뷰) ================= */}
      {viewScope === 'daily' && (
        <div className="space-y-3">
          {/* 날짜 네비게이터 */}
          <div className="flex items-center justify-between bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-black text-sm text-[#1D1D1F] dark:text-white text-center outline-none cursor-pointer"
              />
              {workoutDates.has(selectedDate) && (
                <span className="w-2 h-2 rounded-full bg-[#34C759]" title="운동 완료일" />
              )}
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {dailySessions.length > 0 && <button type="button" onClick={() => setIsShareCardOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] font-black text-sm"><Share2 size={18}/>{t("운동 인증 카드 만들기")}</button>}

          {/* 오늘 운동 기록이 2개 이상일 때 나타나는 합치기 배너 */}
          {dailySessions.length > 1 && (
            <div className="bg-gradient-to-r from-[#0F766E]/10 to-indigo-500/10 border border-[#0F766E]/20 dark:border-[#0F766E]/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-[#0F766E] text-white shrink-0">
                  <Layers size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                    <span>{t("오늘")}{dailySessions.length}개의 운동 기록이 있습니다</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0F766E]/20 text-[#0F766E] font-extrabold">
                      {dailySessions.length}개 세션
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    실수로 나눠졌거나 2차 운동을 하나의 일지로 통합합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleMergeDaySessions}
                className="px-3 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0d635c] text-white font-black text-xs shrink-0 shadow-sm active:scale-95 transition flex items-center gap-1"
              >
                <span>기록 합치기</span>
              </button>
            </div>
          )}

          {mergeFeedback && (
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-[#0F766E] dark:text-teal-400 text-xs font-bold text-center animate-fade-in">
              {mergeFeedback}
            </div>
          )}

          {/* 해당 일자의 운동 목록 */}
          {dailySessions.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-6 space-y-3">
              <Dumbbell size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {selectedDate}에 기록된 운동이 없습니다.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  [운동 기록] 탭에서 오늘의 운동을 시작하거나 날짜를 변경해 보세요.
                </p>
              </div>

              {sessions.length === 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/10 text-gray-600 dark:text-gray-300 text-xs font-bold transition inline-flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} className="text-[#0F766E]" />
                    <span>{t("체험용 샘플 기록 불러오기")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            dailySessions.map((session) => {
              const sessionVol = calculateSessionVolume(session);
              const sessionReps = calculateSessionReps(session);
              const avgRpe = calculateAverageRPE(session);

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 p-4 shadow-sm space-y-3"
                >
                  {/* 세션 헤더 */}
                  <div className="flex items-start justify-between pb-3 border-b border-black/5 dark:border-white/5 flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg leading-none">{session.conditionEmoji || '💪'}</span>
                        <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                          {session.title || t("오늘의 운동")}
                        </h3>
                        {session.isDeload && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold">
                            디로딩
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {session.date} · {Math.round(session.durationSeconds / 60)}분 동안 수행
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-semibold">총 볼륨</span>
                        <span className="text-sm font-black text-[#0F766E]">
                          {sessionVol.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">kg</span>
                        </span>
                      </div>

                      {/* 수정 & 삭제 버튼 */}
                      <div className="flex items-center gap-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] p-0.5 rounded-xl border border-black/5 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSession(session)}
                          className="p-1.5 rounded-lg hover:bg-black/10 text-gray-600 dark:text-gray-300 transition"
                          title="이 운동 기록 수정"
                        >
                          <Edit3 size={14} className="text-[#0F766E]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(session.id, session.date)}
                          className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-500 transition"
                          title="이 운동 기록 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 세션 메모 */}
                  {session.notes && (
                    <div className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <MessageSquare size={14} className="text-[#0F766E] shrink-0 mt-0.5" />
                      <span>{session.notes}</span>
                    </div>
                  )}

                  {/* 세션 내 운동 종목 카드들 */}
                  <div className="space-y-3 pt-1">
                    {session.exercises.map((exItem, eIdx) => {
                      const base = resolveRecordedExercise(exItem);
                      const exName = base.name;
                      const isGrouped = Boolean(exItem.groupId);

                      return (
                        <div
                          key={exItem.id || eIdx}
                          className={`p-3 rounded-2xl border ${
                            isGrouped
                              ? exItem.groupType === 'superset'
                                ? 'border-l-4 border-l-[#0F766E] border-black/5 dark:border-white/5 bg-[#F9F9FB]/80 dark:bg-[#222226]'
                                : 'border-l-4 border-l-[#FF9500] border-black/5 dark:border-white/5 bg-[#F9F9FB]/80 dark:bg-[#222226]'
                              : 'border-black/5 dark:border-white/5 bg-[#F9F9FB] dark:bg-[#222226]'
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-[#1D1D1F] dark:text-white">
                                {exName}
                              </span>
                              {exItem.groupLabel && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                                  exItem.groupType === 'superset' ? 'bg-[#0F766E]' : 'bg-[#FF9500]'
                                }`}>
                                  {exItem.groupLabel}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-gray-500 text-[10px] font-semibold">
                                {exItem.loadType === 'plate-loaded' ? '플레이트' : exItem.loadType === 'pin-loaded' ? '핀머신' : exItem.equipmentType}
                              </span>
                              {exItem.executionMode === 'unilateral' && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-[#0F766E] text-[10px] font-bold">
                                  원암(편측)
                                </span>
                              )}
                            </div>

                            {exItem.machineBrand && (
                              <span className="text-[10px] text-gray-400 truncate max-w-[100px]">
                                {exItem.machineBrand.split(' ')[0]}
                              </span>
                            )}
                          </div>

                          {/* 세트 리스트 */}
                          <div className="space-y-1">
                            {exItem.sets.map((set, sIdx) => (
                              <div
                                key={set.id || sIdx}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-400 text-[11px]">#{set.setNumber}</span>
                                  {set.side && (
                                    <span className={`px-1 rounded text-[9px] font-black ${
                                      set.side === 'left' ? 'bg-blue-500 text-white' : set.side === 'right' ? 'bg-red-500 text-white' : 'text-gray-400'
                                    }`}>
                                      {set.side === 'left' ? '좌' : set.side === 'right' ? '우' : '양쪽'}
                                    </span>
                                  )}
                                  <span className="font-extrabold text-[#1D1D1F] dark:text-white">
                                    {set.weight}{exItem.weightUnit || 'kg'} × {set.reps}회
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                  {set.rpe && (
                                    <span className="font-bold text-amber-500">RPE {set.rpe}</span>
                                  )}
                                  {set.tempo && (
                                    <span className="text-[10px]">
                                      {set.tempo.eccentric}-{set.tempo.pause}-{set.tempo.concentric}s
                                    </span>
                                  )}
                                  {set.restSeconds && (
                                    <span className="text-gray-400 flex items-center gap-0.5">
                                      <Clock size={10} />
                                      {set.restSeconds}s
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= 2. 월간 (월별 뷰) ================= */}
      {viewScope === 'monthly' && (
        <div className="space-y-3">
          {/* 월 네비게이터 */}
          <div className="flex items-center justify-between bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-black text-sm text-[#1D1D1F] dark:text-white">
              {currentMonth.split('-')[0]}년 {currentMonth.split('-')[1]}월
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 월간 요약 카드 */}
          <div className="grid grid-cols-3 gap-2 text-center bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">월 운동 횟수</span>
              <span className="text-xl font-black text-[#1D1D1F] dark:text-white">{monthlySessions.length} <span className="text-xs font-normal text-gray-400">회</span></span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">월 누적 볼륨</span>
              <span className="text-xl font-black text-[#0F766E]">
                {monthlySessions.reduce((s, x) => s + calculateSessionVolume(x), 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">kg</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">평균 운동시간</span>
              <span className="text-xl font-black text-[#0F766E]">
                {monthlySessions.length > 0
                  ? Math.round(monthlySessions.reduce((s, x) => s + x.durationSeconds, 0) / monthlySessions.length / 60)
                  : 0} <span className="text-xs font-normal text-gray-400">{t("분")}</span>
              </span>
            </div>
          </div>

          {/* 월간 출석 체크 캘린더 히트맵 (잔디 달력) */}
          <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
              <span>월간 출석 캘린더</span>
              <span className="text-[11px] text-gray-400">날짜 클릭 시 해당 일지 조회</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {['일', '월', '화', '수', '목', '금', '토'].map((w) => (
                <span key={w} className="text-[10px] text-gray-400 font-bold py-1">{w}</span>
              ))}

              {/* Day cells (1-31) */}
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                const dayStr = `${currentMonth}-${dayNum < 10 ? '0' : ''}${dayNum}`;
                const hasSession = workoutDates.has(dayStr);
                const isSelected = selectedDate === dayStr;

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dayStr);
                      setViewScope('daily');
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition ${
                      hasSession
                        ? 'bg-[#34C759] text-white shadow-xs'
                        : isSelected
                        ? 'border border-[#0F766E] text-[#0F766E]'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-400 hover:bg-black/10'
                    }`}
                  >
                    <span>{dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 월간 세션 피드 리스트 */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold text-gray-400 px-1">이번 달 수행 세션 피드</h3>
            {monthlySessions.map((s) => (
              <div
                key={s.id}
                onClick={() => {
                  setSelectedDate(s.date);
                  setViewScope('daily');
                }}
                className="p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-[#0F766E] transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{s.conditionEmoji || '💪'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">{s.title || t("오늘의 운동")}</h4>
                    <span className="text-[11px] text-gray-400">{s.date} · {s.exercises.length}개 종목</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0F766E]">{calculateSessionVolume(s).toLocaleString()}kg</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(s)}
                      className="p-1 rounded-lg hover:bg-black/10 text-gray-400 hover:text-[#0F766E] transition"
                      title={t("수정")}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(s.id, s.date)}
                      className="p-1 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-500 transition"
                      title={t("삭제")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. 연간 (년별 뷰) ================= */}
      {viewScope === 'yearly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white dark:bg-[#1C1C1E] p-3 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
            <button
              onClick={() => setCurrentYear(currentYear - 1)}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-black text-sm text-[#1D1D1F] dark:text-white">
              {currentYear}년 전체 트레이닝
            </span>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-500 transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
              <span className="text-[11px] text-gray-400 font-bold block mb-1">연간 총 운동 일수</span>
              <span className="text-2xl font-black text-[#1D1D1F] dark:text-white">{yearlySessions.length} <span className="text-xs font-normal text-gray-400">일</span></span>
            </div>
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
              <span className="text-[11px] text-gray-400 font-bold block mb-1">연간 누적 볼륨</span>
              <span className="text-2xl font-black text-[#0F766E]">
                {Math.round(yearlySessions.reduce((s, x) => s + calculateSessionVolume(x), 0) / 1000).toLocaleString()} <span className="text-xs font-normal text-gray-400">톤</span>
              </span>
            </div>
          </div>

          {/* 월별 운동 횟수 바 차트 */}
          <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-gray-500 block mb-3">월별 운동 빈도</span>
            <div className="flex items-end justify-between h-32 pt-2 px-1">
              {Array.from({ length: 12 }, (_, i) => {
                const mStr = `${currentYear}-${(i + 1) < 10 ? '0' : ''}${i + 1}`;
                const count = sessions.filter((s) => s.date.startsWith(mStr)).length;
                const maxCount = Math.max(...Array.from({ length: 12 }, (__, mi) => {
                  const sMonth = `${currentYear}-${(mi + 1) < 10 ? '0' : ''}${mi + 1}`;
                  return sessions.filter((s) => s.date.startsWith(sMonth)).length;
                }), 1);
                const heightPercent = Math.min(100, Math.round((count / maxCount) * 100));

                return (
                  <div key={mStr} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-[9px] text-gray-400 font-semibold">{count > 0 ? count : ''}</span>
                    <div className="w-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-t-md h-24 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all ${
                          count > 0 ? 'bg-gradient-to-t from-[#0F766E] to-[#5856D6]' : ''
                        }`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{i + 1}월</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. AI 분석용 Markdown 추출 모달 ================= */}
      {isAiExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#5856D6] text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                    {t("AI 분석 추출")} · Markdown
                  </h3>
                  <p className="text-xs text-gray-400">ChatGPT / Claude / Gemini</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiExportOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-400 transition"
              >
                ✕
              </button>
            </div>

            {/* 1. 분석 기간 모드 탭 (Scope Selection) */}
            <div className="px-4 pt-3 pb-2 bg-[#F9F9FB] dark:bg-[#18181A] border-b border-black/5 dark:border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-500">{exportLabels.period}:</span>
                <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-xl font-bold text-[11px] overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setExportScope('day')}
                    className={`px-2 py-1 rounded-lg transition whitespace-nowrap ${
                      exportScope === 'day'
                        ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    {t("당일")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('week')}
                    className={`px-2 py-1 rounded-lg transition whitespace-nowrap ${
                      exportScope === 'week'
                        ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >
                    {t("주간")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportScope('month')}
                    className={`px-2 py-1 rounded-lg transition whitespace-nowrap ${
                      exportScope === 'month'
                        ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >{t("월간")}</button>
                  <button
                    type="button"
                    onClick={() => setExportScope('custom')}
                    className={`px-2 py-1 rounded-lg transition whitespace-nowrap ${
                      exportScope === 'custom'
                        ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >{t("직접 지정")}</button>
                  <button
                    type="button"
                    onClick={() => setExportScope('all')}
                    className={`px-2 py-1 rounded-lg transition whitespace-nowrap ${
                      exportScope === 'all'
                        ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                        : 'text-gray-500'
                    }`}
                  >{t("전체")}</button>
                </div>
              </div>

              {/* 2. 날짜 / 기간 세부 컨트롤 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                {exportScope === 'day' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-gray-400 text-[11px] shrink-0 font-medium">{t("대상 날짜:")}</span>
                    <input
                      type="date"
                      value={exportDate}
                      onChange={(e) => setExportDate(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        setExportDate(today);
                      }}
                      className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-[#0F766E]"
                    >{t("오늘")}</button>
                    <button
                      type="button"
                      onClick={() => {
                        const yest = new Date();
                        yest.setDate(yest.getDate() - 1);
                        setExportDate(yest.toISOString().slice(0, 10));
                      }}
                      className="px-2 py-1 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-lg text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:text-[#0F766E]"
                    >{t("어제")}</button>
                  </div>
                )}

                {exportScope === 'week' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-gray-400 text-[11px] shrink-0 font-medium">{t("기준일:")}</span>
                    <input
                      type="date"
                      value={exportDate}
                      onChange={(e) => setExportDate(e.target.value)}
                      className="bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <span className="text-[11px] text-gray-400 font-medium truncate">{t("(기준일 포함 직전 7일간 분석)")}</span>
                  </div>
                )}

                {exportScope === 'month' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-gray-400 text-[11px] shrink-0 font-medium">{t("대상 월:")}</span>
                    <input
                      type="month"
                      value={exportDate.slice(0, 7)}
                      onChange={(e) => setExportDate(`${e.target.value}-01`)}
                      className="bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-1 focus:ring-[#0F766E]"
                    />
                    <span className="text-[11px] text-gray-400 font-medium">{t("(해당 월 전체 세션 분석)")}</span>
                  </div>
                )}

                {exportScope === 'custom' && (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="date"
                      value={exportCustomStart}
                      onChange={(e) => setExportCustomStart(e.target.value)}
                      className="flex-1 min-w-0 bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-2 py-1 text-xs font-bold text-[#1D1D1F] dark:text-white"
                    />
                    <span className="text-gray-400 text-xs">~</span>
                    <input
                      type="date"
                      value={exportCustomEnd}
                      onChange={(e) => setExportCustomEnd(e.target.value)}
                      className="flex-1 min-w-0 bg-white dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-2 py-1 text-xs font-bold text-[#1D1D1F] dark:text-white"
                    />
                  </div>
                )}

                {exportScope === 'all' && (
                  <div className="w-full text-gray-400 text-[11px] font-medium py-0.5">
                    {exportLabels.allTime} · {exportLabels.sessions}: {sessions.length}
                  </div>
                )}
              </div>

              {/* 3. 운동 부위 필터링 칩 (Target Body Part Filter) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                    <Dumbbell size={12} className="text-[#0F766E]" />{t("운동 부위 필터:")}</span>
                  <span className="text-[10px] text-gray-400">
                    {exportLabels.sessions}: {exportTargetSessions.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {availableBodyParts.map((part) => {
                    const isSelected = selectedBodyPart === part.id;
                    const hasSets = part.totalSets > 0 || part.id === 'all';
                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => setSelectedBodyPart(part.id)}
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                          isSelected
                            ? 'bg-[#0F766E] text-white shadow-xs'
                            : hasSets
                            ? 'bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-200 border border-black/5 dark:border-white/5 hover:border-[#0F766E]/40'
                            : 'bg-white/50 dark:bg-[#2C2C2E]/40 text-gray-400 dark:text-gray-500 border border-dashed border-black/5 dark:border-white/5 opacity-60'
                        }`}
                      >
                        <span>{part.icon}</span>
                        <span>{exportLabels[part.id]}</span>
                        {part.totalSets > 0 && (
                          <span
                            className={`text-[10px] px-1 py-0.2 rounded-full font-black ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-black/5 dark:bg-white/10 text-[#0F766E] dark:text-[#2DD4BF]'
                            }`}
                          >
                            {part.totalSets}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. AI 맞춤 프롬프트 안내 배지 */}
            <div className="px-4 py-2 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 border-b border-black/5 dark:border-white/5 flex items-center gap-2 text-xs text-[#0F766E] dark:text-[#2DD4BF] font-semibold">
              <Sparkles size={14} className="shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
              <span className="truncate">{exportLabels.feedback} · {exportLabels[selectedBodyPart]} · {exportScope === 'all' ? exportLabels.allTime : exportLabels[exportScope]}
              </span>
            </div>

            {/* Markdown Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#121214] text-gray-200 font-mono text-xs leading-relaxed select-all whitespace-pre-wrap">
              {currentMarkdown}
            </div>

            {downloadFeedback && (
              <div className="px-4 py-2 bg-[#34C759]/15 text-[#34C759] text-xs font-bold text-center border-t border-black/5 dark:border-white/5 animate-fade-in">
                {downloadFeedback}
              </div>
            )}

            {/* Actions: Copy & Download */}
            <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  copied
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#0F766E] hover:bg-blue-600 text-white shadow-md shadow-teal-900/20 active:scale-98'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? t("클립보드에 복사 완료!") : t("클립보드에 복사 (ChatGPT용)")}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-4 py-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/10 text-[#1D1D1F] dark:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                title={t("Markdown (.md) 파일 다운로드")}
              >
                <Download size={16} />
                <span>{t(".md 다운로드")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareCardOpen && <WorkoutShareCard sessions={dailySessions} date={selectedDate} unit={weightUnit} onClose={() => setIsShareCardOpen(false)}/>}
      {/* 과거 운동 기록 수정 모달 */}
      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        session={editingSession}
        onSave={handleSaveEditedSession}
      />
    </div>
  );
};
