// app/page.tsx
import { clientConfig } from '@/config/client';
import { Bot, Phone, Clock, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{clientConfig.platform.name}</h1>
            <p className="text-sm text-slate-400">{clientConfig.company.name}</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-4xl font-bold mb-4">{clientConfig.platform.tagline}</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {clientConfig.platform.description}
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-900 rounded-2xl p-6 text-center">
            <Phone className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Voice-First</h3>
            <p className="text-slate-400 text-sm">
              Natural conversation powered by advanced AI voice technology
            </p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Quick Setup</h3>
            <p className="text-slate-400 text-sm">
              Deploy your AI interviewer in minutes, not weeks
            </p>
          </div>
          <div className="bg-slate-900 rounded-2xl p-6 text-center">
            <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Consistent Quality</h3>
            <p className="text-slate-400 text-sm">
              Every interview follows your script with professional delivery
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">Questions? Get in touch</p>
          <a
            href={`mailto:${clientConfig.company.supportEmail}`}
            className="text-purple-400 hover:text-purple-300 transition"
          >
            {clientConfig.company.supportEmail}
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-6 mt-16">
        <div className="max-w-4xl mx-auto text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {clientConfig.company.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
