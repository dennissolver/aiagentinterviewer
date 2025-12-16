// app/demo/DemoClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic, Phone, PhoneOff, Loader2, CheckCircle,
  ArrowRight, MessageSquare, Sparkles, PartyPopper
} from 'lucide-react';

type DemoState =
  | 'loading'
  | 'ready_for_setup'
  | 'setup_in_progress'
  | 'setup_complete'
  | 'parsing'
  | 'creating_trial'
  | 'trial_ready'
  | 'trial_in_progress'
  | 'trial_complete'
  | 'results_sent'
  | 'error';

interface LeadData {
  name: string;
  company: string;
  email: string;
  website?: string;
  status: string;
  trialAgentId?: string;
  interviewSpec?: {
    interview_purpose?: string;
    target_audience?: string;
    tone?: string;
    estimated_duration_mins?: number;
  };
}

export default function DemoClient() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [state, setState] = useState<DemoState>('loading');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [error, setError] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);

  const SETUP_AGENT_ID = process.env.NEXT_PUBLIC_DEMO_SETUP_AGENT_ID || '';

  const checkStatus = useCallback(async () => {
    if (!leadId) return;

    try {
      const res = await fetch(`/api/demo/status/${leadId}`);
      const data = await res.json();

      if (res.ok) {
        setLeadData(prev => ({ ...prev, ...data }));

        switch (data.status) {
          case 'new':
            setState('ready_for_setup');
            break;
          case 'setup_started':
            setState('setup_in_progress');
            break;
          case 'setup_complete':
            setState('setup_complete');
            break;
          case 'parsing':
            setState('parsing');
            break;
          case 'creating_trial':
            setState('creating_trial');
            break;
          case 'trial_ready':
            setState('trial_ready');
            if (data.trialAgentId) {
              setCurrentAgentId(data.trialAgentId);
            }
            break;
          case 'trial_started':
            setState('trial_in_progress');
            break;
          case 'trial_complete':
            setState('trial_complete');
            break;
          case 'results_sent':
            setState('results_sent');
            break;
          case 'error':
            setState('error');
            setError(data.error_message || 'Something went wrong');
            break;
        }
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  }, [leadId]);

  useEffect(() => {
    if (!leadId) {
      setError('No demo session found. Please start from the homepage.');
      setState('error');
      return;
    }

    checkStatus();

    const interval = setInterval(() => {
      if (['setup_complete', 'parsing', 'creating_trial'].includes(state)) {
        checkStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [leadId, state, checkStatus]);

  useEffect(() => {
    if (showWidget && currentAgentId) {
      const existingScript = document.querySelector('script[src*="elevenlabs"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [showWidget, currentAgentId]);

  const startSetupCall = async () => {
    setState('setup_in_progress');
    setCurrentAgentId(SETUP_AGENT_ID);
    setShowWidget(true);

    await fetch('/api/demo/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, status: 'setup_started' }),
    });
  };

  const startTrialInterview = async () => {
    setState('trial_in_progress');
    setShowWidget(true);

    await fetch('/api/demo/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, status: 'trial_started' }),
    });
  };

  const endCall = () => {
    setShowWidget(false);
    if (state === 'setup_in_progress') {
      setState('setup_complete');
    } else if (state === 'trial_in_progress') {
      setState('trial_complete');
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading your demo session...</p>
          </div>
        );

      case 'ready_for_setup':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {leadData?.name}!</h1>
            <p className="text-slate-300 mb-2">
              Let us design your custom AI interviewer for <strong>{leadData?.company}</strong>.
            </p>
            <p className="text-slate-400 mb-8">
              Our Setup Agent will ask you a few questions about what you want to build.
              This takes about 3-5 minutes.
            </p>
            <button
              onClick={startSetupCall}
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-green-500/25"
            >
              <Phone className="w-6 h-6" />
              Start Setup Call
            </button>
          </div>
        );

      case 'setup_in_progress':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Mic className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Call in Progress</h2>
            <p className="text-slate-400 mb-8">
              Speak naturally with the Setup Agent. When you are done, click End Call.
            </p>

            {showWidget && currentAgentId && (
              <div className="mb-6" dangerouslySetInnerHTML={{
                __html: `<elevenlabs-convai agent-id="${currentAgentId}"></elevenlabs-convai>`
              }} />
            )}

            <button
              onClick={endCall}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-medium transition"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </button>
          </div>
        );

      case 'setup_complete':
      case 'parsing':
      case 'creating_trial':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Creating Your Trial Interview</h2>
            <p className="text-slate-400 mb-8">
              We are analyzing your requirements and building a custom AI interviewer just for you...
            </p>

            <div className="space-y-3 text-left bg-slate-900 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-300">Setup conversation captured</span>
              </div>
              <div className="flex items-center gap-3">
                {state === 'parsing' || state === 'creating_trial' ? (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                )}
                <span className={state === 'parsing' ? 'text-purple-400' : 'text-slate-500'}>
                  Analyzing your requirements
                </span>
              </div>
              <div className="flex items-center gap-3">
                {state === 'creating_trial' ? (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                )}
                <span className={state === 'creating_trial' ? 'text-purple-400' : 'text-slate-500'}>
                  Creating your trial interviewer
                </span>
              </div>
            </div>
          </div>
        );

      case 'trial_ready':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Your Trial is Ready!</h2>

            {leadData?.interviewSpec && (
              <div className="bg-slate-900 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-purple-400 mb-3">Interview Preview</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><strong>Purpose:</strong> {leadData.interviewSpec.interview_purpose}</li>
                  <li><strong>Audience:</strong> {leadData.interviewSpec.target_audience}</li>
                  <li><strong>Tone:</strong> {leadData.interviewSpec.tone}</li>
                  <li><strong>Duration:</strong> ~{leadData.interviewSpec.estimated_duration_mins} mins</li>
                </ul>
              </div>
            )}

            <p className="text-slate-400 mb-6">
              Now experience it yourself! Click below to start a trial interview as if you were an interviewee.
            </p>

            <button
              onClick={startTrialInterview}
              className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
            >
              <MessageSquare className="w-6 h-6" />
              Start Trial Interview
            </button>
          </div>
        );

      case 'trial_in_progress':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <MessageSquare className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Trial Interview in Progress</h2>
            <p className="text-slate-400 mb-8">
              Experience your custom interview as an interviewee would.
            </p>

            {showWidget && currentAgentId && (
              <div className="mb-6" dangerouslySetInnerHTML={{
                __html: `<elevenlabs-convai agent-id="${currentAgentId}"></elevenlabs-convai>`
              }} />
            )}

            <button
              onClick={endCall}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-medium transition"
            >
              <PhoneOff className="w-5 h-5" />
              End Interview
            </button>
          </div>
        );

      case 'trial_complete':
      case 'results_sent':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-green-400 mb-4">Trial Complete!</h2>
            <p className="text-slate-300 mb-2">
              Amazing! You just experienced your custom AI interviewer in action.
            </p>
            <p className="text-slate-400 mb-8">
              We have sent the interview results to <strong>{leadData?.email}</strong>.
            </p>

            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-3">Want Your Own Platform?</h3>
              <p className="text-slate-300 mb-4">
                Run unlimited interviews, surveys, and questionnaires with your own AI voice agents.
              </p>
              <ul className="text-sm text-slate-400 mb-6 space-y-1">
                <li>Unlimited interview agents</li>
                <li>Full analytics dashboard</li>
                <li>Drift detection and quality monitoring</li>
                <li>$150/month + $4 per interview over 100</li>
              </ul>
              <Link
                href={`/buyer?leadId=${leadId}`}
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-slate-200 transition"
              >
                Get Your Own Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm">
              Back to Homepage
            </Link>
          </div>
        );

      case 'error':
        return (
          <div className="text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">:(</span>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something Went Wrong</h2>
            <p className="text-slate-400 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-medium transition"
            >
              Start Over
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      {renderContent()}
    </div>
  );
}