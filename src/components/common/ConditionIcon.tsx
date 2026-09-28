import { Activity, BatteryLow, Dumbbell, Flame, HeartPulse, Trophy, Zap } from 'lucide-react';

const icons = {
  '🔥': Flame,
  '💪': Dumbbell,
  '⚡': Zap,
  '🥱': BatteryLow,
  '🩹': HeartPulse,
  '🤕': Activity,
  '🚀': Trophy,
};

export function ConditionIcon({ condition, size = 16, className }: { condition?: string; size?: number; className?: string }) {
  const Icon = icons[condition as keyof typeof icons] || Dumbbell;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
