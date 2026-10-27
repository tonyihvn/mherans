/**
 * EvidenceAccordion Component - NHERAMS Prototype
 * Displays evidence pack: certificates, telemetry config, sampling notes
 */

import React, { useState } from 'react';
import { Evidence } from '../types';
import { ChevronDown, File, Wifi } from 'lucide-react';

interface EvidenceAccordionProps {
  evidence: Evidence;
}

const EvidenceAccordion: React.FC<EvidenceAccordionProps> = ({ evidence }) => {
  const [isOpen, setIsOpen] = useState(false);

  const CertificateTypeLabel = {
    electrical_safety: 'Electrical Safety',
    quality_scheme: 'Quality Scheme',
    commissioning: 'Commissioning'
  };

  const CertificateStatusColor = {
    supplied: { bg: '#E8F5E9', text: '#1B5E20', label: 'Supplied' },
    requested: { bg: '#FFF3E0', text: '#E65100', label: 'Requested' },
    not_available: { bg: '#FFEBEE', text: '#B71C1C', label: 'Not Available' }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-900 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <File className="w-5 h-5 text-[#057A55]" />
          Evidence Pack
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 px-6 py-4 space-y-6">
          {/* Certificates */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-widest">Certificates</h4>
            <div className="space-y-2">
              {evidence.certificates.length > 0 ? (
                evidence.certificates.map((cert, idx) => {
                  const statusStyle = CertificateStatusColor[cert.status];
                  return (
                    <div key={idx} className="p-3 border border-slate-200 rounded bg-slate-50">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {CertificateTypeLabel[cert.type] || cert.type}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">Ref: {cert.ref}</p>
                        </div>
                        <span
                          className="px-2 py-1 rounded text-xs font-bold whitespace-nowrap"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text
                          }}
                        >
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No certificates on file.</p>
              )}
            </div>
          </div>

          {/* Telemetry Configuration */}
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-widest flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Telemetry Configuration
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Source:</span>
                <span className="font-semibold text-slate-900 capitalize">
                  {evidence.telemetry.source.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Latency Target:</span>
                <span className="font-semibold text-slate-900">
                  {evidence.telemetry.latency_target_minutes} minutes
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Availability Target:</span>
                <span className="font-semibold text-slate-900">
                  {(evidence.telemetry.availability_target * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Sampling Note */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-widest">Sampling Cadence</h4>
            <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded italic">
              {evidence.sampling_note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceAccordion;
