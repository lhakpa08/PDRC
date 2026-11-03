import React from 'react';
import { X, Printer, Download, Award } from 'lucide-react';

interface CertificateModalProps {
  participantName: string;
  courseTitle: string;
  agencyName: string;
  issueDate: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  participantName,
  courseTitle,
  agencyName,
  issueDate,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-900 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              PDRC Official Certificate Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Bhutan Certificate Frame */}
        <div className="bg-amber-50/40 text-slate-900 border-8 border-amber-600/40 p-8 rounded-xl shadow-inner relative font-sans space-y-6 text-center print:border-4 print:p-6">
          {/* Decorative Bhutanese Corner Accent */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

          {/* Institutional Crest Header */}
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-amber-800 font-mono font-bold">
              KINGDOM OF BHUTAN · TSIRANG DZONGKHAG
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display uppercase tracking-tight">
              Professional Development & Research Centre
            </h2>
            <div className="text-xs text-slate-600 font-mono font-medium">
              Centralized Competency & Leadership Framework
            </div>
          </div>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto" />

          {/* Certificate Main Text */}
          <div className="space-y-4 py-2">
            <div className="text-xs uppercase font-mono tracking-widest text-amber-900 font-bold">
              Certificate of Completion
            </div>

            <p className="text-xs text-slate-600 italic">This is to certify that</p>

            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-display tracking-tight border-b-2 border-amber-400 pb-2 inline-block px-8">
              {participantName}
            </div>

            <p className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed font-medium">
              representing <strong className="text-slate-900">{agencyName}</strong>, has successfully completed the professional development workshop on
            </p>

            <div className="text-base sm:text-lg font-bold text-slate-900 font-display px-4">
              "{courseTitle}"
            </div>

            <p className="text-xs text-slate-600 font-mono">
              Issued at PDRC Campus, Tsirang Dzongkhag on <strong className="text-amber-800">{issueDate}</strong>
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs border-t border-amber-200 max-w-lg mx-auto">
            <div>
              <div className="font-bold text-slate-900">Dasho Tsherin Wangchuk</div>
              <div className="text-[11px] text-slate-600 font-mono">Director General, PDRC</div>
            </div>
            <div>
              <div className="font-bold text-slate-900">Karma Dorji</div>
              <div className="text-[11px] text-slate-600 font-mono">Senior Lead Facilitator</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-2">
            Verification Token: PDRC-CERT-{Date.now().toString().slice(-6)} · Official Digital Record
          </div>
        </div>
      </div>
    </div>
  );
};
