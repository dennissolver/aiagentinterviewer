import { NextRequest, NextResponse } from 'next/server';

// Import sessions from chat route
// Note: In production, use proper session management (Redis/Supabase)
const sessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, followUpInterest, designPartnerInterest } = body;

    // Get session
    const session = sessions.get(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const { manager } = session;

    // Complete the interview
    const feedback = manager.complete({
      followUpInterest: followUpInterest || false,
      designPartnerInterest: designPartnerInterest || false,
    });

    // In production, save to Supabase here
    // await supabaseService.completeSession(sessionId, manager.getState(), feedback);

    return NextResponse.json({
      success: true,
      feedback,
      state: manager.getState(),
    });

  } catch (error) {
    console.error('Failed to complete interview:', error);
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    );
  }
}
