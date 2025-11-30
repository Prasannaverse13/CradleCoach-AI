import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Insight } from '../../lib/supabase';
import { Moon, Utensils, Baby, Smile, MessageCircle, TrendingUp, Bell, Sparkles, Target, Heart } from 'lucide-react';
import { LogModal } from './LogModal';
import { InsightCard } from './InsightCard';
import { SmartSuggestions } from './SmartSuggestions';
import { ActivitySummaryCard } from './ActivitySummaryCard';
import {
  dailySummaryAgent,
  sleepCoachAgent,
  feedingAgent,
  routinePlannerAgent
} from '../../lib/aiAgents';

export function Dashboard() {
  const { activeChild, parent, signOut } = useAuth();
  const [showLogModal, setShowLogModal] = useState<string | null>(null);

  useEffect(() => {
    console.log('Modal state changed:', showLogModal);
    console.log('Active child:', activeChild);
  }, [showLogModal, activeChild]);
  const [todayLogs, setTodayLogs] = useState({
    sleep: 0,
    feed: 0,
    diaper: 0,
    mood: '',
  });
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyStatus, setDailyStatus] = useState({ status: '', emoji: '', color: '' });
  const [insightSummary, setInsightSummary] = useState('');
  const [smartSuggestions, setSmartSuggestions] = useState({
    sleep: '',
    feeding: '',
    routine: '',
  });
  const [activitySummary, setActivitySummary] = useState<{
    type: 'sleep' | 'feed' | 'diaper' | 'mood' | 'daily';
    message: string;
    emoji: string;
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (activeChild) {
      loadTodayData();
      loadInsights();
    }
  }, [activeChild]);

  useEffect(() => {
    if (activeChild && !loading) {
      loadAIInsights();
      checkEndOfDaySummary();
    }
  }, [activeChild, loading, todayLogs]);

  const checkEndOfDaySummary = () => {
    const hour = new Date().getHours();
    const totalActivities = todayLogs.sleep + todayLogs.feed + todayLogs.diaper;

    if (hour >= 20 && totalActivities > 0 && !activitySummary) {
      const message = generateEndOfDaySummary();
      if (message) {
        setActivitySummary({
          type: 'daily',
          message,
          emoji: '🌟'
        });
      }
    }
  };

  const generateEndOfDaySummary = (): string => {
    const { sleep, feed, diaper } = todayLogs;

    if (sleep + feed + diaper === 0) return '';

    let summary = `Today's Summary: `;
    const highlights: string[] = [];

    if (sleep >= 3) {
      highlights.push(`excellent sleep with ${sleep} sessions`);
    } else if (sleep >= 2) {
      highlights.push(`${sleep} good naps`);
    }

    if (feed >= 8) {
      highlights.push(`great feeding rhythm (${feed} feeds)`);
    } else if (feed >= 5) {
      highlights.push(`${feed} healthy feeds`);
    }

    if (diaper >= 8) {
      highlights.push(`perfect hydration (${diaper} changes)`);
    }

    if (highlights.length > 0) {
      summary += highlights.join(', ') + `. ${activeChild?.name} had a wonderful day! Research shows consistent routines like yours support healthy development.`;
    } else {
      summary += `You logged ${sleep} sleep, ${feed} feeds, ${diaper} diapers today. Every day of caring for ${activeChild?.name} is meaningful!`;
    }

    return summary;
  };

  const loadTodayData = async () => {
    if (!activeChild) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const [sleepRes, feedRes, diaperRes, moodRes] = await Promise.all([
      supabase
        .from('logs_sleep')
        .select('*')
        .eq('child_id', activeChild.id)
        .gte('start_time', todayStr),
      supabase
        .from('logs_feed')
        .select('*')
        .eq('child_id', activeChild.id)
        .gte('time', todayStr),
      supabase
        .from('logs_diaper')
        .select('*')
        .eq('child_id', activeChild.id)
        .gte('time', todayStr),
      supabase
        .from('logs_mood')
        .select('*')
        .eq('child_id', activeChild.id)
        .gte('time', todayStr)
        .order('time', { ascending: false })
        .limit(1),
    ]);

    setTodayLogs({
      sleep: sleepRes.data?.length || 0,
      feed: feedRes.data?.length || 0,
      diaper: diaperRes.data?.length || 0,
      mood: moodRes.data?.[0]?.mood || '',
    });

    setLoading(false);
  };

  const loadInsights = async () => {
    if (!activeChild) return;

    const { data } = await supabase
      .from('insights')
      .select('*')
      .eq('child_id', activeChild.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setInsights(data);
    }
  };

  const loadAIInsights = async () => {
    if (!activeChild) return;

    const context = {
      child: activeChild,
      recentLogs: todayLogs,
    };

    try {
      const [status, summary, sleepTip, feedingTip, routineTip] = await Promise.all([
        dailySummaryAgent.generateDailyStatus(context),
        dailySummaryAgent.generateInsightSummary(context),
        sleepCoachAgent.getSleepTip(context),
        feedingAgent.getFeedingAdvice(context),
        routinePlannerAgent.getRoutineSuggestion(context),
      ]);

      setDailyStatus(status);
      setInsightSummary(summary);
      setSmartSuggestions({
        sleep: sleepTip,
        feeding: feedingTip,
        routine: routineTip,
      });
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleLogComplete = async (type: string) => {
    setShowLogModal(null);
    await loadTodayData();
    generateActivitySummary(type);
  };

  const generateActivitySummary = (type: string) => {
    const count = todayLogs[type as keyof typeof todayLogs];
    let message = '';
    let emoji = '';

    if (type === 'sleep') {
      const totalCount = (typeof count === 'number' ? count : 0) + 1;
      if (totalCount >= 3) {
        emoji = '😴';
        message = `Excellent! ${totalCount} sleep sessions today. ${activeChild?.name} is getting great rest for healthy development!`;
      } else if (totalCount >= 2) {
        emoji = '🌙';
        message = `Good progress! ${totalCount} naps so far. Research shows consistent sleep patterns support brain development.`;
      } else {
        emoji = '💤';
        message = `First nap logged! Keep tracking to build healthy sleep routines for ${activeChild?.name}.`;
      }
    } else if (type === 'feed') {
      const totalCount = (typeof count === 'number' ? count : 0) + 1;
      if (totalCount >= 8) {
        emoji = '🍼';
        message = `Wonderful! ${totalCount} feeds today. Great responsive feeding rhythm supporting ${activeChild?.name}'s growth!`;
      } else if (totalCount >= 5) {
        emoji = '💚';
        message = `${totalCount} feeds tracked. Feeding frequency looks healthy - you're doing great!`;
      } else {
        emoji = '🥛';
        message = `${totalCount} feed${totalCount > 1 ? 's' : ''} today. Research shows responsive feeding (following baby's cues) is key!`;
      }
    } else if (type === 'diaper') {
      const totalCount = (typeof count === 'number' ? count : 0) + 1;
      if (totalCount >= 8) {
        emoji = '✨';
        message = `${totalCount} diaper changes! Excellent hydration and nutrition indicator. ${activeChild?.name} is thriving!`;
      } else if (totalCount >= 6) {
        emoji = '💚';
        message = `Good hydration! ${totalCount} changes show ${activeChild?.name} is well-fed and healthy.`;
      } else {
        emoji = '👶';
        message = `${totalCount} diaper${totalCount > 1 ? 's' : ''} changed. Keep tracking - it's a great health indicator!`;
      }
    } else if (type === 'mood') {
      emoji = '😊';
      message = `Mood logged! Tracking ${activeChild?.name}'s emotional state helps you understand patterns and needs.`;
    }

    setActivitySummary({ type: type as any, message, emoji });
    setTimeout(() => setActivitySummary(null), 10000);
  };

  const getAgeInMonths = () => {
    if (!activeChild) return 0;
    const birth = new Date(activeChild.date_of_birth);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return Math.max(0, months);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-transform shadow-lg">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CradleCoach
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-900 font-semibold border-b-2 border-indigo-600 pb-1">Dashboard</a>
            <a href="/milestones" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Trends</a>
            <a href="/resources" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Resources</a>
            <a href="/stories" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Stories</a>
          </nav>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-indigo-50 rounded-xl transition-all transform hover:scale-110 relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-xl">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Welcome to CradleCoach!</p>
                        <p className="text-xs text-gray-600 mt-1">Start logging activities to get personalized insights.</p>
                        <p className="text-xs text-gray-400 mt-1">Just now</p>
                      </div>
                    </div>
                    <div className="text-center py-4 text-gray-500 text-sm">
                      You're all caught up!
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <span className="text-sm font-bold text-white">{parent?.name?.charAt(0) || 'U'}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-bold text-gray-900">{parent?.name || 'User'}</p>
                    <p className="text-sm text-gray-600">{parent?.email || ''}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        window.location.href = '/profile';
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activitySummary && (
          <div className="fixed top-24 right-6 z-50 max-w-md animate-slide-in">
            <ActivitySummaryCard
              type={activitySummary.type}
              message={activitySummary.message}
              emoji={activitySummary.emoji}
              onDismiss={() => setActivitySummary(null)}
            />
          </div>
        )}

        <section className="relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-300/30 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -right-20 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl"></div>

          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center">
              <span className="animate-bounce mr-3">👋</span>
              {getGreeting()}, {parent?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Here's how things are going with <span className="font-semibold text-indigo-600">{activeChild?.name}</span> today.
            </p>

            {dailyStatus.emoji && (
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-lg">
                <span className="text-2xl">{dailyStatus.emoji}</span>
                <div>
                  <div className="text-sm text-gray-500">Today looks</div>
                  <div className="font-semibold text-gray-900">{dailyStatus.status}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="relative">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-indigo-600" />
                  What's happening now?
                </h2>
                <p className="text-gray-600 mt-1">Log what's going on with your baby in 2 taps.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  console.log('Sleep button clicked!');
                  setShowLogModal('sleep');
                }}
                className="group relative bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Moon className="w-8 h-8 relative z-10" strokeWidth={2} />
                <span className="font-semibold text-lg relative z-10">Log Sleep</span>
              </button>

              <button
                onClick={() => {
                  console.log('Feed button clicked!');
                  setShowLogModal('feed');
                }}
                className="group relative bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Utensils className="w-8 h-8 relative z-10" strokeWidth={2} />
                <span className="font-semibold text-lg relative z-10">Log Feed</span>
              </button>

              <button
                onClick={() => {
                  console.log('Diaper button clicked!');
                  setShowLogModal('diaper');
                }}
                className="group relative bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Baby className="w-8 h-8 relative z-10" strokeWidth={2} />
                <span className="font-semibold text-lg relative z-10">Log Diaper</span>
              </button>

              <button
                onClick={() => {
                  console.log('Mood button clicked!');
                  setShowLogModal('mood');
                }}
                className="group relative bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 transition-all transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Smile className="w-8 h-8 relative z-10" strokeWidth={2} />
                <span className="font-semibold text-lg relative z-10">Log Mood</span>
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-indigo-600" />
              Today's Snapshot
            </h2>
          </div>

          {insightSummary && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6">
              <p className="text-indigo-900 font-medium">{insightSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-2 text-indigo-600 mb-3">
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium">Total Sleep</span>
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-1">{todayLogs.sleep}</div>
              <div className="text-sm text-gray-600">sessions</div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-2 text-purple-600 mb-3">
                <Utensils className="w-5 h-5" />
                <span className="text-sm font-medium">Feeds</span>
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-1">{todayLogs.feed}</div>
              <div className="text-sm text-gray-600">times</div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-2 text-pink-600 mb-3">
                <Baby className="w-5 h-5" />
                <span className="text-sm font-medium">Diapers</span>
              </div>
              <div className="text-5xl font-bold text-gray-900 mb-1">{todayLogs.diaper}</div>
              <div className="text-sm text-gray-600">changes</div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-transform">
              <div className="flex items-center space-x-2 text-amber-600 mb-3">
                <Smile className="w-5 h-5" />
                <span className="text-sm font-medium">Mood</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 capitalize">
                {todayLogs.mood || 'Not set'}
              </div>
            </div>
          </div>
        </section>

        <SmartSuggestions suggestions={smartSuggestions} childName={activeChild?.name || 'Baby'} />

        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-indigo-600" />
            Ask your AI Coach
          </h2>
          <p className="text-gray-600 mb-6">What can I help you with?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <a
              href="/chat?q=Why+is+baby+waking+at+night"
              className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl p-4 text-indigo-900 font-medium transition-all text-center"
            >
              Why is baby waking at night?
            </a>
            <a
              href="/chat?q=Is+this+feeding+schedule+okay"
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-purple-900 font-medium transition-all text-center"
            >
              Is this feeding schedule okay?
            </a>
            <a
              href="/chat?q=How+do+I+build+bedtime+routine"
              className="bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl p-4 text-pink-900 font-medium transition-all text-center"
            >
              How do I build a bedtime routine?
            </a>
            <a
              href="/chat?q=I+feel+overwhelmed+today"
              className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl p-4 text-amber-900 font-medium transition-all text-center"
            >
              I feel overwhelmed today
            </a>
          </div>

          <a
            href="/chat"
            className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl p-4 font-semibold text-center transition-all transform hover:scale-105 shadow-lg"
          >
            Start Chat with AI Coach →
          </a>
        </section>

        <section className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                Milestones & Activities
              </h2>
              <p className="text-indigo-100 text-lg">This week's focus: Neck strength & rolling practice</p>
            </div>
            <a
              href="/milestones"
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg"
            >
              View Milestones →
            </a>
          </div>
        </section>
      </main>

      {showLogModal && activeChild && (
        <LogModal
          type={showLogModal}
          childId={activeChild.id}
          onClose={() => setShowLogModal(null)}
          onComplete={handleLogComplete}
        />
      )}

      {showLogModal && !activeChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm">
            <p className="text-red-600">No active child found. Please refresh the page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
