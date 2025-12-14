import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Starts a voice interview session
 * - Creates interview record in database
 * - Gets signed URL from ElevenLabs for the agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, elevenLabsAgentId } = body;

    if (!elevenLabsAgentId) {
      return NextResponse.json(
        { error: 'ElevenLabs agent ID required' },
        { status: 400 }
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Get signed URL from ElevenLabs
    const signedUrlRes = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${elevenLabsAgentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsKey,
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

    // Create interview record in database
    let interviewId = null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: interview, error: dbError } = await supabase
        .from('interviews')
        .insert({
          agent_id: agentId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          source: 'voice',
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Failed to create interview record:', dbError);
      } else {
        interviewId = interview?.id;
      }

      // Increment agent's total_interviews count
      if (agentId) {
        await supabase.rpc('increment_agent_interviews', { p_agent_id: agentId });
      }
    }

    return NextResponse.json({
      success: true,
      interviewId,
      elevenLabsAgentId,
      signedUrl: signedUrlData.signed_url,
    });

  } catch (error) {
    console.error('Voice start error:', error);
    return NextResponse.json(
      { error: 'Failed to start voice session' },
      { status: 500 }
    );
  }
}
