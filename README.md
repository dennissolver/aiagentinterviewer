# AI Agent Interviews

AI-Powered Research Interview Platform - Part of the RaiseReady ecosystem.

## Overview

Conduct structured research interviews with AI assistance. Validate ideas, gather insights, and analyze results at scale.

## Features

- **AI Interviewer**: Consistent, professional interviews conducted by AI with natural conversation flow
- **Template-Based**: Create interview templates with acts, themes, and questions
- **Real-Time Analysis**: Tag responses, track sentiment, identify key quotes
- **Batch Analysis**: Aggregate insights across multiple interviews
- **Pre-Built Templates**: InvestorConnect validation interview ready to use

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `ANTHROPIC_API_KEY` - Your Anthropic API key

### 3. Set Up Database

Run the migration to create the interview_sessions table:

```bash
# Using Supabase CLI
supabase db push

# Or run the SQL directly in Supabase dashboard
# See: supabase/migrations/001_interview_sessions.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
AIAgentInterviews/
├── app/                          # Next.js App Router
│   ├── api/interview/            # Interview API routes
│   ├── interview/                # Interview pages
│   └── page.tsx                  # Home page
├── config/                       # App configuration
├── lib/                          # Utility functions
│   └── supabase/                 # Supabase clients
├── modules/
│   └── ai-interview/             # Core interview module
│       ├── config/               # Template registry
│       ├── hooks/                # React hooks
│       ├── lib/                  # Session manager, prompt generator
│       ├── services/             # Supabase persistence
│       └── types/                # TypeScript types
├── supabase/
│   └── migrations/               # Database migrations
└── types/                        # Global types
```

## Using the Interview Module

### Start an Interview

```typescript
import { 
  useInterviewSession, 
  INVESTOR_CONNECT_CONFIG 
} from '@/modules/ai-interview';

function InterviewPage() {
  const {
    messages,
    systemPrompt,
    processResponse,
    complete,
  } = useInterviewSession(INVESTOR_CONNECT_CONFIG, {
    userId: 'user-123',
    interviewType: 'investor_validation',
    configId: INVESTOR_CONNECT_CONFIG.configId,
    configVersion: INVESTOR_CONNECT_CONFIG.version,
  });
}
```

### Create a Custom Template

```typescript
import { InterviewTemplateConfig, PROFILE_TEMPLATES } from '@/modules/ai-interview';

const myTemplate: InterviewTemplateConfig = {
  configId: 'customer_discovery_v1',
  configName: 'Customer Discovery',
  version: '1.0.0',
  
  researchPurpose: 'Understand customer pain points',
  targetInterviewee: 'Potential customers',
  interviewerPersona: 'Friendly, curious researcher',
  
  estimatedDurationMins: 25,
  
  welcomeMessage: 'Thank you for participating...',
  consentRequirements: ['I consent to being recorded'],
  profileFields: PROFILE_TEMPLATES.customer,
  
  // ... acts, themes, questions
};
```

## Pre-Built Templates

### InvestorConnect Validation

Interview template for validating the InvestorConnect platform with investors:

- **Duration**: ~30 minutes
- **Structure**: 3 acts, 7 themes
- **Concepts Tested**: 5 (Unified Data, AI Narrative, Video Updates, Structured Asks, Two-Way Accountability)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Claude (Anthropic)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/interview/start` | POST | Start a new interview |
| `/api/interview/chat` | POST | Send message, get AI response |
| `/api/interview/complete` | POST | Complete interview, generate feedback |
| `/api/interview/session/[id]` | GET | Get session data |

## Development

```bash
# Run development server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Make sure to set environment variables in your Vercel project settings.

## Part of RaiseReady Ecosystem

This project is designed to integrate with:

- **RaiseReady**: Pre-funding pitch preparation
- **InvestorConnect**: Post-funding communication platform
- **CleanClose**: Exit/failure processes

## License

Proprietary - RaiseReady
