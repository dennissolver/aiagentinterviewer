import { NextRequest, NextResponse } from 'next/server';

const SETUP_AGENT_PROMPT = `You are a Setup Agent — a conversational AI whose sole job is to design the client's custom AI interviewer agent through voice conversation.

## Your Opening
Start with:
"Hi, I'm your AI setup assistant. Can I get your name and the name of your business?"

Then naturally ask:
"How can we help you today? What kind of interviews do you want your AI agent to conduct?"

## Discovery Conversation
Through natural voice dialogue (NOT forms), understand:

### 1. Purpose of the Interview
- Lead qualification
- Founder screening  
- Customer discovery
- Compliance / intake
- Research / survey
- Internal HR screening
- User research
- Exit interviews

### 2. Interview Style
- Unstructured discovery — exploratory, follow the thread
- Semi-structured guided — key topics but flexible flow
- Fixed survey / scripted — consistent questions

### 3. Audience (Who will be interviewed?)
- Founders, Customers, Investors, Employees, Job applicants, General public

### 4. Tone and Constraints
- Formal vs conversational vs friendly
- Time limits
- Data sensitivity
- Compliance requirements

### 5. Outputs Required
- Transcripts, Summaries, Scoring, Recommendations

## Conversation Style
- Ask ONE question at a time
- Acknowledge what they share before moving on
- Use their name occasionally
- Be warm and curious, not robotic
- Keep responses concise for voice

## Clarification & Confirmation
Once you fully understand their needs, explicitly confirm:

"Here's my understanding of what you want your interviewer to do: [summary]. Does this capture what you're looking for?"

When they confirm, say:
"Perfect! I've got everything I need. You can hang up now and you'll see a summary on screen to review and confirm."`;

/**
 * Starts an ElevenLabs voice conversation for the Setup Agent
 */
export async function POST(request: NextRequest) {
  try {
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Check if we have a pre-configured Setup Agent ID
    let agentId = process.env.ELEVENLABS_SETUP_AGENT_ID;

    // If no pre-configured agent, create one dynamically
    if (!agentId) {
      const createAgentRes = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Setup Agent',
          conversation_config: {
            agent: {
              prompt: {
                prompt: SETUP_AGENT_PROMPT,
              },
              first_message: "Hi, I'm your AI setup assistant. I'm here to help you design a custom AI interviewer. Can I get your name and the name of your business?",
              language: 'en',
            },
            tts: {
              voice_id: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL', // Sarah voice
            },
          },
        }),
      });

      if (!createAgentRes.ok) {
        const error = await createAgentRes.json();
        console.error('Failed to create ElevenLabs agent:', error);
        return NextResponse.json(
          { error: 'Failed to create voice agent' },
          { status: 500 }
        );
      }

      const agentData = await createAgentRes.json();
      agentId = agentData.agent_id;
    }

    // Get signed URL for the conversation
    const signedUrlRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
        },
      }
    );

    if (!signedUrlRes.ok) {
      const error = await signedUrlRes.json();
      console.error('Failed to get signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to start voice session' },
        { status: 500 }
      );
    }

    const signedUrlData = await signedUrlRes.json();

    return NextResponse.json({
      success: true,
      agentId,
      signedUrl: signedUrlData.signed_url,
    });

  } catch (error) {
    console.error('Voice session start error:', error);
    return NextResponse.json(
      { error: 'Failed to start voice session' },
      { status: 500 }
    );
  }
}
