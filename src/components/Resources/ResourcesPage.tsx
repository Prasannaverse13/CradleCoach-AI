import { ArrowLeft, BookOpen, Video, ExternalLink } from 'lucide-react';

export function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </a>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research-Based Resources</h1>
              <p className="text-sm text-gray-600">Evidence-based parenting guides and studies</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <span>Research-Based Parenting Resources</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Evidence-based guides, videos, and articles from peer-reviewed research to support your parenting journey.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-2xl text-indigo-900 mb-4 flex items-center space-x-3">
                <span className="text-3xl">😴</span>
                <span>Sleep Resources</span>
              </h3>
              <div className="space-y-3">
                <a
                  href="https://www.news-medical.net/health/Preventing-SIDS-Evidence-Based-Guidelines-for-Infant-Sleep-Safety.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors group border border-indigo-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-lg text-gray-900">Safe Sleep Practices & SIDS Prevention</span>
                      </div>
                      <p className="text-gray-600">AAP evidence-based guidelines for infant sleep safety</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://link.springer.com/article/10.1186/s12887-024-04771-6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors group border border-indigo-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold text-lg text-gray-900">Early Sleep Intervention Research</span>
                      </div>
                      <p className="text-gray-600">Randomized trial showing early education helps infant sleep</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://www.youtube.com/results?search_query=infant+safe+sleep+practices+pediatrician"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition-colors group border border-indigo-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-lg text-gray-900">Safe Sleep Video Guides</span>
                      </div>
                      <p className="text-gray-600">Expert pediatrician videos on sleep safety and routines</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-2xl text-purple-900 mb-4 flex items-center space-x-3">
                <span className="text-3xl">🍼</span>
                <span>Feeding Resources</span>
              </h3>
              <div className="space-y-3">
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8178105/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors group border border-purple-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-lg text-gray-900">Responsive Feeding Guidelines</span>
                      </div>
                      <p className="text-gray-600">Research on following baby's hunger cues for healthy development</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/40884573/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors group border border-purple-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-lg text-gray-900">Complementary Feeding & Development</span>
                      </div>
                      <p className="text-gray-600">Systematic review linking diet quality to cognitive skills</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://www.youtube.com/results?search_query=responsive+feeding+baby+pediatrician"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors group border border-purple-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-lg text-gray-900">Responsive Feeding Techniques</span>
                      </div>
                      <p className="text-gray-600">Video demonstrations of feeding cues and techniques</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-2xl text-pink-900 mb-4 flex items-center space-x-3">
                <span className="text-3xl">🎯</span>
                <span>Development & Routines</span>
              </h3>
              <div className="space-y-3">
                <a
                  href="https://www.researchgate.net/publication/376661817_Routines_and_child_development_A_systematic_review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors group border border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-lg text-gray-900">Routines & Child Development</span>
                      </div>
                      <p className="text-gray-600">Systematic review linking stable routines to better outcomes</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://www.researchgate.net/publication/365601917_Time_spent_playing_predicts_early_reading_and_math_skills_through_associations_with_self-regulation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors group border border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-pink-600" />
                        <span className="font-semibold text-lg text-gray-900">Play Time & Academic Skills</span>
                      </div>
                      <p className="text-gray-600">Research showing play predicts reading and math abilities</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://www.youtube.com/results?search_query=age+appropriate+activities+baby+development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-pink-50 rounded-2xl hover:bg-pink-100 transition-colors group border border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Video className="w-5 h-5 text-red-600" />
                        <span className="font-semibold text-lg text-gray-900">Age-Appropriate Activities</span>
                      </div>
                      <p className="text-gray-600">Developmental activity videos for each age group</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-2xl text-rose-900 mb-4 flex items-center space-x-3">
                <span className="text-3xl">💜</span>
                <span>Parent Well-Being</span>
              </h3>
              <div className="space-y-3">
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10633904/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors group border border-rose-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-rose-600" />
                        <span className="font-semibold text-lg text-gray-900">Coping Strategies for Parents</span>
                      </div>
                      <p className="text-gray-600">Research on effective coping during postpartum period</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>

                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/34128217/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-colors group border border-rose-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-rose-600" />
                        <span className="font-semibold text-lg text-gray-900">Parental Stress & Emotion Regulation</span>
                      </div>
                      <p className="text-gray-600">fMRI study on stress management for new parents</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity ml-3" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
            <p className="text-indigo-900 text-center">
              <strong className="text-lg">✨ All resources are based on peer-reviewed research</strong>
              <br />
              <span className="text-sm">from the studies that power our AI agents. Each link opens in a new tab for easy reference.</span>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
