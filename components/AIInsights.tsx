
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Facility, AuditData } from '../types';
import { Sparkles, Loader2, BrainCircuit, ShieldCheck, Zap, Leaf } from 'lucide-react';

interface AIInsightsProps {
  facility: Facility;
  auditData?: any;
}

const AIInsights: React.FC<AIInsightsProps> = ({ facility, auditData }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `
        As an expert in healthcare energy resilience and sustainability, analyze the following facility data and provide a concise, high-impact strategic briefing.
        
        Facility: ${facility.name}
        Type: ${facility.tier}
        Ownership: ${facility.ownership}
        Location: ${facility.state}, Nigeria
        
        Latest Audit Summary:
        ${auditData ? JSON.stringify(auditData) : 'No recent audit data available.'}
        
        Please provide:
        1. **Resilience Risk Profile**: Identify the biggest threat to clinical continuity based on energy access.
        2. **Efficiency Quick-Wins**: 2-3 immediate technical interventions to reduce GHG or costs.
        3. **Carbon Market Potential**: Briefly assess readiness for carbon credit participation.
        
        Format the response in clean Markdown with professional, actionable language suitable for health commissioners.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "No insight generated.");
    } catch (err) {
      console.error(err);
      setError("Failed to reach AI Intelligence center. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (facility) generateInsight();
  }, [facility, auditData]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-[#008489] p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Resilience Intelligence</h3>
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">AI-Powered Strategic Analysis</p>
          </div>
        </div>
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          Refresh
        </button>
      </div>
      
      <div className="p-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-[#008489]" />
                <BrainCircuit className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#008489]" />
            </div>
            <p className="text-sm font-medium animate-pulse">Gemini is analyzing facility parameters...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-slate-600">
            {insight ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                        <ShieldCheck className="w-5 h-5 text-[#008489] mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Resilience</p>
                        <p className="text-xs font-bold text-slate-700">Audit-Verified Logic</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Leaf className="w-5 h-5 text-emerald-600 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Eco-Sustainability</p>
                        <p className="text-xs font-bold text-slate-700">Targeted Decarbonization</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Zap className="w-5 h-5 text-amber-500 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Load Optimization</p>
                        <p className="text-xs font-bold text-slate-700">Efficiency Insights</p>
                    </div>
                </div>
                <div className="whitespace-pre-wrap font-medium leading-relaxed border-t border-slate-50 pt-6">
                  {insight}
                </div>
              </div>
            ) : (
              <p>No intelligence briefing available for this profile.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
