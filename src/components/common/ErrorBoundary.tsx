import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, RotateCcw } from 'lucide-react';
import { t } from '../../i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  scoped?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetState = () => {
    this.setState({ hasError: false, error: null });
  };

  handleExportBackup = () => {
    try {
      const keys = [
        'iron_workout_sessions_v1',
        'iron_custom_exercises_v1',
        'iron_active_session_v1',
        'iron_routines_v1',
        'iron_gym_equipment_v1',
      ];
      const backupData: Record<string, unknown> = {
        format: 'iron-muscle-emergency-backup',
        exportedAt: new Date().toISOString(),
      };
      keys.forEach(k => {
        try {
          const val = localStorage.getItem(k);
          backupData[k] = val ? JSON.parse(val) : null;
        } catch {
          backupData[k] = localStorage.getItem(k);
        }
      });
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iron-muscle-emergency-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to create emergency backup', e);
    }
  };

  handleClearActiveSession = () => {
    try {
      localStorage.removeItem('iron_active_session_v1');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.scoped) {
        return (
          <div className="p-6 m-4 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-center space-y-3">
            <AlertTriangle className="mx-auto text-red-500" size={32} />
            <h3 className="font-bold text-sm text-[#1D1D1F] dark:text-white">
              {t('일시적인 화면 오류가 발생했습니다')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {this.state.error?.message || t('작성 중이던 소중한 운동 기록을 보호하기 위해 복구 옵션을 제공합니다.')}
            </p>
            <button
              type="button"
              onClick={this.handleResetState}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer"
            >
              {t('화면 다시 시도')}
            </button>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-white dark:bg-[#121019] text-[#24212B] dark:text-[#F5F3F8] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-gray-50 dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-lg font-black text-[#1D1D1F] dark:text-white">
                {t('일시적인 화면 오류가 발생했습니다')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('작성 중이던 소중한 운동 기록을 보호하기 위해 복구 옵션을 제공합니다.')}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/5 dark:bg-black/40 text-[11px] text-gray-400 font-mono text-left break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-xl bg-accent text-white font-bold text-sm shadow-md hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={16} />
                {t('앱 다시 불러오기')}
              </button>

              <button
                type="button"
                onClick={this.handleExportBackup}
                className="w-full py-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-white font-bold text-xs hover:bg-black/10 dark:hover:bg-white/15 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                {t('데이터 백업 다운로드')}
              </button>

              <button
                type="button"
                onClick={this.handleClearActiveSession}
                className="w-full py-2 px-4 rounded-xl text-red-500 dark:text-red-400 font-medium text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={12} />
                {t('진행 중 세션 초기화')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
