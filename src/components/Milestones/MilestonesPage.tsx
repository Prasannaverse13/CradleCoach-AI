import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Milestone } from '../../lib/supabase';
import { ArrowLeft, Check, Calendar } from 'lucide-react';

const MILESTONE_CATEGORIES = {
  '0-3': [
    'Lifts head when on tummy',
    'Follows objects with eyes',
    'Responds to sounds',
    'Smiles at people',
    'Brings hands to mouth',
  ],
  '4-6': [
    'Rolls over',
    'Sits with support',
    'Reaches for toys',
    'Babbles',
    'Laughs',
  ],
  '7-9': [
    'Sits without support',
    'Crawls',
    'Stands with support',
    'Says first words',
    'Picks up small objects',
  ],
  '10-12': [
    'Pulls to stand',
    'Cruises along furniture',
    'First steps',
    'Says 1-2 words',
    'Waves bye-bye',
  ],
  '13-18': [
    'Walks independently',
    'Says 5-10 words',
    'Uses spoon',
    'Drinks from cup',
    'Points to objects',
  ],
  '19-24': [
    'Runs',
    'Kicks ball',
    'Says 2-word phrases',
    'Follows simple instructions',
    'Scribbles with crayons',
  ],
};

export function MilestonesPage() {
  const { activeChild } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeChild) {
      loadMilestones();
      loadActivities();
    }
  }, [activeChild]);

  const loadMilestones = async () => {
    if (!activeChild) return;

    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', activeChild.id)
      .order('achieved_at', { ascending: false });

    if (data) {
      setMilestones(data);
    }
    setLoading(false);
  };

  const loadActivities = () => {
    if (!activeChild) return;

    const ageInMonths = getAgeInMonths();
    const activities = getActivitiesForAge(ageInMonths);
    setActivities(activities);
  };

  const getAgeInMonths = () => {
    if (!activeChild) return 0;
    const birth = new Date(activeChild.date_of_birth);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  const getAgeCategory = (months: number): string => {
    if (months < 4) return '0-3';
    if (months < 7) return '4-6';
    if (months < 10) return '7-9';
    if (months < 13) return '10-12';
    if (months < 19) return '13-18';
    return '19-24';
  };

  const getActivitiesForAge = (months: number): string[] => {
    if (months < 4) {
      return [
        'Tummy time for 3-5 minutes',
        'Eye contact and talking',
        'Tracking objects with eyes',
        'Gentle massage',
        'Singing and soft music',
      ];
    } else if (months < 7) {
      return [
        'Rolling practice',
        'Grasping colorful toys',
        'Mirror play',
        'Reading simple books',
        'Supported sitting',
      ];
    } else if (months < 10) {
      return [
        'Crawling obstacles course',
        'Peek-a-boo games',
        'Stacking soft blocks',
        'Playing with textured toys',
        'Practicing standing with support',
      ];
    } else if (months < 13) {
      return [
        'Cruising practice',
        'Push and pull toys',
        'Simple shape sorters',
        'Naming objects',
        'Playing with balls',
      ];
    } else if (months < 19) {
      return [
        'Walking games',
        'Reading picture books',
        'Simple puzzles',
        'Drawing with crayons',
        'Dancing to music',
      ];
    } else {
      return [
        'Running and jumping',
        'Kicking and throwing balls',
        'Pretend play',
        'Building with blocks',
        'Singing songs together',
      ];
    }
  };

  const toggleMilestone = async (milestoneType: string, isChecked: boolean) => {
    if (!activeChild) return;

    if (isChecked) {
      const existing = milestones.find(m => m.milestone_type === milestoneType);
      if (existing) {
        await supabase
          .from('milestones')
          .delete()
          .eq('id', existing.id);
      }
    } else {
      await supabase
        .from('milestones')
        .insert({
          child_id: activeChild.id,
          milestone_type: milestoneType,
          achieved_at: new Date().toISOString(),
        });
    }

    await loadMilestones();
  };

  const isMilestoneChecked = (milestoneType: string) => {
    return milestones.some(m => m.milestone_type === milestoneType);
  };

  const ageInMonths = getAgeInMonths();
  const ageCategory = getAgeCategory(ageInMonths);
  const relevantMilestones = MILESTONE_CATEGORIES[ageCategory as keyof typeof MILESTONE_CATEGORIES] || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <a href="/" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </a>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Milestones & Activities</h1>
            <p className="text-sm text-gray-600">
              {activeChild?.name} - {ageInMonths} months old
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">This Week's Focus</h2>
          <p className="text-green-50">
            Encourage exploration and practice new skills through play
          </p>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Activity Pack ({ageInMonths} months)</span>
          </h2>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-xl">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-900">{activity}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Milestones ({ageCategory} months)
          </h2>
          <div className="space-y-2">
            {relevantMilestones.map((milestone, index) => {
              const isChecked = isMilestoneChecked(milestone);
              return (
                <button
                  key={index}
                  onClick={() => toggleMilestone(milestone, isChecked)}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                    isChecked
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isChecked ? 'bg-green-600' : 'border-2 border-gray-300'
                  }`}>
                    {isChecked && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`flex-1 text-left ${
                    isChecked ? 'text-green-900 font-medium' : 'text-gray-700'
                  }`}>
                    {milestone}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900">
              <strong>Remember:</strong> Every child develops at their own pace. These are general guidelines.
              If you have concerns, consult your pediatrician.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
