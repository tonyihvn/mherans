

/**
 * IndicatorCard Component - NHERAMS Prototype
 * Displays banded indicator with title, band label, icon, and tooltip
 */

import React, { useState } from 'react';
import { IndicatorBand } from '../types';
import { HelpCircle } from 'lucide-react';

interface IndicatorCardProps {
  title: string;
  band: IndicatorBand;
  icon: React.ReactNode;
  definition: string;
  color?: 'green' | 'purple' | 'blue' | 'orange' | 'red' | 'teal';
}

const colorMap = {
  green: { bg: '#E8F5E9', text: '#1B5E20', border: '#81C784' },
  purple: { bg: '#F3E5F5', text: '#4A148C', border: '#CE93D8' },
  blue: { bg: '#E3F2FD', text: '#01579B', border: '#64B5F6' },
  orange: { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
  red: { bg: '#FFEBEE', text: '#B71C1C', border: '#EF5350' },
  teal: { bg: '#E0F2F1', text: '#004D40', border: '#4DB6AC' }
};

const IndicatorCard: React.FC<IndicatorCardProps> = ({
  title,
  band,
  icon,
  definition,
  color = 'green'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = colorMap[color];

  return (
    <div
      className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: colors.bg }}
          >
            <span style={{ color: colors.text }}>{icon}</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.text }}>
              {title}
            </p>
          </div>
        </div>
        <button
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label={`Definition for ${title}`}
        >
          <HelpCircle className="w-4 h-4" style={{ color: colors.text }} />
          {showTooltip && (
            <div className="absolute top-6 right-0 w-48 bg-slate-900 text-white text-xs rounded p-2 z-10 shadow-lg">
              {definition}
            </div>
          )}
        </button>
      </div>

      <div
        className="inline-block px-4 py-2 rounded-full font-bold text-sm"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {band.label}
      </div>

      <p className="text-xs text-slate-500 mt-3">
        Range: {band.min}–{band.max} {band.unit}
      </p>
    </div>
  );
};

export default IndicatorCard;
