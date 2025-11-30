import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Baby, Moon, Utensils, TrendingUp, MessageCircle, Check } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [premiumEmail, setPremiumEmail] = useState('');
  const [premiumSubmitted, setPremiumSubmitted] = useState(false);
  const [premiumError, setPremiumError] = useState('');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email, parent_stage: 'general' });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already on the waitlist!');
        } else {
          throw insertError;
        }
        return;
      }

      setSubmitted(true);
      setEmail('');
    } catch (err: any) {
      setError('Failed to join waitlist. Please try again.');
    }
  };

  const handlePremiumWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setPremiumError('');

    try {
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert({ email: premiumEmail, parent_stage: 'premium_interest' });

      if (insertError) {
        if (insertError.code === '23505') {
          setPremiumError('This email is already on the waitlist!');
        } else {
          throw insertError;
        }
        return;
      }

      setPremiumSubmitted(true);
      setPremiumEmail('');
    } catch (err: any) {
      setPremiumError('Failed to join waitlist. Please try again.');
    }
  };

  const floatingEmojis = [
    { emoji: '📚', top: '5%', left: '2%', delay: '0s', duration: '20s' },
    { emoji: '🤗', top: '12%', right: '3%', delay: '2s', duration: '25s' },
    { emoji: '👶', top: '25%', left: '1%', delay: '4s', duration: '22s' },
    { emoji: '👧', top: '38%', right: '2%', delay: '1s', duration: '24s' },
    { emoji: '🤱', top: '48%', left: '2%', delay: '3s', duration: '26s' },
    { emoji: '🎪', top: '58%', right: '1%', delay: '5s', duration: '23s' },
    { emoji: '🐣', top: '18%', right: '96%', delay: '2s', duration: '21s' },
    { emoji: '🍼', top: '68%', left: '3%', delay: '6s', duration: '25s' },
    { emoji: '🎡', top: '75%', right: '2%', delay: '1s', duration: '27s' },
    { emoji: '🎈', top: '82%', left: '2%', delay: '4s', duration: '22s' },
    { emoji: '🧩', top: '90%', right: '3%', delay: '3s', duration: '24s' },
    { emoji: '🧸', top: '32%', right: '97%', delay: '5s', duration: '26s' },
    { emoji: '😊', top: '52%', right: '96%', delay: '2s', duration: '23s' },
    { emoji: '👶', top: '72%', right: '97%', delay: '4s', duration: '25s' },
    { emoji: '👧', top: '95%', left: '1%', delay: '1s', duration: '21s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(5deg);
          }
        }
        .floating-emoji {
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        @media (max-width: 768px) {
          .floating-emoji {
            display: none;
          }
        }
      `}</style>

      {floatingEmojis.map((item, index) => (
        <div
          key={index}
          className="floating-emoji absolute text-5xl opacity-15 pointer-events-none select-none"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            '--delay': item.delay,
            '--duration': item.duration,
          } as any}
        >
          {item.emoji}
        </div>
      ))}

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Baby className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CradleCoach</span>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI Co-Pilot for Parenting
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Finally, parenting guidance that adapts to your child. Track sleep, feeding, and milestones while getting personalized insights powered by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
              >
                Start Free Today
              </button>
              <a
                href="#features"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg border-2 border-gray-200"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Moon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">Sleep</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Utensils className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">Feeding</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-8 h-8 text-pink-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">AI Chat</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Moon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Sleep Tracking</h3>
              <p className="text-gray-600">
                Log naps and night sleep with one tap. Get insights on the best sleep windows and routines for your baby.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Utensils className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Feeding Insights</h3>
              <p className="text-gray-600">
                Track breastfeeding, formula, and solids. Understand patterns and identify potential sensitivities.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Milestone Tracking</h3>
              <p className="text-gray-600">
                Track developmental milestones and get age-appropriate activity suggestions for your child.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Parenting Chat</h3>
              <p className="text-gray-600">
                Ask anything, anytime. Get empathetic, evidence-based guidance from our AI parenting assistant.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Baby className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Logging</h3>
              <p className="text-gray-600">
                Designed for one-hand use. Log everything quickly while holding your baby.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Personalized Routines</h3>
              <p className="text-gray-600">
                Get customized routine suggestions based on your baby's unique patterns and your parenting goals.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start for free. Upgrade anytime to unlock personalized plans and unlimited AI support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 ml-2">/forever</span>
                </div>
                <p className="text-gray-600">Perfect for getting started with parenting tracking</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Sleep, feed, diaper & mood logging</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Daily snapshot & insights</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Limited AI chat (10 questions/month)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Weekly routine suggestions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Milestone tracking</span>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-4 rounded-xl transition-colors"
              >
                Get Started Free
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-8 shadow-2xl relative text-white">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                  Coming Soon
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-5xl font-bold">$9.99</span>
                  <span className="text-blue-100 ml-2">/month</span>
                </div>
                <p className="text-blue-50">Everything you need for confident parenting</p>
                <p className="text-sm text-blue-100 mt-2">
                  or $79.99/year (save 33%)
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-white font-medium">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Unlimited AI parenting coach</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Personalized sleep & feeding plans</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Daily routine suggestions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Milestone activities calendar</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Daily email/WhatsApp summaries</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Multi-child support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-blue-50">Export logs for doctor visits</span>
                </div>
              </div>

              {!premiumSubmitted ? (
                <form onSubmit={handlePremiumWaitlist}>
                  <div className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={premiumEmail}
                      onChange={(e) => setPremiumEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl text-gray-900 focus:ring-4 focus:ring-white focus:ring-opacity-50"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 rounded-xl transition-colors"
                    >
                      Join Premium Waitlist
                    </button>
                  </div>
                  {premiumError && (
                    <div className="mt-3 text-red-200 text-sm text-center">
                      {premiumError}
                    </div>
                  )}
                </form>
              ) : (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <Check className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">
                    You're on the list! We'll notify you when Premium launches.
                  </p>
                </div>
              )}

              <p className="text-xs text-blue-100 mt-4 text-center">
                7-day free trial included • Cancel anytime
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-sm text-gray-700 text-center">
                <strong>Important:</strong> CradleCoach is a safe, non-medical support tool based on parenting psychology & research. It is not a replacement for doctors. Always consult your pediatrician for health concerns. Your baby's data stays private & encrypted.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Parenting is Hard. We're Here to Help.
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Join thousands of parents who are finding confidence and calm with CradleCoach.
            </p>

            {!submitted ? (
              <form onSubmit={handleWaitlistSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:ring-4 focus:ring-white focus:ring-opacity-50"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-4 rounded-xl transition-colors"
                  >
                    Join Waitlist
                  </button>
                </div>
                {error && (
                  <div className="mt-3 text-red-200 text-sm">
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto">
                <Check className="w-12 h-12 text-white mx-auto mb-3" />
                <p className="text-white text-lg font-medium">
                  Thanks for joining! We'll be in touch soon.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="bg-blue-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Create your free account and start tracking today.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
            >
              Get Started Free
            </button>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Baby className="w-6 h-6" />
            <span className="text-xl font-bold">CradleCoach</span>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Your AI co-pilot for parenting newborns to 3-year-olds
          </p>
          <p className="text-gray-500 text-xs">
            CradleCoach provides informational support only and is not a substitute for medical advice.
            Always consult your pediatrician for health concerns.
          </p>
        </div>
      </footer>
    </div>
  );
}
