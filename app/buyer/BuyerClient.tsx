'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle, Rocket, CreditCard, Shield,
  BarChart3, Users, Mic, ArrowRight
} from 'lucide-react';

export default function BuyerClient() {
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

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Get Your Own Platform</h1>
          <p className="text-slate-400 text-lg">
            Your private AI interview platform, ready in minutes.
          </p>
        </div>

        {leadData && !loading && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-8">
            <p className="text-purple-300">
              Welcome back! Based on your trial, we will set up your platform for{' '}
              <strong>{leadData.company || 'your company'}</strong>.
            </p>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-bold">$150</span>
            <span className="text-slate-400 text-xl">/month</span>
          </div>

          <p className="text-center text-slate-400 mb-8">
            Everything you need to run AI interviews at scale
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3"><Mic className="w-5 h-5 text-green-500" /> Unlimited interview agents</div>
            <div className="flex items-center gap-3"><Users className="w-5 h-5 text-green-500" /> 100 interviews included</div>
            <div className="flex items-center gap-3"><BarChart3 className="w-5 h-5 text-green-500" /> Analytics dashboard</div>
            <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-green-500" /> Drift detection</div>
            <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-500" /> Role adherence scoring</div>
            <div className="flex items-center gap-3"><CreditCard className="w-5 h-5 text-green-500" /> $4 per extra interview</div>
          </div>

          <Link
            href={`/factory/provision${leadId ? `?leadId=${leadId}` : ''}`}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-semibold text-lg"
          >
            <Rocket className="w-5 h-5" />
            Create My Platform
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}