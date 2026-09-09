import React, { useState, useMemo } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Download, Copy, Check, 
  Sparkles, Bot, Clock, Dumbbell, Flame, Zap, Trophy, MessageSquare, 
  FileText, ArrowRight, Share2, Layers, Edit3, Trash2, RotateCcw 
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, WeightUnit } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE } from '../../utils/calculations';
import { loadSavedSessions, saveSessions, clearAllSessions, loadSampleDataForDemo } from '../../utils/storage';
import { EditSessionModal } from './EditSessionModal';

interface WorkoutHistoryViewProps {
  weightUnit?: WeightUnit;
}

export const WorkoutHistoryView: React.FC<WorkoutHistoryViewProps> = ({ weightUnit = 'kg' }) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => loadSavedSessions());
  const [viewScope, setViewScope] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  
  // Edit Modal State
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Date states
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0];
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
  const [exportScope, setExportScope] = useState<'selected' | 'month' | 'all'>('selected');
  const [copied, setCopied] = useState(false);

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

  // Generate Markdown for AI analysis
  const generateAiMarkdown = (targetSessions: WorkoutSession[]) => {
    if (targetSessions.length === 0) {
      return '# 🏋️‍♂️ [Iron Muscle Tracker] 운동 기록 없음\n선택한 기간에 등록된 운동 세션이 없습니다.';
    }

    const totalVol = targetSessions.reduce((sum, s) => sum + calculateSessionVolume(s), 0);
    const totalReps = targetSessions.reduce((sum, s) => sum + calculateSessionReps(s), 0);
    const startDate = targetSessions[targetSessions.length - 1].date;
    const endDate = targetSessions[0].date;

    let md = `# 🏋️‍♂️ [Iron Muscle Tracker] 전문 운동 일지 분석 요청서\n\n`;
    md += `> **분석 기간**: ${startDate} ~ ${endDate} (총 ${targetSessions.length}회 세션)\n`;
    md += `> **총 누적 볼륨**: ${totalVol.toLocaleString()} kg | **총 반복수**: ${totalReps.toLocaleString()} 회\n\n`;
    md += `### ⚠️ 중량 기록 및 장비별 측정 원칙 (AI 코치 필수 준수 사항)\n`;
    md += `1. **덤벨(Dumbbell) 운동**: 기록된 중량은 **모두 한쪽(편측, Single-Arm/Per-Hand) 무게**입니다. (예: 덤벨 벤치프레스 20kg은 한 손에 20kg씩 양손 총 40kg의 중량을 다룬 것이므로, 볼륨 계산 및 부하 분석 시 편측 기준 특성을 정확히 반영해야 합니다).\n`;
    md += `2. **스미스머신(Smith Machine) 운동**: 머신 자체의 기본 봉 무게를 **완전 제외한 순수 원판(Plate) 무게만 기록**된 값입니다. (예: 스미스 60kg는 봉 무게를 가산하지 않은 순수 추가 원판 무게 기준입니다).\n\n`;
    md += `---\n\n`;

    targetSessions.forEach((s, sIdx) => {
      const vol = calculateSessionVolume(s);
      const reps = calculateSessionReps(s);
      const avgRpe = calculateAverageRPE(s);
      const durMins = Math.round(s.durationSeconds / 60);

      md += `## 📅 세션 ${sIdx + 1}: ${s.date} (${s.title || '오늘의 운동'})\n`;
      md += `- **소요 시간**: ${durMins}분 | **컨디션**: ${s.conditionEmoji || '💪'} | **총 볼륨**: ${vol.toLocaleString()}kg | **평균 RPE**: ${avgRpe || '-'}\n`;
      if (s.isDeload) md += `- **특이사항**: 🔄 디로딩(Deload) 세션\n`;
      if (s.notes) md += `- **운동 메모/소감**: "${s.notes}"\n`;
      md += `\n`;

      s.exercises.forEach((ex, eIdx) => {
        const base = EXERCISES_DATABASE.find((b) => b.id === ex.exerciseId);
        const name = base?.name || '운동 종목';
        const loadLabel = ex.loadType === 'plate-loaded' ? '플레이트(원판)' : ex.loadType === 'pin-loaded' ? '핀머신' : ex.equipmentType;
        const modeLabel = ex.executionMode === 'unilateral' ? '원암(편측)' : '투암(양측)';
        const groupLabel = ex.groupLabel ? ` [${ex.groupLabel}]` : '';

        const isDumbbell = ex.equipmentType === 'dumbbell' || base?.equipment === 'dumbbell' || name.includes('덤벨');
        const isSmith = (ex.equipmentType === 'machine' || base?.equipment === 'machine') && (name.includes('스미스') || base?.nameEn.toLowerCase().includes('smith'));
        const weightStandardNote = isDumbbell ? ' [💡 한쪽 무게 기준]' : isSmith ? ' [💡 봉 제외 원판만 기록]' : '';

        md += `### ${eIdx + 1}. ${name}${groupLabel}${weightStandardNote} (${loadLabel} / ${modeLabel})\n`;
        if (ex.machineBrand) md += `- **기구 브랜드**: ${ex.machineBrand}${ex.machineSetting ? ` (세팅: ${ex.machineSetting})` : ''}\n`;

        md += `| 세트 | 중량(kg) | 횟수 | 1RM 추정 | RPE | 템포 | 휴식시간 | 편측 | 메모/태그 |\n`;
        md += `|---|---|---|---|---|---|---|---|---|\n`;

        ex.sets.forEach((set) => {
          const e1rm = Math.round(set.weight * (1 + set.reps / 30));
          const tempoStr = set.tempo ? `${set.tempo.eccentric}-${set.tempo.pause}-${set.tempo.concentric}s` : '-';
          const restStr = set.restSeconds ? `${set.restSeconds}초` : '-';
          const sideStr = set.side === 'left' ? '좌(L)' : set.side === 'right' ? '우(R)' : set.side === 'both' ? '양쪽' : '-';
          const tagsStr = [...(set.tags || []), set.comment].filter(Boolean).join(', ') || '-';

          md += `| #${set.setNumber} | ${set.weight}kg | ${set.reps}회 | ${e1rm}kg | ${set.rpe || '-'} | ${tempoStr} | ${restStr} | ${sideStr} | ${tagsStr} |\n`;
        });
        md += `\n`;
      });
      md += `---\n\n`;
    });

    md += `## 🤖 AI 코치 분석 및 피드백 요청 (프롬프트 가이드)\n`;
    md += `위의 운동 일지를 바탕으로 다음 4가지 핵심 질문에 대해 전문 스트렝스/보디빌딩 코치 관점에서 정밀하게 답변해 주세요:\n\n`;
    md += `1. **점진적 과부하(Progressive Overload) 달성도**: 덤벨(한쪽 무게 기준) 및 스미스머신(봉 제외 원판 무게만 기준)의 특성을 감안하여, 주요 종목들의 세트별 실질 부하와 반복수 추이가 상승 곡선을 그리고 있는가?\n`;
    md += `2. **RPE 및 휴식 시간 기반 신경계 피로도(CNS Fatigue)**: 세트 후반 RPE 9.0~10.0 빈도와 세트 간 실제 쉰 시간, 템포(이완/수축)를 볼 때 피로 누적이 과도한가, 혹은 디로딩(Deload)이 필요한 시점인가?\n`;
    md += `3. **편측성(원암/투암) 및 슈퍼/컴파운드세트 평가**: 덤벨 및 원암 운동 시 좌/우 중량 및 횟수 밸런스, 그리고 슈퍼세트/컴파운드세트 종목 배치가 목표 근육 펌핑과 회복에 효율적인가?\n`;
    md += `4. **다음 주차 운동 처방 가이드**: 각 종목별로 다음 세션에 시도해야 할 권장 목표 중량(kg, 덤벨은 한쪽 기준)과 타겟 횟수(Reps)를 구체적으로 처방해 주세요.\n`;

    return md;
  };

  const getExportTargetSessions = () => {
    if (exportScope === 'selected') return dailySessions;
    if (exportScope === 'month') return monthlySessions;
    return sessions;
  };

  const currentMarkdown = useMemo(() => {
    return generateAiMarkdown(getExportTargetSessions());
  }, [exportScope, dailySessions, monthlySessions, sessions]);

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

  const handleDownloadMarkdown = () => {
    const filename = `iron-workout-${exportScope === 'selected' ? selectedDate : exportScope === 'month' ? currentMonth : 'all'}.md`;
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 상단 헤더 & AI 마크다운 추출 버튼 */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-2">
            <Calendar size={20} className="text-[#007AFF]" />
            운동 기록 조회
          </h2>
          <p className="text-xs text-gray-400">날짜별, 월별, 연별 운동 일지 및 AI 분석 추출</p>
        </div>

        {/* 🤖 AI 분석용 Markdown 추출 버튼 */}
        <button
          type="button"
          onClick={() => setIsAiExportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:opacity-95 text-white rounded-full text-xs font-black shadow-md shadow-blue-500/20 active:scale-98 transition"
        >
          <Bot size={14} />
          <span>AI 분석 추출</span>
        </button>
      </div>

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
        >
          일간 (날짜별)
        </button>
        <button
          type="button"
          onClick={() => setViewScope('monthly')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            viewScope === 'monthly'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          월간 (월별)
        </button>
        <button
          type="button"
          onClick={() => setViewScope('yearly')}
          className={`flex-1 py-1.5 rounded-xl transition ${
            viewScope === 'yearly'
              ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          연간 (년별)
        </button>
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
                    <RotateCcw size={13} className="text-[#007AFF]" />
                    <span>체험용 샘플 기록 불러오기</span>
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
                          {session.title || '오늘의 운동'}
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
                        <span className="text-sm font-black text-[#FF2D55]">
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
                          <Edit3 size={14} className="text-[#007AFF]" />
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
                      <MessageSquare size={14} className="text-[#007AFF] shrink-0 mt-0.5" />
                      <span>{session.notes}</span>
                    </div>
                  )}

                  {/* 세션 내 운동 종목 카드들 */}
                  <div className="space-y-3 pt-1">
                    {session.exercises.map((exItem, eIdx) => {
                      const base = EXERCISES_DATABASE.find((b) => b.id === exItem.exerciseId);
                      const exName = base?.name || '운동 종목';
                      const isGrouped = Boolean(exItem.groupId);

                      return (
                        <div
                          key={exItem.id || eIdx}
                          className={`p-3 rounded-2xl border ${
                            isGrouped
                              ? exItem.groupType === 'superset'
                                ? 'border-l-4 border-l-[#007AFF] border-black/5 dark:border-white/5 bg-[#F9F9FB]/80 dark:bg-[#222226]'
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
                                  exItem.groupType === 'superset' ? 'bg-[#007AFF]' : 'bg-[#FF9500]'
                                }`}>
                                  {exItem.groupLabel}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-gray-500 text-[10px] font-semibold">
                                {exItem.loadType === 'plate-loaded' ? '플레이트' : exItem.loadType === 'pin-loaded' ? '핀머신' : exItem.equipmentType}
                              </span>
                              {exItem.executionMode === 'unilateral' && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-[#007AFF] text-[10px] font-bold">
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
                                    {set.weight}kg × {set.reps}회
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
              <span className="text-xl font-black text-[#FF2D55]">
                {monthlySessions.reduce((s, x) => s + calculateSessionVolume(x), 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">kg</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block mb-0.5">평균 운동시간</span>
              <span className="text-xl font-black text-[#007AFF]">
                {monthlySessions.length > 0
                  ? Math.round(monthlySessions.reduce((s, x) => s + x.durationSeconds, 0) / monthlySessions.length / 60)
                  : 0} <span className="text-xs font-normal text-gray-400">분</span>
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
                        ? 'border border-[#007AFF] text-[#007AFF]'
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
                className="p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-[#007AFF] transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{s.conditionEmoji || '💪'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-[#1D1D1F] dark:text-white">{s.title || '오늘의 운동'}</h4>
                    <span className="text-[11px] text-gray-400">{s.date} · {s.exercises.length}개 종목</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#FF2D55]">{calculateSessionVolume(s).toLocaleString()}kg</span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(s)}
                      className="p-1 rounded-lg hover:bg-black/10 text-gray-400 hover:text-[#007AFF] transition"
                      title="수정"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(s.id, s.date)}
                      className="p-1 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-500 transition"
                      title="삭제"
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
              <span className="text-2xl font-black text-[#FF2D55]">
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
                          count > 0 ? 'bg-gradient-to-t from-[#007AFF] to-[#5856D6]' : ''
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
                <div className="p-2 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                    AI 분석용 Markdown 추출
                  </h3>
                  <p className="text-xs text-gray-400">ChatGPT, Claude, Gemini에 바로 붙여넣어 코칭받기</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiExportOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-400 transition"
              >
                ✕
              </button>
            </div>

            {/* Scope Selection */}
            <div className="px-4 py-2.5 bg-[#F9F9FB] dark:bg-[#18181A] border-b border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-gray-500">추출 범위:</span>
              <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-xl font-bold text-[11px]">
                <button
                  type="button"
                  onClick={() => setExportScope('selected')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    exportScope === 'selected'
                      ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  선택한 날 ({selectedDate})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('month')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    exportScope === 'month'
                      ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  이번 달 전체
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    exportScope === 'all'
                      ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  전체 기록
                </button>
              </div>
            </div>

            {/* Markdown Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#121214] text-gray-200 font-mono text-xs leading-relaxed select-all whitespace-pre-wrap">
              {currentMarkdown}
            </div>

            {/* Actions: Copy & Download */}
            <div className="p-4 border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#1C1C1E] flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                  copied
                    ? 'bg-[#34C759] text-white'
                    : 'bg-[#007AFF] hover:bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-98'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? '클립보드에 복사 완료!' : '클립보드에 복사 (ChatGPT용)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="px-4 py-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/10 text-[#1D1D1F] dark:text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
                title="Markdown (.md) 파일 다운로드"
              >
                <Download size={16} />
                <span>.md 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
