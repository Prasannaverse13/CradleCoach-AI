import { X } from 'lucide-react';

interface ActivitySummaryCardProps {
  type: 'sleep' | 'feed' | 'diaper' | 'mood' | 'daily';
  message: string;
  emoji: string;
  onDismiss: () => void;
}

export function ActivitySummaryCard({ type, message, emoji, onDismiss }: ActivitySummaryCardProps) {
  const colors = {
    sleep: 'from-indigo-500 to-indigo-600',
    feed: 'from-purple-500 to-purple-600',
    diaper: 'from-pink-500 to-pink-600',
    mood: 'from-amber-500 to-amber-600',
    daily: 'from-green-500 to-green-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[type]} rounded-2xl p-6 shadow-2xl text-white relative animate-slide-in`}>
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-90">
            AI Insight
          </div>
          <p className="text-lg font-medium leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}
