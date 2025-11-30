import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Utensils, Calendar, TrendingUp } from 'lucide-react';

interface GoalsSelectionProps {
  onComplete: () => void;
}

const GOALS = [
  { id: 'better_sleep', label: 'Better Sleep', icon: Moon, description: 'Establish healthy sleep patterns' },
  { id: 'better_feeding', label: 'Better Feeding', icon: Utensils, description: 'Improve feeding rhythm' },
  { id: 'routines', label: 'Build Routines', icon: Calendar, description: 'Create consistent daily routines' },
  { id: 'milestones', label: 'Track Milestones', icon: TrendingUp, description: 'Monitor development progress' },
];

export function GoalsSelection({ onComplete }: GoalsSelectionProps) {
  const { user, activeChild } = useAuth();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : prev.length < 2
        ? [...prev, goalId]
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGoals.length === 0) {
      setError('Please select at least one goal');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const goals = selectedGoals.map(goalType => ({
        parent_id: user!.id,
        child_id: activeChild!.id,
        goal_type: goalType,
      }));

      const { error: insertError } = await supabase
        .from('parent_goals')
        .insert(goals);

      if (insertError) throw insertError;

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to save goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">What would you like to focus on?</h2>
          <p className="text-gray-600">Choose up to 2 goals to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOALS.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                type="button"
                onClick={() => toggleGoal(id)}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${
                  selectedGoals.includes(id)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${
                    selectedGoals.includes(id) ? 'bg-blue-600' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      selectedGoals.includes(id) ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            {selectedGoals.length} of 2 goals selected
          </div>

          <button
            type="submit"
            disabled={loading || selectedGoals.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Start Parenting Journey'}
          </button>
        </form>
      </div>
    </div>
  );
}
