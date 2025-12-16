// app/api/setup/create-github/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Accept multiple parameter formats
    const repoName = body.repoName || body.projectName;
    const platformName = body.platformName || body.formData?.platformName;
    const companyName = body.companyName || body.formData?.companyName;
    const supabaseUrl = body.supabaseUrl || body.createdResources?.supabaseUrl;
    const supabaseAnonKey = body.supabaseAnonKey || body.createdResources?.supabaseAnonKey;

    if (!repoName || !platformName) {
      return NextResponse.json(
        { error: 'Platform name required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER;
    const templateRepo = process.env.GITHUB_TEMPLATE_REPO || 'connexions-template';

    if (!githubToken || !githubOwner) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN and GITHUB_OWNER required' },
        { status: 500 }
      );
    }

    const safeName = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 100);

    // Check if repo already exists
    console.log('Checking for existing repo:', safeName);
    const checkRes = await fetch(`https://api.github.com/repos/${githubOwner}/${safeName}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (checkRes.ok) {
      console.log('Repo already exists:', safeName);
      return NextResponse.json({
        success: true,
        repoUrl: `https://github.com/${githubOwner}/${safeName}`,
        repoName: safeName,
        alreadyExists: true,
      });
    }

    // Create repo from template
    console.log('Creating repo from template:', templateRepo);
    const createRes = await fetch(`https://api.github.com/repos/${githubOwner}/${templateRepo}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        owner: githubOwner,
        name: safeName,
        description: `AI Interview Platform for ${companyName || platformName}`,
        private: false,
        include_all_branches: false,
      }),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error('GitHub repo creation failed:', error);
      
      // If template doesn't exist, create empty repo
      if (error.message?.includes('Not Found') || error.message?.includes('template')) {
        console.log('Template not found, creating empty repo');
        
        const emptyRepoRes = await fetch(`https://api.github.com/user/repos`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: safeName,
            description: `AI Interview Platform for ${companyName || platformName}`,
            private: false,
            auto_init: true,
          }),
        });

        if (!emptyRepoRes.ok) {
          const emptyError = await emptyRepoRes.json();
          return NextResponse.json(
            { error: emptyError.message || 'Failed to create repository' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: error.message || 'Failed to create repository' },
          { status: 400 }
        );
      }
    }

    const repoUrl = `https://github.com/${githubOwner}/${safeName}`;
    console.log('GitHub repo created:', repoUrl);

    // Wait a moment for repo to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update README with platform info
    try {
      const readmeContent = Buffer.from(`# ${platformName}

AI Interview Platform for ${companyName || platformName}

## Configuration

- **Supabase URL**: ${supabaseUrl || 'Configure in Vercel'}
- **Platform**: ${platformName}
- **Company**: ${companyName || 'N/A'}

## Getting Started

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run development server: \`npm run dev\`

## Environment Variables

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || 'your-supabase-url'}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey || 'your-anon-key'}
NEXT_PUBLIC_PLATFORM_NAME=${platformName}
\`\`\`
`).toString('base64');

      await fetch(`https://api.github.com/repos/${githubOwner}/${safeName}/contents/README.md`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update README with platform configuration',
          content: readmeContent,
        }),
      });
      console.log('README updated');
    } catch (err) {
      console.warn('Could not update README:', err);
    }

    return NextResponse.json({
      success: true,
      repoUrl,
      repoName: safeName,
    });

  } catch (error: any) {
    console.error('Create GitHub error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create repository' },
      { status: 500 }
    );
  }
}