# 🍼 CradleCoach AI

> Your AI Co-Pilot for Parenting Newborns to 3-Year-Olds

CradleCoach is an intelligent parenting companion that helps new parents navigate the challenging early years with confidence. Built on peer-reviewed research and powered by AI, it provides personalized guidance, tracks daily activities, and offers evidence-based insights for your child's development.

![CradleCoach Banner](https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=CradleCoach+AI+-+Your+Parenting+Co-Pilot)

---

## 📑 Table of Contents

- [Why CradleCoach Matters](#-why-cradlecoach-matters)
- [Key Features](#-key-features)
- [AI Multi-Agent System](#-ai-multi-agent-system)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Use Cases](#-use-cases)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Why CradleCoach Matters

### The Problem
New parents face overwhelming challenges:
- **Information overload**: Conflicting advice from books, blogs, and family
- **Sleep deprivation**: Affects decision-making and mental health
- **Isolation**: Many parents feel alone in their struggles
- **Pattern blindness**: Hard to see trends when you're in survival mode
- **Medical anxiety**: Constant worry about whether behaviors are normal

### The Solution
CradleCoach provides:
1. **Evidence-Based Guidance**: All advice grounded in peer-reviewed research
2. **Personalized Insights**: AI analyzes your child's unique patterns
3. **24/7 Support**: Get answers at 3 AM when you need them most
4. **Pattern Recognition**: See trends you'd miss while exhausted
5. **Confidence Building**: Validates your parenting decisions with data

### The Impact
Research shows that:
- **Consistent routines** → Better cognitive development and self-regulation
- **Early sleep education** → Longer consolidated sleep by 6 months
- **Responsive feeding** → Healthier eating habits and self-regulation
- **Parental support** → Reduced stress and better mental health

CradleCoach transforms research into actionable daily guidance.

---

## ✨ Key Features

### 1. 📊 Smart Activity Tracking

**Quick Logging System**
- One-handed operation (perfect when holding a baby)
- Track sleep, feeding, diaper changes, and mood
- Automatic timestamp and duration calculation
- Notes field for special observations

**What It Does:**
- Records all daily activities in real-time
- Stores data securely in Supabase database
- Makes patterns visible over time
- Exports logs for pediatrician visits

**Why It Matters:**
Parents are exhausted and forgetful. Quick, frictionless logging ensures you never lose track of important patterns. Doctors love seeing detailed logs during checkups.

---

### 2. 🤖 AI Parenting Chat

**Multi-Agent Intelligence System**
Get personalized answers to any parenting question, powered by specialized AI agents.

**Features:**
- Natural language questions (ask anything)
- Context-aware responses (knows your child's age and recent activity)
- Evidence-based advice (grounded in research)
- Agent workflow visualization (see how AI thinks)

**Example Questions:**
- "My baby won't sleep through the night. What should I do?"
- "When should I start solid foods?"
- "Is my 8-month-old's feeding schedule normal?"
- "I'm feeling overwhelmed. How do I cope?"

**How It Works:**
1. You ask a question
2. Orchestrator Agent analyzes the question
3. Routes to specialist agent (Sleep, Feeding, Routine, Emotional Support)
4. Agent consults your child's data and research
5. Generates personalized, actionable response
6. Additional agents contribute if needed

---

### 3. 📈 Intelligent Dashboard

**Real-Time Insights**
- Daily activity summary with visual indicators
- Sleep, feeding, and diaper pattern analysis
- Smart suggestions based on your data
- Week-over-week trend comparisons

**Activity Cards:**
- **Sleep Tracking**: Total sleep time, nap vs. night sleep breakdown
- **Feeding Patterns**: Feeding frequency, type distribution
- **Diaper Monitoring**: Hydration and digestive health indicators
- **Mood Insights**: Emotional patterns and triggers

**AI-Generated Insights:**
The dashboard displays intelligent observations like:
- "Sleep is more consistent this week - great progress!"
- "Feeding intervals are getting longer - age-appropriate development"
- "Mood has been calmer since the new routine started"

---

### 4. 🎯 Milestone Tracking

**Developmental Monitoring**
- Track physical, cognitive, and social milestones
- Age-appropriate milestone suggestions
- Photo and note attachments
- Celebration moments for achievements

**Milestone Categories:**
- **Physical**: Rolling over, sitting, crawling, walking
- **Communication**: First words, gestures, sentences
- **Social**: Smiling, playing, sharing
- **Cognitive**: Object permanence, problem-solving

**Research Connection:**
Milestone tracking helps identify developmental patterns and celebrate progress, which research shows boosts parental confidence and engagement.

---

### 5. 📚 Curated Resources

**Evidence-Based Library**
- Sleep training methods with research citations
- Feeding guidelines by age
- Developmental activity ideas
- Parenting strategies backed by science

**Resource Categories:**
- Sleep & Routines
- Nutrition & Feeding
- Development & Milestones
- Emotional Well-being
- Safety & Health

---

### 6. 📖 Personalized Stories

**Bedtime Story Generator**
- AI-generated stories featuring your child
- Age-appropriate themes and vocabulary
- Educational content wrapped in entertainment
- Customizable story prompts

**Why It's Special:**
Hearing their own name in stories increases engagement. Stories can reinforce lessons (sharing, kindness) and create special bonding moments.

---

### 7. 🔐 Secure Authentication

**Privacy-First Design**
- Supabase email/password authentication
- Row-level security (RLS) on all data
- Parents can only see their own children's data
- Encrypted data storage
- No data sharing with third parties

**Security Measures:**
- Password hashing with bcrypt
- JWT-based session management
- SQL injection protection
- XSS prevention
- CSRF tokens

---

## 🤖 AI Multi-Agent System

CradleCoach uses a sophisticated **multi-agent architecture** where specialized AI agents collaborate to provide comprehensive parenting support.

### Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR AGENT                        │
│  (Routes questions to specialized agents & coordinates)      │
└─────────────────────────────────────────────────────────────┘
                              |
        ┌────────────────────┼────────────────────┐
        |                    |                    |
        v                    v                    v
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  Sleep Coach  │   │ Feeding Coach │   │    Routine    │
│               │   │               │   │    Planner    │
└───────────────┘   └───────────────┘   └───────────────┘
        |                    |                    |
        v                    v                    v
┌───────────────────────────────────────────────────────┐
│           CONTEXT: Child data, logs, goals            │
└───────────────────────────────────────────────────────┘
        |                    |                    |
        v                    v                    v
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Emotional   │   │ Daily Summary │   │     Trend     │
│    Support    │   │     Agent     │   │    Analyst    │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

### Sub-Agents Explained

#### 1. 🧠 Orchestrator Agent

**Role:** Chief coordinator and traffic director

**How It Works:**
```typescript
async routeAndProcess(question, context, onProgress) {
  1. Analyze question keywords
  2. Identify primary specialist needed
  3. Determine if additional consultants needed
  4. Route to specialist agent(s)
  5. Collect and combine responses
  6. Format final answer
}
```

**Decision Logic:**
- Keywords like "sleep", "nap", "bedtime" → **Sleep Coach**
- Keywords like "feed", "eat", "food" → **Feeding Coach**
- Keywords like "routine", "schedule" → **Routine Planner**
- Keywords like "stress", "overwhelm" → **Emotional Support**
- Default → **General Coach**

**Example Workflow:**
```
User: "My baby won't sleep, and I'm exhausted."

Step 1: Orchestrator identifies TWO topics:
        - Sleep problem (Sleep Coach)
        - Parent exhaustion (Emotional Support)

Step 2: Routes to Sleep Coach (primary)

Step 3: Consults Emotional Support (secondary)

Step 4: Combines both perspectives:
        - Sleep Coach provides sleep solution
        - Emotional Support validates feelings
```

**Visual Progress:**
The UI shows each step:
- ⏳ "Analyzing your question..."
- ✅ "Identified Sleep Coach as primary specialist"
- ⏳ "Routing to Sleep Coach..."
- 🔄 "Requesting Emotional Support collaboration..."
- ⏳ "Analyzing based on research evidence..."
- ✅ "Response ready"

---

#### 2. 😴 Sleep Coach Agent

**Role:** Expert on infant/toddler sleep science

**Research Foundation:**
- AAP Safe Sleep Guidelines
- Sleep consolidation studies
- Bedtime routine research (5+ nights/week routines reduce behavior problems)

**System Prompt:**
```
You are an expert Sleep Coach trained on peer-reviewed research.
Always include: safe sleep practices, age-appropriate wake windows,
specific bedtime routines with exact timing, research-backed benefits.
```

**How It Works:**
```typescript
async analyzeQuestion(question, context) {
  1. Calculate child's age in months
  2. Check for routine/schedule keywords
  3. Build enhanced prompt with:
     - Child's name and age
     - Recent sleep data
     - Research guidelines
  4. Call Gemini API with specialized prompt
  5. Return detailed, actionable response
}
```

**Example Response:**
```
Input: "What's the best bedtime routine for my 6-month-old?"

Output:
📋 Best Sleep Routine for Emma (6 months):

Bedtime Routine (30-45 min before sleep):
• 6:30 PM - Warm bath (calming)
• 7:00 PM - Gentle massage with lotion
• 7:10 PM - Put on sleep clothes
• 7:15 PM - Dim lights, quiet story time
• 7:30 PM - Cuddles, lullaby, place in crib drowsy but awake

Daytime: 2-3 naps (9:00 AM, 1:00 PM, optional late afternoon)

Safe Sleep: Always back-to-sleep, firm mattress, no loose blankets.

Research shows: Consistent routines ≥5 nights/week significantly improve
sleep quality and reduce behavior issues.
```

**Fallback Mechanism:**
If API quota is exceeded, uses pre-built research-based responses.

---

#### 3. 🍽️ Feeding Coach Agent

**Role:** Nutrition and feeding expert

**Research Foundation:**
- WHO breastfeeding guidelines
- Responsive feeding research
- Complementary feeding studies (6+ months)

**Key Principles:**
- **Responsive Feeding**: Follow hunger/fullness cues, never force
- **6-Month Rule**: Exclusive breastfeeding until 6 months
- **Iron-Rich First**: Start with iron-rich foods (meat, fortified cereals)
- **No Pressure**: Never force "clean plate" - disrupts self-regulation

**How It Works:**
```typescript
async analyzeQuestion(question, context) {
  1. Determine child's age (impacts advice)
  2. Check feeding history
  3. Apply age-appropriate feeding research
  4. Generate evidence-based advice
  5. Emphasize responsive feeding
}
```

**Example Response:**
```
Input: "My 8-month-old refuses vegetables. What should I do?"

Output:
🤖 AI-Generated Response:

Research shows repeated exposure without pressure is key. Offer the
same vegetable 10-15 times in different forms (puree, steamed pieces,
mixed with favorite foods) without forcing. Studies find babies need
multiple exposures before accepting new foods.

Make meals pleasant - praise small tastes, maintain eye contact. Never
use pressure tactics, as research shows this disrupts self-regulation
and can lead to feeding difficulties.

At 8 months, focus on iron-rich foods alongside vegetables. Mix veggies
with accepted foods. Development of taste preferences takes time!
```

---

#### 4. 📅 Routine Planner Agent

**Role:** Daily schedule optimization specialist

**Research Foundation:**
- Stable family routines → better cognitive skills
- Play research: More playtime → stronger self-regulation
- Flexible structure: Balance fixed times with exploration

**How It Works:**
```typescript
async analyzeQuestion(question, context) {
  1. Detect if user wants DETAILED schedule (keywords: "schedule", "time", "routine")
  2. Check if sleep-related (coordinates with Sleep Coach)
  3. Generate age-appropriate time-blocked schedule
  4. Explain developmental benefits of each activity
}
```

**Example Response:**
```
Input: "What's a good daily schedule for my 9-month-old?"

Output:
📋 Daily Schedule for Leo (9 months):

Morning:
• 7:00 AM - Wake up & feed
• 8:00 AM - Playtime/tummy time (builds motor skills)
• 9:30 AM - Morning nap (1-2 hours)

Afternoon:
• 11:30 AM - Feed
• 12:00 PM - Active play & activities (cognitive development)
• 2:00 PM - Afternoon nap
• 4:00 PM - Feed & quiet play

Evening:
• 5:30 PM - Dinner/feed
• 6:30 PM - Bath time (calming routine)
• 7:00 PM - Bedtime routine (story, cuddles)
• 7:30 PM - Sleep

Research shows: Consistent schedules improve cognitive development
and self-regulation. The predictable rhythm helps Leo's brain learn
expectations and develop self-control.
```

**Collaboration Example:**
When user asks "What time should bedtime be?", Routine Planner:
1. Consults with Sleep Coach
2. Considers child's age and wake windows
3. Provides integrated schedule + sleep science

---

#### 5. 💚 Emotional Support Agent

**Role:** Parent mental health and coping specialist

**Research Foundation:**
- Parental stress and coping mechanisms
- fMRI studies on caregiver stress
- Cognitive reappraisal techniques
- Effective vs. avoidant coping strategies

**System Prompt:**
```
You are an Emotional Support specialist. Research shows:
- Higher parental stress → less adaptive coping
- Cognitive reappraisal ("this phase will pass") is neurologically effective
- Problem-focused coping (active problem-solving) = beneficial
- Self-care (exercise, sleep) improves stress regulation

Lead with empathy, normalize feelings, offer specific coping strategy.
```

**How It Works:**
```typescript
async analyzeQuestion(question, context) {
  1. Detect emotional distress keywords
  2. Build empathetic response
  3. Normalize feelings (research-backed)
  4. Provide specific coping technique
  5. Encourage seeking support
}
```

**Example Response:**
```
Input: "I'm so tired and feel like I'm failing as a parent."

Output:
It's completely normal to feel overwhelmed - research shows parenting
stress is common and valid. Studies using fMRI scans show stressed
caregivers find it harder to stay calm, but this is a normal brain
response, not a personal failing.

Try cognitive reappraisal: Instead of "I'm failing," try "I'm learning,
and this phase will pass." Research shows this mental shift is
neurologically effective for stress management.

Problem-focused coping works best: Make a specific plan (ask partner/
friend for help with specific tasks), schedule 15 minutes of self-care
daily. Studies prove these approaches reduce parental stress more than
avoidance.

You're not alone - reaching out for support is a sign of strength, not
weakness. Research emphasizes that connected parents cope better.
```

**Key Techniques:**
- **Validation**: "Your feelings are normal"
- **Reframing**: "This phase will pass"
- **Action Steps**: Specific coping strategies
- **Research Grounding**: "Studies show..."
- **Connection**: "You're not alone"

---

#### 6. 📊 Daily Summary Agent

**Role:** Real-time activity analyzer

**How It Works:**
```typescript
async generateDailyStatus(context) {
  1. Count today's activities (sleep + feed + diaper)
  2. Determine status:
     - 0 activities → "Ready to start tracking" 🌟
     - 1-4 activities → "Quiet morning so far" 🟡
     - 5-9 activities → "Calm & steady" 🟢
     - 10+ activities → "Active & engaged day" 🟢
  3. Return status with emoji and color
}
```

**Insight Generation:**
```typescript
async generateInsightSummary(context) {
  1. Analyze sleep, feed, diaper counts
  2. Compare to age-appropriate norms
  3. Generate one-sentence observation

  Examples:
  - "Sleep is lower than typical. Baby might need extra comfort today."
  - "Feeding rhythm is well-established!"
  - "Activity levels look normal for the day so far."
}
```

**Dashboard Display:**
```
┌─────────────────────────────────────┐
│ 🟢 Active & engaged day             │
│                                     │
│ Sleep: 3 sessions | 12h total      │
│ Feed: 6 times                       │
│ Diaper: 8 changes                   │
│                                     │
│ 💡 Insight: "Great feeding rhythm    │
│    established - consistency helps   │
│    development!"                     │
└─────────────────────────────────────┘
```

---

#### 7. 📈 Trend Analyst Agent

**Role:** Historical pattern recognition

**How It Works:**
```typescript
async analyzeTrend(data, type) {
  1. Collect past 7 days of data
  2. Analyze patterns (frequency, timing, consistency)
  3. Compare to developmental norms
  4. Generate insight
}

async generateWeeklySummary(weekData) {
  Rules:
  - Sleep > 40 sessions → "Consistent - great routines!"
  - Sleep < 40 → "Needs more consistency - try steady bedtime"
  - Feed > 35 → "Rhythm well established"
  - Diaper >= 30 → "Good hydration indicator"
}
```

**Example Weekly Insights:**
```
Past 7 Days Analysis:

Sleep: 45 sessions ✅
"Sleep is consistent - great routines! Research shows this supports
cognitive development."

Feeding: 42 sessions ✅
"Feeding rhythm well established. Consistent feeding times help
digestive health."

Diaper: 52 changes ✅
"Diaper changes indicate good hydration. Continue current feeding
approach."
```

---

### Agent Collaboration Example

**User Question:** "My 7-month-old wakes up every 2 hours. I need help with sleep AND a routine."

**Agent Workflow:**

```
1. Orchestrator Agent
   ├─ Detects: Sleep problem + Routine request
   ├─ Primary: Sleep Coach
   └─ Secondary: Routine Planner

2. Sleep Coach Agent
   ├─ Analyzes: Age (7 months), sleep data (2-hour wakes)
   ├─ Accesses: Safe sleep research, wake windows
   └─ Generates: Sleep training recommendations

3. Routine Planner Agent (Consultation)
   ├─ Analyzes: Age-appropriate schedule
   ├─ Accesses: Routine research, play studies
   └─ Generates: Full-day schedule including sleep times

4. Orchestrator Combines:
   ├─ Sleep Coach: "At 7 months, 2-hour wakes suggest overtiredness..."
   ├─ Routine Planner adds: "Build sleep into consistent daily routine..."
   └─ Final Response: Integrated sleep solution + daily schedule
```

**Final Response:**
```
🤖 Sleep Coach Response:

At 7 months, waking every 2 hours often indicates overtiredness. Research
shows babies this age need 12-14 hours total sleep with 2-3 naps.

Recommended Bedtime Routine (Start 30 min before sleep):
• 6:30 PM - Bath
• 6:45 PM - Story in dim room
• 7:00 PM - Feed
• 7:15 PM - Place in crib drowsy but awake
• Safe Sleep: Always back, firm mattress

💡 Routine Planner adds:

Integrate this into a full daily schedule:
• 7:00 AM - Wake
• 9:00 AM - Morning nap (1.5 hrs)
• 1:00 PM - Afternoon nap (2 hrs)
• 7:15 PM - Night sleep

Studies show consistent schedules help babies learn sleep cues, leading
to longer consolidated sleep within 2-3 weeks.
```

---

### Why Multi-Agent Architecture?

**Benefits:**

1. **Specialization**: Each agent is an expert in one domain
2. **Accuracy**: Specialized prompts yield better responses
3. **Context**: Agents share child data for personalized advice
4. **Collaboration**: Complex questions get multi-perspective answers
5. **Transparency**: Users see the "thinking" process
6. **Fallbacks**: If one agent fails, others still work
7. **Scalability**: Easy to add new specialist agents

**vs. Single AI Model:**

| Single Model | Multi-Agent System |
|--------------|-------------------|
| Generic responses | Specialized expertise |
| No workflow visibility | Transparent process |
| Hard to debug | Clear agent responsibility |
| Limited context | Rich data integration |
| One-size-fits-all | Personalized routing |

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + TypeScript)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Landing    │  │  Dashboard   │  │   AI Chat    │              │
│  │     Page     │  │    (Logs)    │  │   (Multi-    │              │
│  └──────────────┘  └──────────────┘  │   Agent)     │              │
│  ┌──────────────┐  ┌──────────────┐  └──────────────┘              │
│  │  Milestones  │  │  Resources   │  │   Stories    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Supabase Client SDK
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      SUPABASE BACKEND                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Authentication (JWT)                        │  │
│  │  Email/Password Auth + Row Level Security                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database (with RLS)                   │  │
│  │  Tables: parents, children, logs_*, milestones, chat_*       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Edge Functions (Deno)                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ parenting-   │  │  generate-   │  │send-welcome- │       │  │
│  │  │    chat      │  │    story     │  │    email     │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS API Calls
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                   GOOGLE GEMINI 2.0 FLASH API                        │
│  Multi-turn conversations, context-aware responses                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Data Flow Diagram

**User Asks Question in AI Chat:**

```
┌──────────────┐
│     User     │
│  Types       │
│  Question    │
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────────┐
│  Frontend: ChatPage.tsx                            │
│  1. Capture user input                             │
│  2. Show agent workflow UI                         │
│  3. Call backend Edge Function                     │
└────────────────┬───────────────────────────────────┘
                 │
                 │ POST /functions/v1/parenting-chat
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  Edge Function: parenting-chat                     │
│  1. Authenticate user                              │
│  2. Fetch child data from DB                       │
│  3. Fetch recent logs (sleep, feed, diaper, mood)  │
│  4. Build context string                           │
│  5. Call Gemini API with context + question        │
│  6. Add safety disclaimer                          │
│  7. Return response                                │
└────────────────┬───────────────────────────────────┘
                 │
                 │ Response
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│  Frontend: Display Response                        │
│  1. Show agent workflow steps (animated)           │
│  2. Display AI response with formatting            │
│  3. Save message to chat_messages table            │
└────────────────────────────────────────────────────┘
```

---

### Database Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          auth.users                             │
│  (Supabase built-in authentication table)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ 1:1
                             │
                             ▼
                    ┌─────────────────┐
                    │    parents      │
                    │  - id (FK)      │
                    │  - name         │
                    │  - email        │
                    │  - timezone     │
                    └────────┬────────┘
                             │
                             │ 1:Many
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐
  │   children    │  │ chat_sessions │  │   feedback     │
  │  - id         │  │  - parent_id  │  │  - parent_id   │
  │  - parent_id  │  │  - child_id   │  │  - rating      │
  │  - name       │  └───────┬───────┘  └────────────────┘
  │  - dob        │          │
  └───────┬───────┘          │ 1:Many
          │                  │
          │ 1:Many           ▼
          │          ┌───────────────┐
          │          │ chat_messages │
          │          │  - session_id │
          │          │  - role       │
          │          │  - content    │
          │          └───────────────┘
          │
          │
  ┌───────┴──────────────────────────────────┐
  │                                          │
  ▼                                          ▼
┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────┐
│ logs_sleep │  │ logs_feed  │  │ logs_diaper  │  │logs_mood  │
│ - child_id │  │ - child_id │  │  - child_id  │  │-child_id  │
│ - start    │  │ - time     │  │  - time      │  │- time     │
│ - end      │  │ - type     │  │  - type      │  │- mood     │
│ - type     │  │ - quantity │  └──────────────┘  │- event    │
└────────────┘  └────────────┘                    └───────────┘
  │                                          │
  │                                          ▼
  │                                    ┌─────────────┐
  │                                    │ milestones  │
  │                                    │  -child_id  │
  │                                    │  - type     │
  │                                    │  -achieved  │
  │                                    └─────────────┘
  │                                          │
  │                                          ▼
  │                                    ┌─────────────┐
  │                                    │  insights   │
  │                                    │  -child_id  │
  │                                    │  - type     │
  │                                    │  -priority  │
  │                                    └─────────────┘
  └────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icon library

### Backend
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database with RLS
  - Authentication (JWT)
  - Edge Functions (Deno runtime)
  - Real-time subscriptions

### AI & ML
- **Google Gemini 2.0 Flash**: LLM for natural language processing
- **Custom Multi-Agent System**: Specialized AI agents
- **Context-Aware Prompting**: Personalized responses

### DevOps
- **Git**: Version control
- **Environment Variables**: Secure config management
- **Database Migrations**: Version-controlled schema changes

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/cradlecoach.git
cd cradlecoach
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**

Migrations are in `supabase/migrations/`. They will auto-apply when you connect to Supabase.

5. **Deploy Edge Functions**

```bash
# Deploy all functions
supabase functions deploy parenting-chat
supabase functions deploy generate-story
supabase functions deploy send-welcome-email
```

6. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Outputs to `dist/` directory.

---

## 🗄️ Database Schema

### Core Tables

**parents**
- Links to `auth.users`
- Stores timezone, language preferences
- RLS: Users can only see own profile

**children**
- Linked to parent
- Stores name, DOB, birth type, feeding type
- RLS: Parents can only see own children

**logs_sleep, logs_feed, logs_diaper, logs_mood**
- Activity tracking tables
- Linked to child
- Timestamps for trend analysis
- RLS: Parents can only see own children's logs

**chat_sessions & chat_messages**
- Stores conversation history
- Linked to parent and optionally child
- RLS: Parents can only see own conversations

**milestones**
- Developmental achievements
- Linked to child
- Achievement date and notes

**insights**
- AI-generated observations
- Linked to child
- Priority levels and expiration dates

**waitlist**
- Premium feature interest tracking
- Public insert, admin read

### Security

**Row Level Security (RLS) Policies:**
All tables have RLS enabled with policies like:
```sql
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));
```

**Optimizations:**
- Foreign key indexes on all relationships
- Optimized RLS with `(select auth.uid())` pattern
- Unused indexes dropped for performance

---

## 🔒 Security Features

### 1. Authentication
- Email/password auth with Supabase
- JWT-based sessions
- Password hashing (bcrypt)
- Email verification (optional)

### 2. Authorization
- Row Level Security (RLS) on all tables
- Users can ONLY access their own data
- No cross-user data leakage possible

### 3. Data Protection
- Encrypted at rest (Supabase default)
- HTTPS everywhere
- Environment variables for secrets
- No API keys in frontend code

### 4. Input Validation
- SQL injection prevention (Supabase parameterized queries)
- XSS protection (React escapes by default)
- CORS headers on Edge Functions

### 5. AI Safety
- Medical disclaimers on health-related questions
- "Not medical advice" warnings
- Fallback responses when AI unavailable
- Rate limiting (API quota management)

---

## 🎯 Use Cases

### 1. Sleep-Deprived Parent at 3 AM

**Scenario:** Baby won't stop crying after feeding.

**CradleCoach Solution:**
1. Opens app with one hand
2. Asks AI: "Why is my baby crying after feeding?"
3. AI analyzes recent logs (sees multiple feeds close together)
4. Suggests: "Possible gas or reflux. Try burping, hold upright 20 min"
5. Links to safe sleep resources

**Outcome:** Parent feels supported, gets actionable advice, baby calms down.

---

### 2. First-Time Mom Introducing Solids

**Scenario:** 6-month-old ready for solid foods, parent overwhelmed.

**CradleCoach Solution:**
1. Parent asks: "When and how do I start solids?"
2. Feeding Coach Agent responds with research-based plan
3. Routine Planner adds: "Best times to introduce foods"
4. App tracks new food introductions and reactions
5. Generates allergen introduction schedule

**Outcome:** Confident, evidence-based feeding approach.

---

### 3. Working Parent Managing Daycare Transition

**Scenario:** Returning to work, worried about maintaining routines.

**CradleCoach Solution:**
1. Parent asks: "How do I keep routines when I go back to work?"
2. Routine Planner creates schedule compatible with work hours
3. Emotional Support Agent validates concerns
4. App shares schedule with daycare provider (export feature)
5. Tracks consistency across home/daycare

**Outcome:** Smooth transition with maintained routines.

---

### 4. Parent Tracking Developmental Milestones

**Scenario:** Is my 10-month-old developing normally?

**CradleCoach Solution:**
1. Parent logs milestones (crawling, first words)
2. App compares to age-appropriate benchmarks
3. AI generates insight: "On track! Next milestone: walking"
4. Suggests activities to encourage development
5. Exports milestone report for pediatrician

**Outcome:** Peace of mind + proactive development support.

---

### 5. Overwhelmed Parent Needing Emotional Support

**Scenario:** Feeling like a failure, exhausted and isolated.

**CradleCoach Solution:**
1. Parent vents: "I can't do this anymore"
2. Emotional Support Agent responds with empathy
3. Validates feelings with research (parental stress is normal)
4. Suggests specific coping strategies (cognitive reappraisal)
5. Reminds parent they're not alone

**Outcome:** Emotional relief, practical coping tools.

---

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` (coming soon) for guidelines.

### Areas We Need Help
- UI/UX improvements
- Additional AI agent specializations
- Multi-language support
- Mobile app (React Native)
- More research citations

---

## 📄 License

MIT License - see `LICENSE` file for details.

---

## 🙏 Acknowledgments

**Research Sources:**
- American Academy of Pediatrics (AAP)
- World Health Organization (WHO)
- Journal of Pediatric Psychology
- Sleep Medicine Reviews
- Developmental Psychology journals

**Technology:**
- Supabase for amazing backend infrastructure
- Google Gemini for powerful AI capabilities
- React team for excellent framework

---

## 📞 Contact & Support

- **Email**: support@cradlecoach.ai (example)
- **Website**: https://cradlecoach.ai (example)
- **Documentation**: Coming soon
- **Discord Community**: Coming soon

---

## 🗺️ Roadmap

**Q1 2025**
- [ ] Multi-child support
- [ ] Premium tier launch
- [ ] WhatsApp/Email daily summaries
- [ ] Export logs to PDF

**Q2 2025**
- [ ] Mobile app (iOS/Android)
- [ ] Pediatrician portal (share data with doctor)
- [ ] Multi-language support (Spanish, Mandarin)
- [ ] Voice input for logging

**Q3 2025**
- [ ] Wearable integration (baby monitors)
- [ ] Community forums
- [ ] Expert Q&A sessions
- [ ] Personalized activity calendar

---

## ⭐ Star History

If you find CradleCoach helpful, please give us a star on GitHub!

---

**Built with ❤️ for tired parents everywhere.**

*Remember: CradleCoach provides informational support only and is not a substitute for medical advice. Always consult your pediatrician for health concerns.*
