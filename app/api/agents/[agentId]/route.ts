import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/agents/[agentId]
 * Fetches an agent by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const agentIdOrSlug = params.agentId;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to find by UUID first, then by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(agentIdOrSlug);

    let query = supabase
      .from('agents')
      .select('*');

    if (isUUID) {
      query = query.eq('id', agentIdOrSlug);
    } else {
      query = query.eq('slug', agentIdOrSlug);
    }

    const { data: agent, error } = await query.single();

    if (error || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });

  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}