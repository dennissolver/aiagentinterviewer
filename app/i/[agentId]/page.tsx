'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Phone, PhoneOff, Loader2, Mic, MicOff, Bot, CheckCircle } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  company_name: string;
  logo_url?: string;
  primary_color: string;
  background_color: string;
  welcome_message?: string;
  closing_message?: string;
  estimated_duration_mins: number;
  elevenlabs_agent_id: string;
}

type Stage = 'loading' | 'welcome' | 'call' | 'complete' | 'error';

export default function VoiceInterviewPage() {
  const params = useParams();
  const agentSlug = params.agentId as string;

  const [stage, setStage] = useState<Stage>('loading');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [conversation, setConversation] = useState<any>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);

  // Load agent on mount
  useEffect(() => {
    loadAgent();
  }, [agentSlug]);

  const loadAgent = async () => {
    try {
      const response = await fetch(`/api/agents/${agentSlug}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Interview not found');
      }
      
      setAgent(data.agent || data);
      setStage('welcome');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview');
      setStage('error');
    }
  };

  const startCall = async () => {
    if (!agent) return;
    setCallStatus('connecting');
    setStage('call');

    try {
      // Get signed URL for the interview agent
      const response = await fetch('/api/interview/voice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          agentId: agent.id,
          elevenLabsAgentId: agent.elevenlabs_agent_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start call');
      }

      setInterviewId(data.interviewId);

      // Initialize ElevenLabs conversation
      const { Conversation } = await import('@elevenlabs/client');

      const conv = await Conversation.startSession({
        agentId: data.elevenLabsAgentId || agent.elevenlabs_agent_id,
        signedUrl: data.signedUrl,
        onConnect: () => {
          setCallStatus('connected');
        },
        onDisconnect: () => {
          setStage('complete');
          saveInterview('completed');
        },
        onError: (error: any) => {
          console.error('Call error:', error);
          setError('Call disconnected unexpectedly');
        },
      });

      setConversation(conv);

    } catch (err) {
      console.error('Failed to start call:', err);
      setError(err instanceof Error ? err.message : 'Failed to start call');
      setStage('error');
    }
  };

  const endCall = async () => {
    if (conversation) {
      await conversation.endSession();
      setConversation(null);
    }
    setStage('complete');
    saveInterview('completed');
  };

  const toggleMute = () => {
    if (conversation) {
      if (isMuted) {
        conversation.unmute();
      } else {
        conversation.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const saveInterview = async (status: string) => {
    if (!interviewId) return;
    try {
      await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          interviewId,
          status,
        }),
      });
    } catch (err) {
      console.error('Failed to save interview:', err);
    }
  };

  // Custom styles from agent branding
  const primaryColor = agent?.primary_color || '#8B5CF6';
  const backgroundColor = agent?.background_color || '#0F172A';

  return (
    <div 
      className="min-h-screen text-white flex flex-col"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {agent?.logo_url && (
            <img src={agent.logo_url} alt="" className="w-10 h-10 rounded-lg object-contain" />
          )}
          <div>
            <h1 className="font-semibold">{agent?.name || 'Interview'}</h1>
            <p className="text-sm text-white/60">{agent?.company_name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center max-w-lg">

          {/* Loading */}
          {stage === 'loading' && (
            <Loader2 className="w-12 h-12 animate-spin text-white/50 mx-auto" />
          )}

          {/* Error */}
          {stage === 'error' && (
            <>
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">😕</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
              <p className="text-white/60">{error}</p>
            </>
          )}

          {/* Welcome */}
          {stage === 'welcome' && agent && (
            <>
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Bot className="w-10 h-10" style={{ color: primaryColor }} />
              </div>
              <h2 className="text-2xl font-bold mb-4">
                {agent.welcome_message || `Welcome to your interview with ${agent.company_name}`}
              </h2>
              <p className="text-white/60 mb-8">
                This is a voice conversation with an AI interviewer. 
                It will take about {agent.estimated_duration_mins} minutes.
              </p>
              
              <div className="bg-white/5 rounded-xl p-4 mb-8 text-left">
                <h3 className="font-medium mb-2">Before you start:</h3>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Find a quiet place to talk</li>
                  <li>• Allow microphone access when prompted</li>
                  <li>• Speak naturally — the AI will adapt to you</li>
                  <li>• You can end the call at any time</li>
                </ul>
              </div>

              <button
                onClick={startCall}
                className="inline-flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 40px ${primaryColor}40`,
                }}
              >
                <Phone className="w-6 h-6" />
                Start Interview
              </button>
            </>
          )}

          {/* Call in progress */}
          {stage === 'call' && (
            <>
              <div 
                className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 ${
                  callStatus === 'connected' ? 'animate-pulse' : ''
                }`}
                style={{ 
                  backgroundColor: callStatus === 'connected' 
                    ? '#22c55e20' 
                    : `${primaryColor}20`,
                }}
              >
                {callStatus === 'connecting' ? (
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: primaryColor }} />
                ) : (
                  <Mic className="w-12 h-12 text-green-400" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {callStatus === 'connecting' ? 'Connecting...' : 'Interview in progress'}
              </h2>
              
              {callStatus === 'connected' && (
                <>
                  <p className="text-white/60 mb-8">Speak naturally — I'm listening</p>
                  
                  {/* Call Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={toggleMute}
                      className={`p-4 rounded-full transition ${
                        isMuted 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={endCall}
                      className="p-4 bg-red-600 hover:bg-red-500 text-white rounded-full transition"
                      title="End call"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-white/40 mt-8">
                    Tap the red button when you're finished
                  </p>
                </>
              )}
            </>
          )}

          {/* Complete */}
          {stage === 'complete' && (
            <>
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Interview complete!</h2>
              <p className="text-white/60">
                {agent?.closing_message || 'Thank you for your time. Your responses have been recorded.'}
              </p>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-4 text-center">
        <p className="text-xs text-white/40">
          Powered by AI Agent Interviews
        </p>
      </footer>
    </div>
  );
}
