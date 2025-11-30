import { useState } from 'react';
import { AgentStep } from '../../lib/aiAgents';
import { CheckCircle2, Clock, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface AgentWorkflowProps {
  steps: AgentStep[];
}

export function AgentWorkflow({ steps }: AgentWorkflowProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (steps.length === 0) return null;

  const allComplete = steps.every(s => s.status === 'complete');

  return (
    <div className="my-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-indigo-900">Agent Collaboration Workflow</h3>
          {allComplete && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {steps.length} steps completed
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-indigo-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={`${step.agent}-${step.timestamp || index}`}
                className={`flex items-start space-x-3 p-4 rounded-xl transition-all ${
                  step.status === 'complete'
                    ? 'bg-white border border-green-200'
                    : step.status === 'consulting'
                    ? 'bg-purple-50 border border-purple-300 animate-pulse'
                    : 'bg-indigo-50 border border-indigo-300 animate-pulse'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'complete' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-indigo-600 animate-spin" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{step.agent}</span>
                    {step.status === 'consulting' && (
                      <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        Collaborating
                      </span>
                    )}
                    {step.status === 'thinking' && (
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                        Processing
                      </span>
                    )}
                    {step.status === 'complete' && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Done
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-1">{step.action}</p>

                  {step.result && step.status === 'complete' && (
                    <p className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1 mt-2">
                      ✓ {step.result}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {allComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 font-medium text-center">
                ✨ Multi-agent collaboration complete! Response generated based on research evidence.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
