import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

interface RequestBody {
  message: string;
  childId: string;
  sessionId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, childId, sessionId }: RequestBody = await req.json();

    const { data: child, error: childError } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .maybeSingle();

    if (childError) {
      throw new Error(`Failed to fetch child: ${childError.message}`);
    }

    if (!child) {
      throw new Error("Child not found");
    }

    const ageInMonths = calculateAgeInMonths(child.date_of_birth);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [sleepLogs, feedLogs, diaperLogs, moodLogs] = await Promise.all([
      supabase
        .from("logs_sleep")
        .select("*")
        .eq("child_id", childId)
        .gte("start_time", sevenDaysAgo.toISOString())
        .order("start_time", { ascending: false })
        .limit(20),
      supabase
        .from("logs_feed")
        .select("*")
        .eq("child_id", childId)
        .gte("time", sevenDaysAgo.toISOString())
        .order("time", { ascending: false })
        .limit(20),
      supabase
        .from("logs_diaper")
        .select("*")
        .eq("child_id", childId)
        .gte("time", sevenDaysAgo.toISOString())
        .order("time", { ascending: false })
        .limit(20),
      supabase
        .from("logs_mood")
        .select("*")
        .eq("child_id", childId)
        .gte("time", sevenDaysAgo.toISOString())
        .order("time", { ascending: false })
        .limit(10),
    ]);

    const context = buildContext(child, ageInMonths, sleepLogs.data || [], feedLogs.data || [], diaperLogs.data || [], moodLogs.data || []);
    
    const systemPrompt = `You are CradleCoach AI, a supportive and empathetic parenting co-pilot. You help parents of newborns to 3-year-olds with guidance on sleep, feeding, routines, and development.

IMPORTANT GUIDELINES:
1. You are NOT a medical professional. Always include a disclaimer for medical concerns.
2. Be warm, supportive, and encouraging. Parenting is hard.
3. Provide practical, actionable advice in 2-4 short paragraphs.
4. Use simple, non-technical language.
5. When discussing sleep, feeding, or behavior patterns, reference the data provided.
6. Never diagnose medical conditions or prescribe treatments.
7. For concerning symptoms or persistent issues, recommend consulting a pediatrician.

CONTEXT:
${context}

User's question: ${message}

Provide a helpful, empathetic response that addresses their question while following all guidelines above.`;

    const aiResponse = await callGeminiAPI(systemPrompt);
    const safeResponse = addSafetyDisclaimer(aiResponse, message);

    return new Response(
      JSON.stringify({ response: safeResponse }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    let errorMessage = "I'm having trouble responding right now. Please try again.";
    
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently experiencing high demand. The AI service has reached its rate limit. Please try again in a few minutes, or the demo may need a new API key configured.";
      } else if (error.message.includes('API key')) {
        errorMessage = "There's an issue with the AI service configuration. Please contact support.";
      }
    }
    
    return new Response(
      JSON.stringify({ 
        response: errorMessage
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function calculateAgeInMonths(dateOfBirth: string): number {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
}

function buildContext(
  child: any,
  ageInMonths: number,
  sleepLogs: any[],
  feedLogs: any[],
  diaperLogs: any[],
  moodLogs: any[]
): string {
  let context = `Child: ${child?.name}, ${ageInMonths} months old\n`;
  context += `Birth type: ${child?.birth_type}, Feeding: ${child?.feeding_type}\n\n`;

  if (sleepLogs && sleepLogs.length > 0) {
    context += `Recent sleep patterns (last 7 days):\n`;
    context += `- ${sleepLogs.length} sleep sessions logged\n`;
    const naps = sleepLogs.filter(s => s.type === 'nap').length;
    context += `- ${naps} naps, ${sleepLogs.length - naps} night sleeps\n\n`;
  }

  if (feedLogs && feedLogs.length > 0) {
    context += `Recent feeding (last 7 days):\n`;
    context += `- ${feedLogs.length} feedings logged\n`;
    const types = feedLogs.reduce((acc: any, f: any) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {});
    context += `- Types: ${JSON.stringify(types)}\n\n`;
  }

  if (moodLogs && moodLogs.length > 0) {
    context += `Recent mood observations:\n`;
    const latestMood = moodLogs[0];
    context += `- Latest: ${latestMood.mood}${latestMood.event_type ? ` (${latestMood.event_type})` : ''}\n\n`;
  }

  return context;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    
    if (errorData.error?.code === 429 || errorData.error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error('Rate limit exceeded. The AI service quota has been reached.');
    }
    
    throw new Error(`Failed to call Gemini API: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error("Unexpected response structure from Gemini API");
  }
  
  return data.candidates[0].content.parts[0].text;
}

function addSafetyDisclaimer(response: string, userMessage: string): string {
  const medicalKeywords = ['sick', 'fever', 'rash', 'vomit', 'diarrhea', 'cough', 'blood', 'emergency', 'pain', 'injury'];
  const hasMedicalConcern = medicalKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );

  let finalResponse = response;

  if (hasMedicalConcern || response.toLowerCase().includes('doctor') || response.toLowerCase().includes('pediatrician')) {
    finalResponse += "\n\n⚠️ Important: This is not medical advice. If you're concerned about your child's health, please consult your pediatrician or seek immediate medical attention if it's an emergency.";
  } else {
    finalResponse += "\n\nRemember: CradleCoach provides informational support only. For health concerns, always consult your pediatrician.";
  }

  return finalResponse;
}
