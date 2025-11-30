import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LogModalProps {
  type: string;
  childId: string;
  onClose: () => void;
  onComplete: (type: string) => void;
}

export function LogModal({ type, childId, onClose, onComplete }: LogModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [sleepData, setSleepData] = useState({
    start_time: new Date().toISOString().slice(0, 16),
    end_time: '',
    type: 'nap' as 'nap' | 'night',
    notes: '',
  });

  const [feedData, setFeedData] = useState({
    time: new Date().toISOString().slice(0, 16),
    type: 'breast' as 'breast' | 'formula' | 'solid',
    side: 'both',
    duration_minutes: 0,
    quantity_ml: 0,
    food_description: '',
    notes: '',
  });

  const [diaperData, setDiaperData] = useState({
    time: new Date().toISOString().slice(0, 16),
    type: 'wet' as 'wet' | 'dirty' | 'both',
    notes: '',
  });

  const [moodData, setMoodData] = useState({
    time: new Date().toISOString().slice(0, 16),
    mood: 'calm' as 'fussy' | 'calm' | 'happy' | 'sick',
    event_type: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'sleep') {
        const { error: insertError } = await supabase
          .from('logs_sleep')
          .insert({
            child_id: childId,
            ...sleepData,
            end_time: sleepData.end_time || null,
          });
        if (insertError) throw insertError;
      } else if (type === 'feed') {
        const { error: insertError } = await supabase
          .from('logs_feed')
          .insert({
            child_id: childId,
            ...feedData,
          });
        if (insertError) throw insertError;
      } else if (type === 'diaper') {
        const { error: insertError } = await supabase
          .from('logs_diaper')
          .insert({
            child_id: childId,
            ...diaperData,
          });
        if (insertError) throw insertError;
      } else if (type === 'mood') {
        const { error: insertError } = await supabase
          .from('logs_mood')
          .insert({
            child_id: childId,
            ...moodData,
          });
        if (insertError) throw insertError;
      }

      onComplete(type);
    } catch (err: any) {
      setError(err.message || 'Failed to save log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 capitalize">Log {type}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'sleep' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['nap', 'night'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSleepData({ ...sleepData, type: option as any })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        sleepData.type === option
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={sleepData.start_time}
                  onChange={e => setSleepData({ ...sleepData, start_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (optional)</label>
                <input
                  type="datetime-local"
                  value={sleepData.end_time}
                  onChange={e => setSleepData({ ...sleepData, end_time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={sleepData.notes}
                  onChange={e => setSleepData({ ...sleepData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'feed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['breast', 'formula', 'solid'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFeedData({ ...feedData, type: option as any })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        feedData.type === option
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="datetime-local"
                  value={feedData.time}
                  onChange={e => setFeedData({ ...feedData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {feedData.type === 'breast' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['left', 'right', 'both'].map(option => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFeedData({ ...feedData, side: option })}
                          className={`px-4 py-3 rounded-xl font-medium transition-all ${
                            feedData.side === option
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={feedData.duration_minutes}
                      onChange={e => setFeedData({ ...feedData, duration_minutes: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      min="0"
                    />
                  </div>
                </>
              )}

              {feedData.type === 'formula' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (ml)</label>
                  <input
                    type="number"
                    value={feedData.quantity_ml}
                    onChange={e => setFeedData({ ...feedData, quantity_ml: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                    min="0"
                  />
                </div>
              )}

              {feedData.type === 'solid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Description</label>
                  <input
                    type="text"
                    value={feedData.food_description}
                    onChange={e => setFeedData({ ...feedData, food_description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., mashed banana"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={feedData.notes}
                  onChange={e => setFeedData({ ...feedData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'diaper' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['wet', 'dirty', 'both'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDiaperData({ ...diaperData, type: option as any })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        diaperData.type === option
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="datetime-local"
                  value={diaperData.time}
                  onChange={e => setDiaperData({ ...diaperData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={diaperData.notes}
                  onChange={e => setDiaperData({ ...diaperData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                  rows={2}
                />
              </div>
            </>
          )}

          {type === 'mood' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <div className="grid grid-cols-2 gap-3">
                  {['fussy', 'calm', 'happy', 'sick'].map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMoodData({ ...moodData, mood: option as any })}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        moodData.mood === option
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="datetime-local"
                  value={moodData.time}
                  onChange={e => setMoodData({ ...moodData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event (optional)</label>
                <input
                  type="text"
                  value={moodData.event_type}
                  onChange={e => setMoodData({ ...moodData, event_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                  placeholder="e.g., vaccination, travel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={moodData.notes}
                  onChange={e => setMoodData({ ...moodData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500"
                  rows={2}
                />
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </div>
    </div>
  );
}
