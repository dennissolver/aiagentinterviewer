'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, User, Clock, MessageSquare, Target, Mic, CheckCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

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
  phone: string;
  companyName: string;
}

export default function ConfirmPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [client, setClient] = useState<ClientDetails>({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Load config from session storage on mount
  useEffect(() => {
    const storedConfig = sessionStorage.getItem('agentConfig');
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      setConfig(parsed);
      // Pre-fill client details from conversation
      setClient(prev => ({
        ...prev,
        fullName: parsed.clientName || '',
        companyName: parsed.companyName || '',
      }));
    } else {
      // No config, redirect back to create
      router.push('/create');
    }
  }, [router]);

  const handleInputChange = (field: keyof ClientDetails, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isValid = client.fullName && client.email && client.companyName;

  const handleCreate = async () => {
    if (!isValid || !config) return;

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, client }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
      }

      // Clear session storage
      sessionStorage.removeItem('agentConfig');
      sessionStorage.removeItem('setupTranscript');

      // Store the new agent info for success page
      sessionStorage.setItem('createdAgent', JSON.stringify(data.agent));

      // Redirect to success/dashboard
      router.push(`/interview/${data.agent.id}?created=true`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setIsCreating(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/create')}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold">Review & Create</h1>
            <p className="text-sm text-slate-400">Confirm your AI interviewer settings</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Summary Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            AI Interviewer Summary
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Purpose */}
            {config.interviewPurpose && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Target className="w-4 h-4" />
                  Purpose
                </div>
                <p className="text-white">{config.interviewPurpose}</p>
              </div>
            )}

            {/* Audience */}
            {config.targetAudience && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <User className="w-4 h-4" />
                  Target Audience
                </div>
                <p className="text-white">{config.targetAudience}</p>
              </div>
            )}

            {/* Style */}
            {config.interviewStyle && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <MessageSquare className="w-4 h-4" />
                  Style
                </div>
                <p className="text-white capitalize">{config.interviewStyle}</p>
              </div>
            )}

            {/* Tone */}
            {config.tone && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Mic className="w-4 h-4" />
                  Tone
                </div>
                <p className="text-white capitalize">{config.tone}</p>
              </div>
            )}

            {/* Duration */}
            {config.timeLimit && (
              <div className="bg-slate-900 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Duration
                </div>
                <p className="text-white">{config.timeLimit} minutes</p>
              </div>
            )}
          </div>

          {/* Key Topics */}
          {config.keyTopics && config.keyTopics.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-4 mt-4">
              <p className="text-slate-400 text-sm mb-2">Key Topics</p>
              <div className="flex flex-wrap gap-2">
                {config.keyTopics.map((topic, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Questions */}
          {config.keyQuestions && config.keyQuestions.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-4 mt-4">
              <p className="text-slate-400 text-sm mb-2">Key Questions</p>
              <ul className="space-y-1">
                {config.keyQuestions.map((q, i) => (
                  <li key={i} className="text-white text-sm">• {q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Summary */}
          {config.summary && (
            <div className="bg-slate-900 rounded-xl p-4 mt-4">
              <p className="text-slate-400 text-sm mb-2">Full Description</p>
              <p className="text-white text-sm whitespace-pre-wrap">{config.summary}</p>
            </div>
          )}
        </section>

        {/* Client Details Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Your Details
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            We need a few details to set up your account.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={client.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={client.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Acme Inc"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={client.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="john@acme.com"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Phone <span className="text-slate-600">(optional)</span>
              </label>
              <input
                type="tel"
                value={client.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+1 555 123 4567"
              />
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreate}
          disabled={!isValid || isCreating}
          className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating your AI Interviewer...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Create My AI Interviewer
            </>
          )}
        </button>

        <p className="text-center text-slate-500 text-sm mt-4">
          You'll get a shareable link to send to interviewees
        </p>
      </main>
    </div>
  );
}