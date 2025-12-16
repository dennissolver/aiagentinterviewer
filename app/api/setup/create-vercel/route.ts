// app/api/setup/create-vercel/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { platformName, githubRepoName, supabase, elevenlabs, companyName } = await request.json();

    if (!platformName || !githubRepoName) {
      return NextResponse.json(
        { error: 'Platform name and GitHub repo required' },
        { status: 400 }
      );
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    const githubOwner = process.env.GITHUB_TEMPLATE_OWNER || 'dennissolver';
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!vercelToken) {
      return NextResponse.json({ error: 'VERCEL_TOKEN not configured' }, { status: 500 });
    }

    const safeName = platformName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100);
    const teamQuery = vercelTeamId ? `?teamId=${vercelTeamId}` : '';
    const vercelUrl = `https://${safeName}.vercel.app`;

    // Build complete env vars
    const envVars: Record<string, string> = {
      NEXT_PUBLIC_SUPABASE_URL: supabase?.url || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase?.anonKey || '',
      SUPABASE_SERVICE_ROLE_KEY: supabase?.serviceKey || '',
      ELEVENLABS_API_KEY: elevenlabsApiKey || '',
      ELEVENLABS_SETUP_AGENT_ID: elevenlabs?.agentId || '',
      NEXT_PUBLIC_APP_URL: vercelUrl,
      NEXT_PUBLIC_COMPANY_NAME: companyName || '',
    };

    // Check if project already exists
    console.log('Checking for existing Vercel project:', safeName);
    
    const checkRes = await fetch(`https://api.vercel.com/v9/projects/${safeName}${teamQuery}`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      console.log('Found existing project:', existing.id);
      
      // Update env vars
      await setEnvVars(vercelToken, existing.id, envVars, vercelTeamId);
      
      // Trigger redeploy
      await triggerDeployment(vercelToken, safeName, existing.id, githubOwner, githubRepoName, vercelTeamId);
      
      return NextResponse.json({
        success: true,
        projectId: existing.id,
        url: vercelUrl,
        projectName: safeName,
        alreadyExists: true,
      });
    }

    // Create new project
    console.log('Creating Vercel project:', safeName);

    const createRes = await fetch(`https://api.vercel.com/v10/projects${teamQuery}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: safeName,
        framework: 'nextjs',
        gitRepository: {
          type: 'github',
          repo: `${githubOwner}/${githubRepoName}`,
        },
        buildCommand: 'npm run build',
        outputDirectory: '.next',
        installCommand: 'npm install',
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error('Vercel creation failed:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to create project' },
        { status: 400 }
      );
    }

    const project = await createRes.json();
    console.log('Vercel project created:', project.id);

    // Set all environment variables
    console.log('Setting environment variables...');
    await setEnvVars(vercelToken, project.id, envVars, vercelTeamId);

    // Trigger initial deployment
    console.log('Triggering deployment...');
    await triggerDeployment(vercelToken, safeName, project.id, githubOwner, githubRepoName, vercelTeamId);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      url: vercelUrl,
      projectName: safeName,
    });

  } catch (error: any) {
    console.error('Create Vercel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Vercel project' },
      { status: 500 }
    );
  }
}

async function setEnvVars(
  token: string,
  projectId: string,
  envVars: Record<string, string>,
  teamId?: string
): Promise<void> {
  const teamQuery = teamId ? `?teamId=${teamId}` : '';

  for (const [key, value] of Object.entries(envVars)) {
    if (!value) continue;

    try {
      // Check if exists
      const listRes = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env${teamQuery}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let existingId: string | null = null;
      if (listRes.ok) {
        const data = await listRes.json();
        const existing = data.envs?.find((e: any) => e.key === key);
        if (existing) existingId = existing.id;
      }

      if (existingId) {
        // Update existing
        await fetch(
          `https://api.vercel.com/v9/projects/${projectId}/env/${existingId}${teamQuery}`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value,
              target: ['production', 'preview', 'development'],
            }),
          }
        );
        console.log(`Updated env: ${key}`);
      } else {
        // Create new
        await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${teamQuery}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key,
            value,
            type: key.includes('KEY') || key.includes('SECRET') ? 'encrypted' : 'plain',
            target: ['production', 'preview', 'development'],
          }),
        });
        console.log(`Created env: ${key}`);
      }
    } catch (err) {
      console.warn(`Failed to set ${key}:`, err);
    }
  }
}

async function triggerDeployment(
  token: string,
  name: string,
  projectId: string,
  owner: string,
  repo: string,
  teamId?: string
): Promise<void> {
  try {
    const teamQuery = teamId ? `?teamId=${teamId}` : '';
    const res = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        project: projectId,
        target: 'production',
        gitSource: {
          type: 'github',
          repo: `${owner}/${repo}`,
          ref: 'main',
        },
      }),
    });

    if (res.ok) {
      const deployment = await res.json();
      console.log('Deployment triggered:', deployment.id);
    } else {
      console.warn('Deployment trigger response:', await res.text());
    }
  } catch (err) {
    console.warn('Deployment trigger failed:', err);
  }
}