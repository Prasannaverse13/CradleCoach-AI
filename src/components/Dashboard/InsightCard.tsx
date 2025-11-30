import { Insight } from '../../lib/supabase';
import { Moon, Utensils, Activity, TrendingUp, Lightbulb, Heart } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
}

const INSIGHT_ICONS = {
  sleep: Moon,
  feeding: Utensils,
  digestive: Activity,
  activity: TrendingUp,
};

const INSIGHT_BUTTON_TEXT = {
  sleep: 'See Sleep Tips',
  feeding: 'Read More',
  digestive: 'Learn Why',
  activity: 'Parent Resources',
};

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = INSIGHT_ICONS[insight.insight_type] || Lightbulb;
  const buttonText = INSIGHT_BUTTON_TEXT[insight.insight_type] || 'Read More';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
      <div className="flex items-start space-x-4 flex-1">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-7 h-7 text-indigo-600" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 mb-2 text-lg">{insight.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
        </div>
      </div>
      <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-5 py-2.5 rounded-full font-medium text-sm transition-colors flex-shrink-0 ml-4">
        {buttonText}
      </button>
    </div>
  );
}
