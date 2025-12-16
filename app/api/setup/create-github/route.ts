// app/api/setup/create-github/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { platformName, companyName, supabase, elevenlabs, vercelUrl } = await request.json();

    if (!platformName) {
      return NextResponse.json({ error: 'Platform name required' }, { status: 400 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const templateOwner = process.env.GITHUB_TEMPLATE_OWNER || 'dennissolver';
    const templateRepo = process.env.GITHUB_TEMPLATE_REPO || 'connexions';
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!githubToken) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
    }

    const safeName = platformName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100);

    // Check if repo already exists
    console.log('Checking for existing GitHub repo:', safeName);
    
    const checkRes = await fetch(`https://api.github.com/repos/${templateOwner}/${safeName}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      console.log('Found existing repo:', existing.html_url);
      
      // Still update env file
      await updateEnvFile(githubToken, templateOwner, safeName, {
        supabase,
        elevenlabs,
        elevenlabsApiKey,
        vercelUrl,
        companyName,
      });
      
      return NextResponse.json({
        success: true,
        repoUrl: existing.html_url,
        repoName: safeName,
        fullName: existing.full_name,
        alreadyExists: true,
      });
    }

    // Create from template
    console.log('Creating GitHub repository from template:', templateRepo);

    const createRes = await fetch(`https://api.github.com/repos/${templateOwner}/${templateRepo}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        owner: templateOwner,
        name: safeName,
        description: `AI Interview Platform for ${companyName || platformName}`,
        private: false,
        include_all_branches: false,
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error('GitHub creation failed:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create repository' },
        { status: 400 }
      );
    }

    const repo = await createRes.json();
    console.log('GitHub repository created:', repo.html_url);

    // Wait for repo initialization
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update .env.example with all values
    await updateEnvFile(githubToken, templateOwner, safeName, {
      supabase,
      elevenlabs,
      elevenlabsApiKey,
      vercelUrl,
      companyName,
    });

    return NextResponse.json({
      success: true,
      repoUrl: repo.html_url,
      repoName: safeName,
      fullName: repo.full_name,
    });

  } catch (error: any) {
    console.error('Create GitHub error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create repository' },
      { status: 500 }
    );
  }
}

async function updateEnvFile(
  token: string,
  owner: string,
  repo: string,
  config: {
    supabase?: { url: string; anonKey: string; serviceKey: string };
    elevenlabs?: { agentId: string };
    elevenlabsApiKey?: string;
    vercelUrl?: string;
    companyName?: string;
  }
): Promise<void> {
  try {
    // Build .env.local content
    const envContent = `# Auto-generated environment variables
# Supabase
NEXT_PUBLIC_SUPABASE_URL=${config.supabase?.url || ''}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabase?.anonKey || ''}
SUPABASE_SERVICE_ROLE_KEY=${config.supabase?.serviceKey || ''}

# ElevenLabs
ELEVENLABS_API_KEY=${config.elevenlabsApiKey || ''}
ELEVENLABS_SETUP_AGENT_ID=${config.elevenlabs?.agentId || ''}

# App Configuration
NEXT_PUBLIC_APP_URL=${config.vercelUrl || ''}
NEXT_PUBLIC_COMPANY_NAME=${config.companyName || ''}
`;

    // Check if .env.example exists
    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/.env.example`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const file = await getRes.json();
      sha = file.sha;
    }

    // Create or update .env.example
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/.env.example`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        message: 'Configure environment variables for platform',
        content: Buffer.from(envContent).toString('base64'),
        ...(sha && { sha }),
      }),
    });

    if (putRes.ok) {
      console.log('.env.example updated with platform config');
    } else {
      const error = await putRes.json();
      console.warn('.env.example update warning:', error);
    }
  } catch (err) {
    console.warn('Could not update .env.example:', err);
  }
}