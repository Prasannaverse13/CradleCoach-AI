import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Sparkles, Loader2, Baby, Home, Volume2, VolumeX, Music } from 'lucide-react';

export function StoriesPage() {
  const { activeChild } = useAuth();
  const [toyInput, setToyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [generateAudio, setGenerateAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);

  const handleGenerateStory = async () => {
    if (!toyInput.trim()) {
      setError('Please describe the toy or game');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setAudioUrl(null);
    setMusicUrl(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName: activeChild?.name || 'your child',
          childAge: activeChild?.date_of_birth
            ? Math.floor((Date.now() - new Date(activeChild.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
            : 1,
          toy: toyInput,
          generateAudio: generateAudio,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setStory(data.story);
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
      if (data.musicUrl) {
        setMusicUrl(data.musicUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  const toggleMusic = () => {
    if (musicRef.current) {
      if (isPlayingMusic) {
        musicRef.current.pause();
      } else {
        musicRef.current.play();
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Story Generator</h1>
              <p className="text-sm text-gray-600">AI-powered bedtime stories</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Baby className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create a Magical Story for {activeChild?.name}
              </h2>
              <p className="text-gray-600">
                Tell us about the toy, game, or object your child is playing with, and our AI will create a personalized bedtime story you can read together.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="toy" className="block text-sm font-medium text-gray-700 mb-2">
                What toy or game is {activeChild?.name} playing with?
              </label>
              <textarea
                id="toy"
                value={toyInput}
                onChange={(e) => setToyInput(e.target.value)}
                placeholder="e.g., a red fire truck, building blocks, a teddy bear, a toy dinosaur..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-2">
                Be descriptive! The more details you provide, the more personalized the story will be.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-gray-700">Generate audio narration with background music (powered by Gemini AI)</span>
              </div>
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                Coming Soon
              </span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateStory}
              disabled={loading || !toyInput.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Crafting your story...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Story
                </>
              )}
            </button>
          </div>
        </div>

        {story && (
          <div className="bg-white rounded-3xl shadow-xl p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">Your Magical Story</h3>
            </div>

            {(audioUrl || musicUrl) && (
              <div className="mb-6 space-y-3">
                {audioUrl && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Story Narration</span>
                      </div>
                      <button
                        onClick={toggleAudio}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                      >
                        {isPlayingAudio ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlayingAudio(false)}
                      className="hidden"
                    />
                  </div>
                )}

                {musicUrl && (
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Music className="w-5 h-5 text-pink-600" />
                        <span className="text-sm font-medium text-gray-900">Background Music</span>
                      </div>
                      <button
                        onClick={toggleMusic}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl transition-colors"
                      >
                        {isPlayingMusic ? (
                          <>
                            <VolumeX className="w-4 h-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Music className="w-4 h-4" />
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    </div>
                    <audio
                      ref={musicRef}
                      src={musicUrl}
                      loop
                      onEnded={() => setIsPlayingMusic(false)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                {story.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-800 leading-relaxed mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setStory('');
                  setAudioUrl(null);
                  setMusicUrl(null);
                  setToyInput('');
                  setIsPlayingAudio(false);
                  setIsPlayingMusic(false);
                }}
                className="flex-1 px-6 py-3 border-2 border-purple-600 text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-colors"
              >
                Create Another Story
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(story);
                  alert('Story copied to clipboard!');
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
              >
                Copy Story
              </button>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-purple-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tips for Great Stories</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">1.</span>
              <span>Include colors, sizes, and unique features of the toy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">2.</span>
              <span>Mention if it has special sounds or movements</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">3.</span>
              <span>Describe how your child plays with it</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-600 font-bold">4.</span>
              <span>Add any special names your child has given the toy</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
