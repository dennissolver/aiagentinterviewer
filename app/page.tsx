import Link from "next/link";
import { Phone, Bot, Zap, ArrowRight, Mic } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Agent Interviews</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-400 hover:text-white transition"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm mb-8">
          <Mic className="w-4 h-4" />
          Voice-first. No forms.
        </div>

        <h2 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl">
          Design your AI interviewer through conversation
        </h2>

        <p className="text-xl text-slate-400 mb-12 max-w-2xl">
          Just talk to us. Our Setup Agent understands your goals
          and creates a custom voice-powered AI interviewer — no configuration needed.
        </p>

        {/* Primary CTA */}
        <Link
          href="/create"
          className="group flex items-center gap-4 bg-green-600 hover:bg-green-500 text-white px-8 py-5 rounded-2xl font-semibold text-xl transition-all hover:scale-105 shadow-lg shadow-green-500/25"
        >
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <span>Start Call</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-sm text-slate-500 mt-4">
          3-5 minute voice conversation • No signup required
        </p>
      </main>

      {/* How it works */}
      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-20">
          <h3 className="text-2xl font-bold text-center mb-12">How it works</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-2">1. Have a call</h4>
              <p className="text-sm text-slate-400">
                Talk to our Setup Agent. Tell us what kind of interviews you want to conduct.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-2">2. We build your agent</h4>
              <p className="text-sm text-slate-400">
                Our AI creates a custom voice interviewer based on your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="font-semibold mb-2">3. Start interviewing</h4>
              <p className="text-sm text-slate-400">
                Share your link. Your AI conducts voice interviews at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-2xl font-bold text-center mb-4">Works for any interview type</h3>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          Our Setup Agent adapts to your needs.
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
          {[
            'Customer Discovery',
            'Lead Qualification',
            'Founder Screening',
            'User Research',
            'Exit Interviews',
            'HR Screening',
            'Market Research',
          ].map((useCase) => (
            <span
              key={useCase}
              className="px-4 py-2 bg-slate-800 rounded-full text-sm text-slate-300"
            >
              {useCase}
            </span>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-20 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to create your AI interviewer?</h3>
          <p className="text-slate-400 mb-8">
            Start a call. We'll handle the rest.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            <Phone className="w-5 h-5" />
            Start Call
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          <p>Voice-first AI interviewer design • Powered by ElevenLabs</p>
        </div>
      </footer>
    </div>
  );
}