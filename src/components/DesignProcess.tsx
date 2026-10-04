import { Compass, Eye, PenTool, CheckCircle, PackageCheck } from 'lucide-react';
import { DESIGN_PROCESS } from '../data/portfolioData';

export default function DesignProcess() {
  const stepIcons = [
    <Compass className="w-5 h-5 text-[#FF4655]" />,
    <Eye className="w-5 h-5 text-[#FF4655]" />,
    <PenTool className="w-5 h-5 text-[#FF4655]" />,
    <CheckCircle className="w-5 h-5 text-[#FF4655]" />,
    <PackageCheck className="w-5 h-5 text-[#FF4655]" />,
  ];

  return (
    <section id="process" className="py-16 sm:py-24 bg-[#0A0E14] border-t border-[#1F2833]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 sm:mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold mb-3 block">
            METHODOLOGY & REPEATABILITY
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight mb-4">
            Structured Design Process
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Reliable visual outcomes are not accidental. Every client engagement follows a disciplined five-stage pipeline engineered to eliminate friction and maximize commercial impact.
          </p>
        </div>

        {/* Process Steps Grid: 1 col on mobile, 2 col on small tablet, 3 on tablet, 5 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {DESIGN_PROCESS.map((stage, idx) => (
            <div
              key={stage.step}
              className="p-6 rounded-2xl bg-[#0E141B] border border-[#1F2833] hover:border-[#FF4655]/60 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-[#FF4655] bg-[#FF4655]/10 px-2 py-1 rounded border border-[#FF4655]/30">
                    {stage.step}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#080B0F] flex items-center justify-center border border-[#1F2833]">
                    {stepIcons[idx]}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-display mb-1 group-hover:text-[#FF4655] transition-colors">
                  {stage.title}
                </h3>
                <div className="text-xs font-medium text-zinc-400 mb-3">
                  {stage.subtitle}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  {stage.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#1F2833]">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  Deliverable Stage:
                </span>
                <div className="text-xs font-semibold text-zinc-200">
                  {stage.deliverable}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
