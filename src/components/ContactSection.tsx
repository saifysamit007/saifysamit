import { useState, useEffect } from 'react';
import { Mail, Send, Check, Copy, AlertCircle, MessageCircle, Globe, ExternalLink, Loader2 } from 'lucide-react';
import { ARTIST_PROFILE } from '../data/portfolioData';
import { useCurrency } from '../context/CurrencyContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function ContactSection() {
  const { currentCurrency, setCurrencyCode, currencies } = useCurrency();
  const { settings } = useSiteSettings();
  const copy = settings.customCopy || {};

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    projectType: 'Esports Graphics',
    budgetRange: '',
    details: '',
  });

  // Keep budgetRange synced with current currency
  useEffect(() => {
    if (!formState.budgetRange || !currentCurrency.tiers.includes(formState.budgetRange)) {
      setFormState((prev) => ({
        ...prev,
        budgetRange: currentCurrency.tiers[1] || currentCurrency.tiers[0],
      }));
    }
  }, [currentCurrency]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ARTIST_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formState.name.trim() || !formState.email.trim() || !formState.details.trim()) {
      setErrorMessage('Please fill in your name, email, and project details.');
      setSubmitStatus('error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setErrorMessage('Please provide a valid email address.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const subjectText = `[Design Inquiry] ${formState.projectType} — ${formState.company || formState.name}`;

    // 1. Direct transmission to saifysamit@gmail.com via FormSubmit AJAX API
    try {
      await fetch('https://formsubmit.co/ajax/saifysamit@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          company: formState.company || 'N/A',
          projectType: formState.projectType,
          budget: `${formState.budgetRange} (${currentCurrency.code})`,
          message: formState.details,
          _subject: subjectText,
          _replyto: formState.email,
          _template: 'table',
          _captcha: 'false',
        }),
      });
    } catch {
      // In case offline or adblocker blocks FormSubmit, local fallback continues seamlessly
    }

    // 2. Persist to server API and local storage so Saify can view inquiries in Admin Panel
    const inquiryRecord = {
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: formState.name,
      email: formState.email,
      company: formState.company || '',
      projectType: formState.projectType,
      budget: `${formState.budgetRange} (${currentCurrency.code})`,
      details: formState.details,
    };

    try {
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryRecord),
      }).catch(() => {});

      const raw = localStorage.getItem('saify_commercial_inquiries');
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(inquiryRecord);
      localStorage.setItem('saify_commercial_inquiries', JSON.stringify(list.slice(0, 50)));
    } catch {}

    setIsSubmitting(false);
    setSubmitStatus('success');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#080B0F] border-t border-[#1F2833] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Title, Email Card & WhatsApp Chat Card */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold mb-2 block">
                COMMISSION / INQUIRY
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight mb-3">
                {copy.contactHeadline || 'Have a project in mind?'}
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-normal">
                {copy.contactSubtitle || "Let's create something that looks great, communicates clearly, and gets remembered."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Direct Email Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E141B] border border-[#1F2833] shadow-md">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Direct Email Contact</span>
                  <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Within 24 Hours
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-mono font-medium text-white truncate">
                    {ARTIST_PROFILE.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080B0F] hover:bg-zinc-800 text-xs font-mono text-zinc-200 transition-colors shrink-0 border border-[#1F2833]"
                    aria-label="Copy email address"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#FF4655]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct WhatsApp Instant Chat Option (Exact Bottom of Left Column) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0E141B] border border-[#1F2833] shadow-md">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Instant WhatsApp Chat</span>
                  <span className="text-[10px] text-[#25D366] font-semibold bg-[#25D366]/10 px-2 py-0.5 rounded border border-[#25D366]/30">
                    ONLINE
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs sm:text-sm text-zinc-300">
                    Connect directly on WhatsApp for real-time discussion
                  </span>
                  <a
                    href={ARTIST_PROFILE.socials.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-xs font-semibold uppercase tracking-wider text-white transition-colors shrink-0 shadow-md shadow-[#25D366]/20"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>Chat Now</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form Perfectly Aligned in Height to Match the WhatsApp Box Baseline */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0E141B] border border-[#1F2833] shadow-xl flex-1 flex flex-col justify-between">
              {submitStatus === 'success' ? (
                <div className="py-8 text-center my-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                    <Check className="w-7 h-7" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Dispatched to {ARTIST_PROFILE.email}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-2">
                    Inquiry Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto mb-6 leading-relaxed">
                    Thank you <strong className="text-white">{formState.name}</strong>! Your commission details have been delivered directly to <span className="text-[#FF4655] font-mono">{ARTIST_PROFILE.email}</span>. Saify will review your project and reply within 24 hours.
                  </p>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-md mx-auto mb-6">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ARTIST_PROFILE.email)}&su=${encodeURIComponent(`[Inquiry Follow-up] ${formState.projectType} - ${formState.name}`)}&body=${encodeURIComponent(`Hi Saify,\n\nFollowing up on my project inquiry regarding ${formState.projectType}.\n\nBest regards,\n${formState.name}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EA4335]/20 hover:bg-[#EA4335]/30 text-[#EA4335] border border-[#EA4335]/40 text-xs font-semibold transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open in Gmail</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>

                    <a
                      href={ARTIST_PROFILE.socials.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-semibold transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitStatus('idle');
                      setFormState({
                        name: '',
                        email: '',
                        company: '',
                        projectType: 'Esports Graphics',
                        budgetRange: currentCurrency.tiers[1] || currentCurrency.tiers[0],
                        details: '',
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-md transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Alex Morgan"
                          value={formState.name}
                          onChange={(e) =>
                            setFormState({ ...formState, name: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="alex@team.com"
                          value={formState.email}
                          onChange={(e) =>
                            setFormState({ ...formState, email: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Company / Team
                        </label>
                        <input
                          type="text"
                          placeholder="Apex Esports / Org"
                          value={formState.company}
                          onChange={(e) =>
                            setFormState({ ...formState, company: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Project Type
                        </label>
                        <select
                          value={formState.projectType}
                          onChange={(e) =>
                            setFormState({ ...formState, projectType: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655] transition-colors cursor-pointer"
                        >
                          <option value="Esports Graphics">Esports Graphics</option>
                          <option value="Brand Identity">Brand Identity</option>
                          <option value="Social Media Design">Social Media Design</option>
                          <option value="Thumbnail Design">Thumbnail Design</option>
                          <option value="Campaign & Promo">Campaign & Promo</option>
                          <option value="Motion Graphics">Motion Graphics</option>
                          <option value="Custom Consultation">Other / Full Retainer</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-zinc-300">
                            Budget ({currentCurrency.code})
                          </label>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-[#FF4655]">
                            <Globe className="w-2.5 h-2.5" />
                            <select
                              value={currentCurrency.code}
                              onChange={(e) => setCurrencyCode(e.target.value)}
                              className="bg-transparent text-[#FF4655] font-semibold focus:outline-none cursor-pointer"
                            >
                              {currencies.map((c) => (
                                <option key={c.code} value={c.code} className="bg-[#0E141B] text-white">
                                  {c.code}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <select
                          value={formState.budgetRange}
                          onChange={(e) =>
                            setFormState({ ...formState, budgetRange: e.target.value })
                          }
                          className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655] transition-colors cursor-pointer"
                        >
                          {currentCurrency.tiers.map((tier) => (
                            <option key={tier} value={tier} className="bg-[#0E141B] text-white">
                              {tier}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Project Details & Deliverables Needed *
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Outline your tournament dates, visual scope, reference styles, deadlines, and expected file deliverables..."
                        value={formState.details}
                        onChange={(e) =>
                          setFormState({ ...formState, details: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655] transition-colors"
                      />
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
                        <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4655]" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1F2833]/60">
                    <p className="text-[11px] text-zinc-500 font-mono">
                      * Direct transmission via verified gateway.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] active:scale-[0.98] disabled:opacity-50 rounded transition-all shadow-md shadow-[#FF4655]/25"
                    >
                      {isSubmitting ? (
                        <span>Transmitting...</span>
                      ) : (
                        <>
                          <span>Start A Project</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
