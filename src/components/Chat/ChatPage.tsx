import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Send, Bot, User, Sparkles, ArrowLeft, Moon, Utensils, Target, Heart, Brain, Shield } from 'lucide-react';
import {
  orchestratorAgent,
  sleepCoachAgent,
  feedingAgent,
  routinePlannerAgent,
  emotionalSupportAgent,
  AgentStep,
} from '../../lib/aiAgents';
import { AgentWorkflow } from './AgentWorkflow';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  timestamp: Date;
  steps?: AgentStep[];
}

interface Agent {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

const AVAILABLE_AGENTS: Agent[] = [
  {
    id: 'all',
    name: 'All Agents',
    icon: Brain,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Smart routing to the best specialist',
  },
  {
    id: 'sleep',
    name: 'Sleep Coach',
    icon: Moon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    description: 'Sleep patterns, bedtime routines & night wakings',
  },
  {
    id: 'feeding',
    name: 'Feeding Coach',
    icon: Utensils,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Breastfeeding, bottles, solids & schedules',
  },
  {
    id: 'routine',
    name: 'Routine Planner',
    icon: Target,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Daily schedules, activities & development',
  },
  {
    id: 'support',
    name: 'Emotional Support',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    description: 'Parent well-being & encouragement',
  },
];

export function ChatPage() {
  const { activeChild, parent } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('all');
  const [thinkingAgent, setThinkingAgent] = useState<string>('');
  const [currentSteps, setCurrentSteps] = useState<AgentStep[]>([]);
  const [todayLogs, setTodayLogs] = useState({ sleep: 0, feed: 0, diaper: 0, mood: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const question = urlParams.get('q');

    if (question) {
      setInput(question);
    }

    if (activeChild) {
      loadTodayLogs();
    }

    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Hi ${parent?.name || 'there'}! I'm your AI parenting coach powered by multiple specialist agents. I'm here to help you with questions about ${activeChild?.name || 'your baby'}'s sleep, feeding, routines, and more. What would you like to know?`,
        agent: 'AI Coach',
        timestamp: new Date(),
      },
    ]);
  }, [activeChild, parent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTodayLogs = async () => {
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
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !activeChild) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setCurrentSteps([]);

    const context = {
      child: activeChild,
      recentLogs: todayLogs,
    };

    try {
      let agentName = '';
      let response = '';
      let steps: AgentStep[] = [];

      if (activeAgent === 'all') {
        setThinkingAgent('AI Parenting Coach');
        const result = await orchestratorAgent.routeAndProcess(input, context, (step) => {
          setCurrentSteps(prev => {
            const existing = prev.findIndex(s => s.timestamp === step.timestamp && s.agent === step.agent);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = step;
              return updated;
            }
            return [...prev, step];
          });
        });
        agentName = result.agent;
        response = result.response;
        steps = result.steps;
      } else if (activeAgent === 'sleep') {
        setThinkingAgent('Sleep Coach');
        agentName = 'Sleep Coach';
        response = await sleepCoachAgent.analyzeQuestion(input, context);
      } else if (activeAgent === 'feeding') {
        setThinkingAgent('Feeding Coach');
        agentName = 'Feeding Coach';
        response = await feedingAgent.analyzeQuestion(input, context);
      } else if (activeAgent === 'routine') {
        setThinkingAgent('Routine Planner');
        agentName = 'Routine Planner';
        response = await routinePlannerAgent.analyzeQuestion(input, context);
      } else if (activeAgent === 'support') {
        setThinkingAgent('Emotional Support');
        agentName = 'Emotional Support';
        response = await emotionalSupportAgent.analyzeQuestion(input, context);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        agent: agentName,
        timestamp: new Date(),
        steps: steps.length > 0 ? steps : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentSteps([]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact your pediatrician if you have urgent concerns.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setThinkingAgent('');
      if (currentSteps.length > 0) {
        setTimeout(() => setCurrentSteps([]), 1000);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentColor = (agentName?: string) => {
    if (!agentName) return 'bg-gradient-to-br from-indigo-600 to-purple-600';
    if (agentName.includes('Sleep')) return 'bg-gradient-to-br from-indigo-500 to-indigo-600';
    if (agentName.includes('Feeding')) return 'bg-gradient-to-br from-purple-500 to-purple-600';
    if (agentName.includes('Routine')) return 'bg-gradient-to-br from-pink-500 to-pink-600';
    if (agentName.includes('Support')) return 'bg-gradient-to-br from-rose-500 to-rose-600';
    return 'bg-gradient-to-br from-indigo-600 to-purple-600';
  };

  const getAgentIcon = (agentName?: string) => {
    if (!agentName) return Bot;
    if (agentName.includes('Sleep')) return Moon;
    if (agentName.includes('Feeding')) return Utensils;
    if (agentName.includes('Routine')) return Target;
    if (agentName.includes('Support')) return Heart;
    return Bot;
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold text-indigo-900">{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="p-2 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </a>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">AI Parenting Coach</h1>
                  <p className="text-xs text-gray-600">Multi-Agent System</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span className="text-sm font-medium text-indigo-600">{AVAILABLE_AGENTS.length} Specialists</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {AVAILABLE_AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isActive = activeAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? `${agent.bgColor} ${agent.color} border-2 border-current shadow-lg scale-105`
                      : 'bg-white/50 text-gray-600 hover:bg-white border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{agent.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="max-w-5xl w-full mx-auto px-6 py-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900 text-sm mb-1">
                {AVAILABLE_AGENTS.find(a => a.id === activeAgent)?.name} Active
              </h3>
              <p className="text-indigo-700 text-xs">
                {AVAILABLE_AGENTS.find(a => a.id === activeAgent)?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-6 flex flex-col overflow-hidden">
        <div className="flex-1 space-y-6 overflow-y-auto mb-6">
          {messages.map((message) => {
            const AgentIcon = message.role === 'user' ? User : getAgentIcon(message.agent);
            const agentColor = getAgentColor(message.agent);

            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 animate-fade-in ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      : agentColor
                  }`}
                >
                  <AgentIcon className="w-6 h-6 text-white" />
                </div>

                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  {message.agent && message.role === 'assistant' && (
                    <div className="mb-2 flex items-center space-x-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                        {message.agent}
                      </span>
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                    </div>
                  )}
                  {message.steps && message.steps.length > 0 && message.role === 'assistant' && (
                    <AgentWorkflow steps={message.steps} />
                  )}

                  <div
                    className={`rounded-2xl p-5 max-w-2xl shadow-xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white ml-auto'
                        : 'bg-white/80 backdrop-blur-xl text-gray-900 border border-white/40'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.role === 'assistant' ? renderFormattedText(message.content) : message.content}
                    </div>
                  </div>
                  <div
                    className={`text-xs text-gray-500 mt-2 flex items-center space-x-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="animate-fade-in">
              {currentSteps.length > 0 && (
                <AgentWorkflow steps={currentSteps} />
              )}

              <div className="flex items-start space-x-3 mt-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${getAgentColor(thinkingAgent)}`}>
                  <Bot className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 animate-pulse">
                      {thinkingAgent || 'Thinking...'}
                    </span>
                    <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/40 shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600 animate-pulse">Processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4">
          <div className="flex items-end space-x-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${AVAILABLE_AGENTS.find(a => a.id === activeAgent)?.name}...`}
              className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-500 max-h-32"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 transition-all transform hover:scale-105 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
