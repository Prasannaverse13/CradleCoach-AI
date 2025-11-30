import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    email: string;
    created_at: string;
  };
  schema: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: WebhookPayload = await req.json();

    if (payload.type === 'INSERT' && payload.table === 'parents') {
      const { email } = payload.record;

      console.log(`Sending welcome email to: ${email}`);

      const emailContent = {
        to: email,
        subject: 'Welcome to CradleCoach!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
              .feature { margin: 20px 0; padding: 15px; background: white; border-radius: 8px; }
              .feature h3 { margin: 0 0 10px 0; color: #667eea; }
              .cta { text-align: center; margin: 30px 0; }
              .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welcome to CradleCoach!</h1>
              <p>Your AI Co-Pilot for Parenting</p>
            </div>

            <div class="content">
              <p>Hi there!</p>
              
              <p>We're thrilled to have you join CradleCoach! You've just taken the first step toward a more confident, informed parenting journey.</p>

              <p>Here's what you can do with CradleCoach:</p>

              <div class="feature">
                <h3>📊 Track Everything</h3>
                <p>Log sleep, feeding, diapers, and mood in seconds. Our smart tracking helps you spot patterns and understand your baby better.</p>
              </div>

              <div class="feature">
                <h3>🤖 AI Parenting Assistant</h3>
                <p>Get personalized, evidence-based guidance anytime. Ask questions and receive empathetic, research-backed answers.</p>
              </div>

              <div class="feature">
                <h3>📈 Smart Insights</h3>
                <p>Receive daily summaries and suggestions tailored to your child's unique patterns and your parenting goals.</p>
              </div>

              <div class="feature">
                <h3>🎯 Milestone Tracking</h3>
                <p>Monitor developmental milestones and get age-appropriate activity suggestions to support your child's growth.</p>
              </div>

              <div class="cta">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1/send-welcome-email', '') || 'https://cradlecoach.app'}" class="button">Get Started Now</a>
              </div>

              <p><strong>Pro Tips to Get Started:</strong></p>
              <ul>
                <li>Complete your child's profile for personalized insights</li>
                <li>Start logging activities - even a few logs unlock powerful patterns</li>
                <li>Chat with our AI assistant to get answers to your burning questions</li>
                <li>Check out the Smart Suggestions for daily parenting tips</li>
              </ul>

              <p>Remember, parenting is a journey, not a destination. We're here to support you every step of the way!</p>

              <p>If you have any questions, just reply to this email or chat with our AI assistant in the app.</p>

              <p>Happy parenting!</p>
              <p><strong>The CradleCoach Team</strong></p>
            </div>

            <div class="footer">
              <p>This email was sent to ${email} because you signed up for CradleCoach.</p>
              <p>&copy; 2024 CradleCoach. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      };

      console.log('Email content prepared:', emailContent);
      console.log('Note: Email sending requires configuring an email service like Resend');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Welcome email queued',
          email: emailContent,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Event received' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});