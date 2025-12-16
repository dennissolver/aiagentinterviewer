// app/buyer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle, Rocket, CreditCard, Shield, 
  BarChart3, Users, Mic, ArrowRight 
} from 'lucide-react';

export default function BuyerPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');
  
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetch(`/api/demo/status/${leadId}`)
        .then(res => res.json())
        .then(data => {
          setLeadData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [leadId]);

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Get Your Own Platform</h1>
          <p className="text-slate-400 text-lg">
            Your private AI interview platform, ready in minutes.
          </p>
        </div>

        {/* Personalized Welcome */}
        {leadData && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-8">
            <p className="text-purple-300">
              Welcome back! Based on your trial, we'll set up your platform for{' '}
              <strong>{leadData.company || 'your company'}</strong> with your custom interview agent ready to go.
            </p>
          </div>
        )}

        {/* Pricing Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-bold">$150</span>
            <span className="text-slate-400 text-xl">/month</span>
          </div>
          <p className="text-center text-slate-400 mb-8">Everything you need to run AI interviews at scale</p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Mic, text: 'Unlimited interview agents' },
              { icon: Users, text: '100 interviews included' },
              { icon: BarChart3, text: 'Full analytics dashboard' },
              { icon: Shield, text: 'Drift detection & alerts' },
              { icon: CheckCircle, text: 'Role adherence scoring' },
              { icon: CreditCard, text: '$4 per additional interview' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <item.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                {item.text}
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="font-semibold mb-4">Your platform includes:</h3>
            <ul className="space-y-2 text-sm text-slate-400 mb-6">
              <li>✓ Dedicated Supabase database (your data, your control)</li>
              <li>✓ Custom ElevenLabs voice agents</li>
              <li>✓ Private GitHub repository (full source code)</li>
              <li>✓ Vercel deployment with your domain</li>
              <li>✓ Automatic evaluation after every interview</li>
              <li>✓ CSV exports and API access</li>
            </ul>
          </div>

          {/* CTA Button */}
          <Link
            href={`/factory/provision${leadId ? `?leadId=${leadId}` : ''}`}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02]"
          >
            <Rocket className="w-5 h-5" />
            Create My Platform
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-center text-xs text-slate-500 mt-4">
            Platform provisioned in ~3 minutes · Cancel anytime
          </p>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Common Questions</h3>
          
          {[
            {
              q: 'How long does setup take?',
              a: 'About 3 minutes. We automatically provision your database, voice agents, and deployment.',
            },
            {
              q: 'Do I own my data?',
              a: 'Yes. You get your own Supabase database. Your data never touches our systems.',
            },
            {
              q: 'Can I customize the agents?',
              a: 'Absolutely. You can create unlimited agents with different voices, prompts, and personalities.',
            },
            {
              q: 'What if I need more than 100 interviews?',
              a: 'Additional interviews are $4 each. No limits, pay as you go.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h4 className="font-medium mb-1">{faq.q}</h4>
              <p className="text-sm text-slate-400">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Questions? Contact Dennis at{' '}
            <a href="mailto:dennis@corporateaisolutions.com" className="text-purple-400 hover:underline">
              dennis@corporateaisolutions.com
            </a>
            {' '}or{' '}
            <a href="https://wa.me/61402612471" className="text-green-400 hover:underline">
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}