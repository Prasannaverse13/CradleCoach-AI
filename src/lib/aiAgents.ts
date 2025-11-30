interface Child {
  id: string;
  name: string;
  date_of_birth: string;
}

interface AgentContext {
  child: Child;
  recentLogs?: {
    sleep: number;
    feed: number;
    diaper: number;
    mood: string;
  };
  goals?: string[];
}

export interface AgentStep {
  agent: string;
  action: string;
  status: 'thinking' | 'complete' | 'consulting';
  result?: string;
  timestamp: number;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGeminiAPI(prompt: string): Promise<{ text: string; source: 'ai' | 'fallback' }> {
  try {
    console.log('🤖 Calling Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }],
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API error:', errorData);
      if (errorData.error?.code === 429) {
        throw new Error('RATE_LIMIT: Quota exceeded. Using fallback response.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;

    console.log('✅ AI Response received');
    return { text, source: 'ai' };
  } catch (error) {
    console.error('❌ Gemini API failed:', error);
    throw error;
  }
}

function getChildAgeInMonths(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export const sleepCoachAgent = {
  name: 'Sleep Coach',
  systemPrompt: `You are an expert Sleep Coach for infants/toddlers (0-3 years), trained on peer-reviewed research:

SAFE SLEEP (AAP Guidelines): Always back-to-sleep, firm flat surface, no loose bedding/pillows, room-sharing not bed-sharing, pacifier after breastfeeding established.

SLEEP CONSOLIDATION: Early sleep education at 4 months helps longer sleep by 6 months. Consistent bedtime routines by 3-6 months promote better consolidation.

BEDTIME ROUTINES: ≥5 nights/week routines at 12-15 months significantly reduce behavior problems. Include quiet play, bath, story. Benefits: better sleep AND emotional regulation.

When asked about sleep routines or best practices:
- Provide SPECIFIC bedtime routine with exact timing (e.g., "6:30 PM bath, 7:00 PM story, 7:30 PM sleep")
- Include step-by-step bedtime ritual
- Mention age-appropriate wake windows and nap schedules
- Always include safe sleep reminders
- Explain research-backed benefits

Be specific, actionable, and detailed. Parents want concrete guidance.`,

  async analyzeQuestion(question: string, context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const lowerQ = question.toLowerCase();

    const needsRoutine = lowerQ.match(/routine|schedule|best|what.*time|when|how.*sleep|suggest/);

    let enhancedPrompt = `${this.systemPrompt}\n\nChild: ${context.child.name}, ${ageMonths} months. Today's sleep: ${context.recentLogs?.sleep || 0} sessions.\nQuestion: "${question}"\n\n`;

    if (needsRoutine) {
      enhancedPrompt += `The parent wants SPECIFIC sleep routine guidance. Provide:
1. Exact bedtime routine with times (e.g., "6:30 PM - Start bath")
2. Step-by-step pre-sleep activities
3. Age-appropriate total sleep hours and nap schedule
4. Safe sleep reminders
5. Research-backed explanation of benefits

Make it detailed and actionable.`;
    } else {
      enhancedPrompt += `Provide research-based sleep coaching with specific, practical advice.`;
    }

    try {
      const result = await callGeminiAPI(enhancedPrompt);
      if (result.source === 'ai') {
        return `🤖 **AI-Generated Response:**\n\n${result.text}`;
      }
      return result.text;
    } catch (error: any) {
      console.warn('⚠️ Using fallback response:', error.message);
      if (needsRoutine) {
        let napSchedule = '';
        if (ageMonths < 6) {
          napSchedule = '3-4 naps throughout the day (wake windows: 1-2 hours)';
        } else if (ageMonths < 12) {
          napSchedule = '2-3 naps (9:00 AM, 1:00 PM, optional late afternoon)';
        } else {
          napSchedule = '1-2 naps (usually around 1:00 PM)';
        }

        return `📋 **Fallback Response** (AI quota exceeded)

**Best Sleep Routine for ${context.child.name} (${ageMonths} months):**

**Bedtime Routine (30-45 min before sleep):**
• 6:30 PM - Warm bath (calming)
• 7:00 PM - Gentle massage with lotion
• 7:10 PM - Put on sleep clothes
• 7:15 PM - Dim lights, quiet story time
• 7:30 PM - Cuddles, lullaby, place in crib drowsy but awake
• 7:45 PM - Lights out, sleep

**Daytime:** ${napSchedule}

**Safe Sleep:** Always back-to-sleep, firm mattress, no loose blankets/toys.

**Research shows** consistent routines ≥5 nights/week significantly **improve sleep quality** and **reduce behavior issues**. This predictable pattern helps ${context.child.name}'s brain recognize sleep cues.

_Note: Your Gemini API has reached its quota limit. The AI will work again once quota resets._`;
      }
      return `At ${ageMonths} months, **research shows** consistent **bedtime routines** are crucial. Try a calming sequence (bath, story, cuddles) at the same time nightly. This helps ${context.child.name} **sleep better** and supports **emotional regulation**.`;
    }
  },

  async getSleepTip(context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const prompt = `${this.systemPrompt}\n\nGenerate ONE sleep tip for ${context.child.name}, ${ageMonths} months, ${context.recentLogs?.sleep || 0} sleep sessions today.`;
    try {
      return await callGeminiAPI(prompt);
    } catch {
      return `Research shows bedtime routines improve sleep consolidation. Start a calming 30-minute routine before sleep for ${context.child.name}.`;
    }
  },
};

export const feedingAgent = {
  name: 'Feeding Coach',
  systemPrompt: `You are an expert Feeding Coach for ages 0-3, based on research:

BREASTFEEDING: Mother's milk is best. Exclusive breastfeeding first 6 months, continue with solids to 12-24 months.

RESPONSIVE FEEDING (Critical): Follow hunger/fullness cues, encourage autonomy. NEVER pressure to "clean plate" - disrupts self-regulation. Make meals pleasant with praise, eye contact.

COMPLEMENTARY FEEDING (6+ months): Iron-rich foods first (meat, fortified cereals). Progress textures: purees→lumpy→pieces by 9-12 months. High-quality diet links to better cognitive/language development. Repeated exposure without pressure.

FEEDING DIFFICULTIES: Regular meal schedules (5 small meals/day), low-pressure exposure. Never force - it's ineffective per research. Praise small tastes.

Validate concerns, give evidence-based practical steps. 2-4 sentences.`,

  async analyzeQuestion(question: string, context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const prompt = `${this.systemPrompt}\n\nChild: ${context.child.name}, ${ageMonths} months. Today's feeds: ${context.recentLogs?.feed || 0}.\nQuestion: "${question}"\n\nProvide research-based feeding advice.`;
    try {
      const result = await callGeminiAPI(prompt);
      if (result.source === 'ai') {
        return `🤖 **AI-Generated Response:**\n\n${result.text}`;
      }
      return result.text;
    } catch (error: any) {
      console.warn('⚠️ Using fallback response:', error.message);
      if (ageMonths < 6) {
        return `At ${ageMonths} months, **breast milk or formula** provides complete nutrition. **Research emphasizes responsive feeding** - watch ${context.child.name}'s hunger cues and feed on demand.`;
      }
      return `For ${ageMonths}-month-olds, offer **iron-rich foods** and varied textures. Studies show **responsive feeding** (following ${context.child.name}'s cues without pressure) supports **healthy development**.`;
    }
  },

  async getFeedingAdvice(context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const prompt = `${this.systemPrompt}\n\nGenerate ONE feeding tip for ${context.child.name}, ${ageMonths} months, ${context.recentLogs?.feed || 0} feeds today.`;
    try {
      const result = await callGeminiAPI(prompt);
      return result.text;
    } catch {
      return `**Research shows responsive feeding is key.** Watch ${context.child.name}'s hunger cues, offer variety without pressure, make meals pleasant. This approach links to better **self-regulation**.`;
    }
  },
};

export const routinePlannerAgent = {
  name: 'Routine Planner',
  systemPrompt: `You are an expert Routine Planner for ages 0-3, grounded in research:

VALUE OF ROUTINES: Stable family routines→better cognitive skills, self-regulation, behavior, academic readiness, physical health. Protective in high-stress contexts.

PLAY & LEARNING: Play is educational. More playtime→stronger self-regulation→higher reading/math scores. Unstructured play (pretend, blocks, art) fosters executive skills.

FLEXIBLE STRUCTURE: Balance fixed times (meals, sleep) with exploration. Consistent rhythm helps toddlers learn self-control and expectations. Adjust as child grows.

When asked about specific routines or schedules:
- For SLEEP routines: Provide specific bedtime schedule with times (e.g., 7:00 PM bath, 7:30 PM story, 8:00 PM sleep)
- For DAILY schedules: Give hour-by-hour breakdown with wake time, naps, meals, play, bath, bedtime
- For TIMETABLES: Create specific time blocks for the child's age
- Include WHY each element helps development (backed by research)

Always be specific with times and activities. Make it actionable and detailed.`,

  async analyzeQuestion(question: string, context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const lowerQ = question.toLowerCase();

    const needsDetailedSchedule = lowerQ.match(/schedule|timetable|routine|time|when|suggest.*time|daily|plan|hour/);
    const aboutSleep = lowerQ.match(/sleep|bedtime|nap/);

    let enhancedPrompt = `${this.systemPrompt}\n\nChild: ${context.child.name}, ${ageMonths} months.\nQuestion: "${question}"\n\n`;

    if (needsDetailedSchedule) {
      enhancedPrompt += `The parent is asking for a SPECIFIC SCHEDULE. Provide:
1. Exact times for activities (e.g., "7:00 AM - Wake up and feed")
2. Age-appropriate activities with durations
3. Brief research note on why this schedule benefits development
Format with times clearly listed.`;
    } else if (aboutSleep) {
      enhancedPrompt += `Focus on sleep routine. Include specific bedtime ritual steps with times, safe sleep practices, and research-backed benefits.`;
    } else {
      enhancedPrompt += `Provide research-based routine planning with specific, actionable advice.`;
    }

    try {
      const result = await callGeminiAPI(enhancedPrompt);
      if (result.source === 'ai') {
        return `🤖 **AI-Generated Response:**\n\n${result.text}`;
      }
      return result.text;
    } catch (error: any) {
      console.warn('⚠️ Using fallback response:', error.message);
      if (needsDetailedSchedule) {
        return `📋 **Fallback Response** (AI quota exceeded)

**Daily Schedule for ${context.child.name} (${ageMonths} months):**

**Morning:**
• 7:00 AM - Wake up & feed
• 8:00 AM - Playtime/tummy time
• 9:30 AM - Morning nap (1-2 hours)

**Afternoon:**
• 11:30 AM - Feed
• 12:00 PM - Active play & activities
• 2:00 PM - Afternoon nap
• 4:00 PM - Feed & quiet play

**Evening:**
• 5:30 PM - Dinner/feed
• 6:30 PM - Bath time
• 7:00 PM - Bedtime routine (story, cuddles)
• 7:30 PM - Sleep

**Studies show** consistent schedules **improve cognitive development** and **self-regulation**.

_Note: Your Gemini API has reached its quota limit. The AI will work again once quota resets._`;
      }
      return `**Research shows** stable routines **boost development**. For ${ageMonths}-month-olds, create consistent **meal/nap times** plus plenty of **play**. Studies link regular schedules to better **self-regulation** and **cognitive skills**.`;
    }
  },

  async getRoutineSuggestion(context: AgentContext): Promise<string> {
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const prompt = `${this.systemPrompt}\n\nSuggest ONE routine tip for ${context.child.name}, ${ageMonths} months.`;
    try {
      return await callGeminiAPI(prompt);
    } catch {
      return `Studies show routines enhance development. Create a predictable rhythm for ${context.child.name} - consistent meal/sleep times plus unstructured play for cognitive growth.`;
    }
  },
};

export const emotionalSupportAgent = {
  name: 'Emotional Support',
  systemPrompt: `You are an Emotional Support specialist for parents of 0-3 year-olds, research-based:

PARENTAL STRESS: Higher stress→less adaptive coping, more suppression. fMRI studies show stressed caregivers find it harder to stay calm. Teach reappraisal: "This phase will pass" vs catastrophizing. Quick relaxation (deep breathing) improves coping.

EFFECTIVE COPING: Problem-focused (active problem-solving)=beneficial. Healthy emotion-focused (venting to friends, self-care)=helpful. Avoidant (denial, withdrawal)=more distress. Research recommends encouraging effective coping.

EVIDENCE-BASED: Cognitive reappraisal is neurologically grounded. Self-care (exercise, sleep) improves stress regulation. Schedule help, set small goals, find peer support.

Lead with empathy, normalize feelings, offer specific coping strategy, ground in research. 2-4 sentences.`,

  async analyzeQuestion(question: string, context: AgentContext): Promise<string> {
    const prompt = `${this.systemPrompt}\n\nParent of ${context.child.name}. Concern: "${question}"\n\nProvide research-based emotional support.`;
    try {
      return await callGeminiAPI(prompt);
    } catch {
      return `It's completely normal to feel overwhelmed - research shows parenting stress is common. Try cognitive reappraisal: "this phase will pass." Studies show this technique plus self-care and reaching out for support are most effective.`;
    }
  },

  async provideSupportMessage(): Promise<string> {
    const messages = [
      'Research shows parenting stress is valid. Problem-focused coping (making plans, asking for help) is proven effective. You\'re doing great by reaching out.',
      'Studies find self-care isn\'t selfish - it\'s essential. Parents who practice stress management have better emotional regulation. Take moments for yourself.',
      'Evidence shows reframing positively ("I\'m learning") helps more than self-criticism. Every day caring for your baby is an accomplishment.',
      'Research emphasizes: reaching out for support is strength. Parents who connect with others cope better. You\'re not alone.',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  },
};

export const dailySummaryAgent = {
  async generateDailyStatus(context: AgentContext): Promise<{ status: string; emoji: string; color: string }> {
    const logs = context.recentLogs;
    if (!logs || (logs.sleep === 0 && logs.feed === 0 && logs.diaper === 0)) {
      return { status: 'Ready to start tracking', emoji: '🌟', color: 'blue' };
    }
    const totalActivities = logs.sleep + logs.feed + logs.diaper;
    if (totalActivities >= 10) return { status: 'Active & engaged day', emoji: '🟢', color: 'green' };
    if (totalActivities >= 5) return { status: 'Calm & steady', emoji: '🟢', color: 'green' };
    return { status: 'Quiet morning so far', emoji: '🟡', color: 'yellow' };
  },

  async generateInsightSummary(context: AgentContext): Promise<string> {
    const logs = context.recentLogs;
    const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
    const prompt = `As pediatric analyst, analyze: ${logs?.sleep || 0} sleep, ${logs?.feed || 0} feeds, ${logs?.diaper || 0} diapers for ${ageMonths}-month-old. ONE brief observation in 1 sentence.`;
    try {
      return await callGeminiAPI(prompt);
    } catch {
      if (logs && logs.sleep < 2) return 'Sleep is lower than typical. Baby might need extra comfort today.';
      return 'Activity levels look normal for the day so far.';
    }
  },
};

export const orchestratorAgent = {
  name: 'AI Parenting Coach',

  async routeAndProcess(
    question: string,
    context: AgentContext,
    onProgress: (step: AgentStep) => void
  ): Promise<{ agent: string; response: string; steps: AgentStep[] }> {
    const steps: AgentStep[] = [];

    steps.push({
      agent: 'AI Parenting Coach',
      action: 'Analyzing your question',
      status: 'thinking',
      timestamp: Date.now(),
    });
    onProgress(steps[steps.length - 1]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQ = question.toLowerCase();
    let targetAgent = 'General Coach';
    let consultAgents: string[] = [];

    if (lowerQ.match(/sleep|nap|bedtime|night|wake|tired|rest/)) {
      targetAgent = 'Sleep Coach';
      if (lowerQ.match(/routine|schedule|when|time/)) consultAgents.push('Routine Planner');
    } else if (lowerQ.match(/feed|eat|food|milk|bottle|breast|solid|hungry|meal/)) {
      targetAgent = 'Feeding Coach';
      if (lowerQ.match(/routine|schedule|when|how often/)) consultAgents.push('Routine Planner');
    } else if (lowerQ.match(/routine|schedule|activity|play|day|plan/)) {
      targetAgent = 'Routine Planner';
    } else if (lowerQ.match(/stress|overwhelm|tired|cope|help|exhaust|anxious|worry/)) {
      targetAgent = 'Emotional Support';
    }

    steps[steps.length - 1].status = 'complete';
    steps[steps.length - 1].result = `Identified ${targetAgent} as primary specialist`;
    onProgress(steps[steps.length - 1]);

    steps.push({
      agent: 'AI Parenting Coach',
      action: `Routing to ${targetAgent}`,
      status: 'thinking',
      timestamp: Date.now(),
    });
    onProgress(steps[steps.length - 1]);
    await new Promise(resolve => setTimeout(resolve, 800));

    steps[steps.length - 1].status = 'complete';
    steps[steps.length - 1].result = `Connected to ${targetAgent}`;
    onProgress(steps[steps.length - 1]);

    if (consultAgents.length > 0) {
      for (const consultant of consultAgents) {
        steps.push({
          agent: 'AI Parenting Coach',
          action: `Requesting ${consultant} collaboration`,
          status: 'consulting',
          timestamp: Date.now(),
        });
        onProgress(steps[steps.length - 1]);
        await new Promise(resolve => setTimeout(resolve, 700));

        steps[steps.length - 1].status = 'complete';
        steps[steps.length - 1].result = `${consultant} will provide complementary insights`;
        onProgress(steps[steps.length - 1]);
      }
    }

    steps.push({
      agent: targetAgent,
      action: 'Analyzing based on research evidence',
      status: 'thinking',
      timestamp: Date.now(),
    });
    onProgress(steps[steps.length - 1]);

    let response = '';
    try {
      if (targetAgent === 'Sleep Coach') response = await sleepCoachAgent.analyzeQuestion(question, context);
      else if (targetAgent === 'Feeding Coach') response = await feedingAgent.analyzeQuestion(question, context);
      else if (targetAgent === 'Routine Planner') response = await routinePlannerAgent.analyzeQuestion(question, context);
      else if (targetAgent === 'Emotional Support') response = await emotionalSupportAgent.analyzeQuestion(question, context);
      else {
        const ageMonths = getChildAgeInMonths(context.child.date_of_birth);
        const prompt = `You are a supportive parenting coach. Answer about ${context.child.name} (${ageMonths} months): "${question}". Warm, evidence-based, 2-4 sentences.`;
        response = await callGeminiAPI(prompt);
      }
    } catch {
      response = `I understand your concern about ${context.child.name}. Every baby is unique. If you have ongoing concerns, consulting your pediatrician is always wise. Maintaining routines and responsive care are evidence-based approaches.`;
    }

    steps[steps.length - 1].status = 'complete';
    steps[steps.length - 1].result = 'Generated research-based response';
    onProgress(steps[steps.length - 1]);

    if (consultAgents.length > 0) {
      for (const consultant of consultAgents) {
        await new Promise(resolve => setTimeout(resolve, 600));
        steps.push({
          agent: consultant,
          action: 'Contributing additional insights',
          status: 'thinking',
          timestamp: Date.now(),
        });
        onProgress(steps[steps.length - 1]);

        await new Promise(resolve => setTimeout(resolve, 800));

        if (consultant === 'Routine Planner') {
          response += `\n\n💡 **${consultant} adds:** Research shows building this into a consistent daily routine supports ${context.child.name}'s development. Try scheduling regular times for this activity.`;
        }

        steps[steps.length - 1].status = 'complete';
        steps[steps.length - 1].result = 'Added routine perspective';
        onProgress(steps[steps.length - 1]);
      }
    }

    steps.push({
      agent: 'AI Parenting Coach',
      action: 'Finalizing response',
      status: 'thinking',
      timestamp: Date.now(),
    });
    onProgress(steps[steps.length - 1]);
    await new Promise(resolve => setTimeout(resolve, 500));

    steps[steps.length - 1].status = 'complete';
    steps[steps.length - 1].result = 'Response ready';
    onProgress(steps[steps.length - 1]);

    return { agent: targetAgent, response, steps };
  },

  async routeQuestion(question: string, context: AgentContext): Promise<{ agent: string; response: string }> {
    const result = await this.routeAndProcess(question, context, () => {});
    return { agent: result.agent, response: result.response };
  },
};

export const trendAnalystAgent = {
  async analyzeTrend(data: any[], type: 'sleep' | 'feed' | 'diaper'): Promise<string> {
    const count = data.length;
    const prompt = `As pediatric data analyst, analyze: ${count} ${type} logs past week. ONE insight in 1 sentence.`;
    try {
      return await callGeminiAPI(prompt);
    } catch {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} patterns are within normal range.`;
    }
  },

  async generateWeeklySummary(weekData: { sleep: number; feed: number; diaper: number }): Promise<string[]> {
    return [
      weekData.sleep > 40 ? 'Sleep is consistent - great routines!' : 'Sleep needs more consistency - try steady bedtime.',
      weekData.feed > 35 ? 'Feeding rhythm well established.' : 'Track feeds more regularly to spot patterns.',
      weekData.diaper >= 30 ? 'Diaper changes indicate good hydration.' : 'Monitor diaper output as feeding indicator.',
    ];
  },
};
