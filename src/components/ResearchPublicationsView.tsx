import React from 'react';
import { ResearchPublication } from '../types';
import { INITIAL_PUBLICATIONS } from '../data/mockData';
import { 
  FileText, 
  Download, 
  BookOpen, 
  Calendar, 
  Search, 
  ShieldCheck, 
  ExternalLink
} from 'lucide-react';

export const ResearchPublicationsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPublications = INITIAL_PUBLICATIONS.filter((pub) => {
    return (
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            PDC Research & Policy Publications Hub
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Official performance audit reports, public financial management guidelines, and environmental auditing frameworks by Royal Audit Authority (RAA) & PDRC Tsirang.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>RAA Audit Knowledge Repository</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search performance audit reports, environmental guidelines, or GNH frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPublications.map((pub) => (
          <div
            key={pub.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-blue-400 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  {pub.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">{pub.date}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-base font-display leading-snug">
                {pub.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {pub.summary}
              </p>

              <div className="text-[11px] text-slate-500 font-mono font-semibold pt-1 border-t border-slate-100">
                Author: {pub.author}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <a
                href={pub.downloadUrl}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Downloading official PDF: ${pub.title}`);
                }}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Report (PDF)</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
