"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DemoClient() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  const agentId = process.env.NEXT_PUBLIC_DEMO_AGENT_ID;
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    if (showWidget && agentId) {
      const script = document.createElement("script");
      script.src = "https://elevenlabs.io/convai-widget/index.js";
      script.async = true;
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [showWidget, agentId]);

  if (!leadId || !agentId) {
    return (
      <div className="text-center space-y-2">
        <p className="text-red-400">Missing configuration</p>
        <p className="text-xs text-neutral-500">leadId: {leadId || "MISSING"}</p>
        <p className="text-xs text-neutral-500">agentId: {agentId || "MISSING"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full text-center space-y-8">
      <div className="flex justify-center">
        <Image
          src="/avatar.jpeg"
          alt="AI Interviewer"
          width={120}
          height={120}
          className="rounded-full border-2 border-neutral-700"
        />
      </div>

      <h1 className="text-3xl font-semibold">Live Voice Demo</h1>

      <p className="text-neutral-400">
        You're about to speak with a Connexions AI interviewer.
      </p>

      {!showWidget ? (
        <button
          onClick={() => setShowWidget(true)}
          className="w-full rounded-lg bg-white text-neutral-900 py-4 font-medium hover:bg-neutral-200 transition"
        >
          Start voice interview
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-400 text-sm">Click the microphone icon below</p>
          {/* @ts-ignore */}
          <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
        </div>
      )}

      <p className="text-xs text-neutral-500">Conversations are not retained.</p>
    </div>
  );
}