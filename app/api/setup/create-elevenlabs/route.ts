// app/api/setup/create-elevenlabs/route.ts
import { NextRequest, NextResponse } from 'next/server';

const SETUP_AGENT_PROMPT = `You are a Setup Agent for an AI Interview Platform. Your job is to help users design their custom AI interviewer through voice conversation.

## Opening
"Hi, I'm your AI setup assistant. I'll help you create a custom AI voice interviewer in just a few minutes. What's your name?"

Then: "Great to meet you! What would you like your AI interviewer to help you with? For example: customer feedback, user research, job screening, or surveys?"

## Gather These Details (one at a time)
1. Interview purpose - what they want to learn
2. Target audience - who will be interviewed  
3. Tone - professional, friendly, or casual
4. Duration - how long interviews should take
5. Key topics - main areas to cover
6. Constraints - topics to avoid

## Rules
- ONE question at a time
- Under 30 words per response
- Be warm and encouraging
- Confirm before moving on

## Wrap Up
Summarize what you learned, then say:
"Perfect! You can hang up now. Check your screen for the summary and you'll get your interview link by email shortly!"`;

export async function POST(request: NextRequest) {
  try {
    const { platformName, voiceGender, companyName } = await request.json();

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenlabsApiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    const agentDisplayName = `${companyName || platformName} Setup Agent`;

    // Check for existing agent
    console.log('Checking for existing ElevenLabs agent:', agentDisplayName);
    
    const listRes = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      headers: { 'xi-api-key': elevenlabsApiKey },
    });

    if (listRes.ok) {
      const data = await listRes.json();
      const existing = data.agents?.find((a: any) => a.name === agentDisplayName);
      
      if (existing) {
        console.log('Found existing agent:', existing.agent_id);
        return NextResponse.json({
          success: true,
          agentId: existing.agent_id,
          agentName: existing.name,
          alreadyExists: true,
        });
      }
    }

    // Create new agent
    const voiceId = voiceGender === 'male' ? 'pNInz6obpgDQGcFmaJgB' : 'EXAVITQu4vr4xnSDxMaL';

    console.log('Creating ElevenLabs agent:', agentDisplayName);

    const createRes = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: agentDisplayName,
        conversation_config: {
          agent: {
            prompt: { prompt: SETUP_AGENT_PROMPT },
            first_message: "Hi, I'm your AI setup assistant. I'll help you create a custom AI voice interviewer in just a few minutes. What's your name?",
            language: 'en',
          },
          tts: {
            voice_id: voiceId,
            model_id: 'eleven_turbo_v2_5',
          },
          stt: { provider: 'elevenlabs' },
          turn: { mode: 'turn_based' },
        },
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error('ElevenLabs creation failed:', error);
      return NextResponse.json(
        { error: error.detail?.message || error.detail || 'Failed to create agent' },
        { status: 400 }
      );
    }

    const agent = await createRes.json();
    console.log('ElevenLabs agent created:', agent.agent_id);

    return NextResponse.json({
      success: true,
      agentId: agent.agent_id,
      agentName: agent.name,
    });

  } catch (error: any) {
    console.error('Create ElevenLabs error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ElevenLabs agent' },
      { status: 500 }
    );
  }
}