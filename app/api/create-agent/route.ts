import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AgentConfig {
  clientName?: string;
  companyName?: string;
  interviewPurpose?: string;
  targetAudience?: string;
  interviewStyle?: string;
  tone?: string;
  timeLimit?: number;
  outputsRequired?: string[];
  keyTopics?: string[];
  keyQuestions?: string[];
  constraints?: string[];
  summary?: string;
}

interface ClientDetails {
  fullName: string;
  email: string;
  phone?: string;
  companyName: string;
}

/**
 * Creates a new AI Interviewer agent from the Setup Agent conversation
 * - Creates ElevenLabs agent
 * - Saves to database
 * - Returns interview URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, client }: { config: AgentConfig; client: ClientDetails } = body;

    if (!config || !client) {
      return NextResponse.json(
        { error: 'Config and client details required' },
        { status: 400 }
      );
    }

    if (!client.fullName || !client.email || !client.companyName) {
      return NextResponse.json(
        { error: 'Full name, email, and company name required' },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Generate the interviewer prompt from config
    const interviewerPrompt = generateInterviewerPrompt(config, client.companyName);

    // Create ElevenLabs agent
    const agentRes = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${client.companyName} Interviewer`,
        conversation_config: {
          agent: {
            prompt: {
              prompt: interviewerPrompt,
            },
            first_message: generateFirstMessage(config, client.companyName),
            language: 'en',
          },
          tts: {
            voice_id: getVoiceForTone(config.tone),
          },
        },
      }),
    });

    if (!agentRes.ok) {
      const error = await agentRes.json();
      console.error('Failed to create ElevenLabs agent:', error);
      return NextResponse.json(
        { error: 'Failed to create voice agent' },
        { status: 500 }
      );
    }

    const agentData = await agentRes.json();
    const elevenLabsAgentId = agentData.agent_id;

    // Generate slug
    const slug = generateSlug(client.companyName);

    // Save to database if Supabase is configured
    let dbAgent = null;
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // First, create or get client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', client.email)
        .single();

      let clientId = existingClient?.id;

      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            email: client.email,
            name: client.fullName,
            company_name: client.companyName,
          })
          .select('id')
          .single();

        if (clientError) {
          console.error('Failed to create client:', clientError);
        } else {
          clientId = newClient?.id;
        }
      }

      // Create agent record
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .insert({
          client_id: clientId,
          name: `${client.companyName} Interviewer`,
          slug,
          status: 'active',
          company_name: client.companyName,
          interview_purpose: config.interviewPurpose || '',
          target_interviewees: config.targetAudience || '',
          interviewer_tone: config.tone || 'professional',
          estimated_duration_mins: config.timeLimit || 15,
          themes: config.keyTopics || [],
          key_topics: config.keyTopics || [],
          key_questions: config.keyQuestions || [],
          constraints: config.constraints || [],
          elevenlabs_agent_id: elevenLabsAgentId,
        })
        .select()
        .single();

      if (agentError) {
        console.error('Failed to save agent:', agentError);
      } else {
        dbAgent = agent;
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const interviewUrl = `${baseUrl}/i/${slug}`;

    return NextResponse.json({
      success: true,
      agent: {
        id: dbAgent?.id || elevenLabsAgentId,
        slug,
        name: `${client.companyName} Interviewer`,
        elevenLabsAgentId,
        interviewUrl,
      },
    });

  } catch (error) {
    console.error('Create agent error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

function generateInterviewerPrompt(config: AgentConfig, companyName: string): string {
  let prompt = `You are an AI interviewer for ${companyName}.\n\n`;

  if (config.summary) {
    prompt += config.summary + '\n\n';
  }

  prompt += '## Your Role\n';
  prompt += `You conduct ${config.interviewPurpose || 'research'} interviews with ${config.targetAudience || 'participants'}.\n\n`;

  prompt += '## Interview Style\n';
  const styles: Record<string, string> = {
    'unstructured': 'Be exploratory and conversational. Follow the natural flow of discussion. Dig deeper into interesting points.',
    'semi-structured': 'Cover key topics but adapt based on responses. Have flexibility in how you explore areas.',
    'structured': 'Follow a consistent set of questions. Ensure comparability across interviews.',
  };
  prompt += (styles[config.interviewStyle || ''] || styles['semi-structured']) + '\n\n';

  prompt += '## Tone\n';
  const tones: Record<string, string> = {
    'formal': 'Maintain a formal, professional demeanor.',
    'professional': 'Be professional but warm and approachable.',
    'friendly': 'Be friendly and conversational. Put them at ease.',
    'casual': 'Be casual and relaxed. Like a conversation with a colleague.',
  };
  prompt += (tones[config.tone || ''] || tones['professional']) + '\n\n';

  if (config.keyTopics && config.keyTopics.length > 0) {
    prompt += '## Key Topics to Explore\n';
    config.keyTopics.forEach(topic => {
      prompt += `- ${topic}\n`;
    });
    prompt += '\n';
  }

  if (config.keyQuestions && config.keyQuestions.length > 0) {
    prompt += '## Specific Questions to Ask\n';
    config.keyQuestions.forEach(q => {
      prompt += `- ${q}\n`;
    });
    prompt += '\n';
  }

  if (config.constraints && config.constraints.length > 0) {
    prompt += '## Constraints & Sensitivities\n';
    config.constraints.forEach(c => {
      prompt += `- ${c}\n`;
    });
    prompt += '\n';
  }

  if (config.timeLimit) {
    prompt += `## Duration\nAim to complete the interview in about ${config.timeLimit} minutes.\n\n`;
  }

  prompt += '## Guidelines\n';
  prompt += '- Listen actively and acknowledge responses\n';
  prompt += '- Ask follow-up questions to understand deeper motivations\n';
  prompt += '- Keep the conversation natural and flowing\n';
  prompt += '- Be respectful of their time\n';
  prompt += '- Thank them at the end\n';

  return prompt;
}

function generateFirstMessage(config: AgentConfig, companyName: string): string {
  const greetings: Record<string, string> = {
    'formal': `Good day. Thank you for joining this ${companyName} interview. I appreciate you taking the time to speak with me today. May I ask your name?`,
    'professional': `Hi there! Thank you for joining this interview with ${companyName}. I really appreciate you taking the time. Before we begin, may I ask your name?`,
    'friendly': `Hey! Thanks so much for chatting with me today. I'm really looking forward to hearing your thoughts. What's your name?`,
    'casual': `Hi! Thanks for hopping on. I'd love to hear your perspective. First off, what's your name?`,
  };

  return greetings[config.tone || ''] || greetings['professional'];
}

function getVoiceForTone(tone?: string): string {
  // ElevenLabs voice IDs
  const voices: Record<string, string> = {
    'formal': 'pNInz6obpgDQGcFmaJgB', // Adam
    'professional': 'EXAVITQu4vr4xnSDxMaL', // Sarah
    'friendly': '21m00Tcm4TlvDq8ikWAM', // Rachel
    'casual': 'AZnzlk1XvdvUeBnXmlld', // Domi
  };

  return voices[tone || ''] || voices['professional'];
}

function generateSlug(companyName: string): string {
  const base = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}
