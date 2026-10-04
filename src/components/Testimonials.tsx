import { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  Instagram,
  Globe,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Check,
  Twitter,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { TESTIMONIALS_DATA, TestimonialItem } from '../data/portfolioData';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AVATAR_PRESETS = [
  { label: 'Esports Director', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { label: 'Growth Strategist', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80' },
  { label: 'Content Creator', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { label: 'Team Captain', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80' },
  { label: 'Media Producer', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80' },
  { label: 'Creative Lead', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80' },
];

export default function Testimonials() {
  const { isAdmin } = useAdmin();

  // Load custom testimonials or defaults
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(() => {
    try {
      const saved = localStorage.getItem('saify_testimonials_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return TESTIMONIALS_DATA;
  });

  // Sync with zero-token server database
  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        if (data?.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          setTestimonialsList(data.testimonials);
          try {
            localStorage.setItem('saify_testimonials_custom', JSON.stringify(data.testimonials));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // In-app Confirmation Modal State (replaces window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'testimonial' | 'reset';
    testimonialId?: string;
    testimonialName?: string;
  } | null>(null);

  // Form Fields
  const [formClientName, setFormClientName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formCompanyOrTeam, setFormCompanyOrTeam] = useState('');
  const [formProjectScope, setFormProjectScope] = useState('');
  const [formPlatform, setFormPlatform] = useState<string>('whatsapp');
  const [formPlatformUsername, setFormPlatformUsername] = useState('');
  const [formRating, setFormRating] = useState<number>(5);
  const [formAvatar, setFormAvatar] = useState('');
  const [formQuote, setFormQuote] = useState('');

  const openAddModal = () => {
    setEditingTestimonialId(null);
    setFormError(null);
    setFormClientName('');
    setFormRole('Founder / Creator');
    setFormCompanyOrTeam('');
    setFormProjectScope('Esports Graphics & Visual Identity');
    setFormPlatform('whatsapp');
    setFormPlatformUsername('+1 (555) ***');
    setFormRating(5);
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80');
    setFormQuote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: TestimonialItem) => {
    setEditingTestimonialId(item.id);
    setFormError(null);
    setFormClientName(item.clientName);
    setFormRole(item.role);
    setFormCompanyOrTeam(item.companyOrTeam);
    setFormProjectScope(item.projectScope || '');
    setFormPlatform(item.platform || 'whatsapp');
    setFormPlatformUsername(item.platformUsername || '');
    setFormRating(typeof item.rating === 'number' ? item.rating : 5);
    setFormAvatar(item.avatar);
    setFormQuote(item.quote);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim() || !formQuote.trim()) {
      setFormError('Please fill in Client Name and Testimonial Quote.');
      return;
    }
    setFormError(null);

    const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80';

    let updated: TestimonialItem[];
    if (editingTestimonialId) {
      updated = testimonialsList.map((t) => {
        if (t.id === editingTestimonialId) {
          return {
            ...t,
            clientName: formClientName.trim(),
            role: formRole.trim() || 'Client',
            companyOrTeam: formCompanyOrTeam.trim() || 'Partner',
            projectScope: formProjectScope.trim() || 'Commercial Graphics',
            platform: formPlatform as any,
            platformUsername: formPlatformUsername.trim() || undefined,
            rating: formRating,
            avatar: formAvatar.trim() || fallbackAvatar,
            quote: formQuote.trim(),
          };
        }
        return t;
      });
    } else {
      const newItem: TestimonialItem = {
        id: `testimonial-${Date.now()}`,
        clientName: formClientName.trim(),
        role: formRole.trim() || 'Client Partner',
        companyOrTeam: formCompanyOrTeam.trim() || 'Organization',
        projectScope: formProjectScope.trim() || 'Commercial Design Suite',
        platform: formPlatform as any,
        platformUsername: formPlatformUsername.trim() || undefined,
        rating: formRating,
        avatar: formAvatar.trim() || fallbackAvatar,
        quote: formQuote.trim(),
      };
      updated = [newItem, ...testimonialsList];
    }

    setTestimonialsList(updated);
    try {
      localStorage.setItem('saify_testimonials_custom', JSON.stringify(updated));
    } catch {}

    fetch('/api/testimonials', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ testimonials: updated }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
    }, 600);
  };

  const handleDeleteTestimonial = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'testimonial',
      testimonialId: id,
      testimonialName: name,
    });
  };

  const handleResetDefaults = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'reset',
      testimonialName: 'All Verified Testimonials',
    });
  };

  const handleExecuteDeleteConfirm = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'testimonial' && deleteConfirm.testimonialId) {
      const targetId = deleteConfirm.testimonialId;
      const updated = testimonialsList.filter((t) => t.id !== targetId);
      setTestimonialsList(updated);
      try {
        localStorage.setItem('saify_testimonials_custom', JSON.stringify(updated));
      } catch {}

      fetch('/api/testimonials', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ testimonials: updated }),
      }).catch(() => {});

      if (isModalOpen && editingTestimonialId === targetId) {
        setIsModalOpen(false);
      }
    } else if (deleteConfirm.type === 'reset') {
      setTestimonialsList(TESTIMONIALS_DATA);
      try {
        localStorage.removeItem('saify_testimonials_custom');
      } catch {}
      fetch('/api/testimonials/reset', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    }

    setDeleteConfirm(null);
  };

  const getPlatformBadge = (platform: string, username?: string) => {
    const p = (platform || '').toLowerCase();
    switch (p) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#25D366]/15 border border-[#25D366]/40 text-[#25D366] text-[11px] font-mono font-semibold">
            <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
            <span>via WhatsApp</span>
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-500/15 border border-pink-500/40 text-pink-300 text-[11px] font-mono font-semibold">
            <Instagram className="w-3.5 h-3.5 text-pink-400" />
            <span>via Instagram</span>
          </span>
        );
      case 'discord':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#5865F2]/15 border border-[#5865F2]/40 text-[#7289da] text-[11px] font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#5865F2]" />
            <span>via Discord</span>
          </span>
        );
      case 'twitter':
      case 'x':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[11px] font-mono font-semibold">
            <Twitter className="w-3.5 h-3.5 text-sky-400" />
            <span>via X / Twitter</span>
          </span>
        );
      case 'website':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF4655]/15 border border-[#FF4655]/40 text-[#FF4655] text-[11px] font-mono font-semibold">
            <Globe className="w-3.5 h-3.5" />
            <span>{p === 'website' ? 'via Website Inquiry' : `via ${platform || 'Client'}`}</span>
          </span>
        );
    }
  };

  const renderCard = (t: TestimonialItem, keySuffix: string) => {
    const starCount = typeof t.rating === 'number' && t.rating > 0 ? Math.min(5, Math.max(1, t.rating)) : 5;

    return (
      <div
        key={`${t.id}-${keySuffix}`}
        className="relative w-[290px] sm:w-[370px] md:w-[410px] p-5 sm:p-7 rounded-2xl bg-[#0E141B] border-2 border-[#1F2833] hover:border-[#FF4655] hover:shadow-2xl hover:shadow-[#FF4655]/15 transition-all duration-300 flex flex-col justify-between shrink-0 shadow-xl group cursor-default select-none my-2"
      >
        <div>
          {/* Platform Badge & Rating + Admin Edit/Delete Controls */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            {getPlatformBadge(t.platform, t.platformUsername)}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-[#FF4655]">
                {[...Array(starCount)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FF4655]" />
                ))}
              </div>

              {/* Admin direct edit & delete buttons */}
              {isAdmin && (
                <div className="flex items-center gap-1 pl-1.5 border-l border-[#1F2833]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(t);
                    }}
                    className="p-1 rounded bg-[#080B0F] hover:bg-[#FF4655] text-zinc-400 hover:text-white border border-[#1F2833] hover:border-[#FF4655] transition-colors"
                    title="Edit this client testimonial"
                    aria-label={`Edit testimonial from ${t.clientName}`}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTestimonial(t.id, t.clientName);
                    }}
                    className="p-1 rounded bg-[#080B0F] hover:bg-red-600 text-zinc-400 hover:text-white border border-[#1F2833] hover:border-red-500 transition-colors"
                    title="Delete this testimonial"
                    aria-label={`Delete testimonial from ${t.clientName}`}
                  >
                    <Trash2 className="w-3 h-3 text-red-400 hover:text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Testimonial Quote */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed italic mb-6">
            "{t.quote}"
          </p>
        </div>

        {/* Client Profile with Picture / Avatar */}
        <div className="pt-4 border-t border-[#1F2833] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={t.avatar}
              alt={t.clientName}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#1F2833] group-hover:border-[#FF4655] transition-colors shrink-0 bg-zinc-900"
            />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-1.5">
                <span>{t.clientName}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF4655]" />
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                {t.role} · <span className="text-zinc-300">{t.companyOrTeam}</span>
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 uppercase hidden sm:inline bg-[#080B0F] px-2 py-0.5 rounded border border-[#1F2833]">
            Verified
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 bg-[#080B0F] border-t border-[#1F2833] relative overflow-hidden">
      {/* Scoped CSS animation with generous vertical padding */}
      <style>{`
        @keyframes testimonialsInfiniteMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }
        .testimonials-track-container {
          display: flex;
          width: 100%;
          overflow: hidden;
          padding-top: 12px;
          padding-bottom: 24px;
        }
        .testimonials-track-segment {
          display: flex;
          flex-shrink: 0;
          align-items: stretch;
          gap: 1.5rem;
          padding-right: 1.5rem;
          padding-top: 6px;
          padding-bottom: 12px;
          animation: testimonialsInfiniteMarquee 28s linear infinite !important;
          will-change: transform;
        }
        .testimonials-track-container:hover .testimonials-track-segment {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold mb-3 block">
          CLIENT ENDORSEMENTS & VERIFIED IMPACT
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight mb-3">
          Client Testimonials
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed mb-5">
          Direct feedback and verified reviews received across commercial commissions, WhatsApp, Instagram, and web inquiries.
        </p>

        {/* Admin Action Buttons (Add Testimonial, Reset Defaults) */}
        {isAdmin && (
          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-colors shadow-md shadow-[#FF4655]/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Testimonial</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-[#0E141B] hover:bg-zinc-800 border border-[#1F2833] rounded-lg transition-colors"
              title="Reset testimonials back to initial collection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        )}
      </div>

      {/* Auto-Scrolling Marquee with Left & Right Vanishing Shadow Masks */}
      {testimonialsList.length === 0 ? (
        <div className="max-w-md mx-auto text-center p-8 bg-[#0E141B] border border-[#1F2833] rounded-2xl">
          <p className="text-zinc-400 text-sm font-mono mb-4">No testimonials available.</p>
          {isAdmin && (
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 text-xs font-mono text-white bg-[#FF4655] rounded-lg"
            >
              Restore Default Testimonials
            </button>
          )}
        </div>
      ) : (
        <div className="relative w-full overflow-hidden py-2">
          {/* Left Vanishing Edge Shadow */}
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 bottom-0 w-16 sm:w-48 z-20 pointer-events-none bg-gradient-to-r from-[#080B0F] via-[#080B0F]/90 to-transparent"
          />

          {/* Right Vanishing Edge Shadow */}
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 bottom-0 w-16 sm:w-48 z-20 pointer-events-none bg-gradient-to-l from-[#080B0F] via-[#080B0F]/90 to-transparent"
          />

          {/* Dual-Track 100% Automated Seamless Right-to-Left Scroller */}
          <div className="testimonials-track-container">
            {/* Segment 1 */}
            <div className="testimonials-track-segment">
              {testimonialsList.map((t) => renderCard(t, 'seg1'))}
            </div>

            {/* Segment 2 (Mirror copy for 100% gapless continuous looping) */}
            <div className="testimonials-track-segment" aria-hidden="true">
              {testimonialsList.map((t) => renderCard(t, 'seg2'))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500 font-mono">
          * Automatically flowing from right to left · Hover over any card to pause.
        </p>
      </div>

      {/* Testimonial Add / Edit Modal (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0E141B] border border-[#1F2833] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1F2833] bg-[#080B0F]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-xs" />
                <h3 className="text-base font-bold text-white font-display">
                  {editingTestimonialId ? 'Edit Client Testimonial' : 'Add New Client Testimonial'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTestimonial} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {formError && (
                <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-200 font-mono flex items-center justify-between">
                  <span>{formError}</span>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="text-red-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Client Name & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Julian Vance"
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Client Role / Title
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Tournament Director"
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
              </div>

              {/* Company / Team & Project Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Company / Team / Organization
                  </label>
                  <input
                    type="text"
                    value={formCompanyOrTeam}
                    onChange={(e) => setFormCompanyOrTeam(e.target.value)}
                    placeholder="e.g. Apex Syndicate Esports"
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Project Scope
                  </label>
                  <input
                    type="text"
                    value={formProjectScope}
                    onChange={(e) => setFormProjectScope(e.target.value)}
                    placeholder="e.g. VCT Key Visuals & Roster Reveal"
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
              </div>

              {/* Platform, Username & Star Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Source / Platform
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655] cursor-pointer"
                  >
                    <option value="whatsapp">💬 via WhatsApp</option>
                    <option value="instagram">📸 via Instagram</option>
                    <option value="discord">🎮 via Discord</option>
                    <option value="twitter">🐦 via X / Twitter</option>
                    <option value="website">🌐 via Website Inquiry</option>
                    <option value="other">✨ Other / Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Handle / Details (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPlatformUsername}
                    onChange={(e) => setFormPlatformUsername(e.target.value)}
                    placeholder="+1 (415) ... or @username"
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Star Rating (1 to 5)
                  </label>
                  <div className="flex items-center gap-1.5 py-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= formRating
                              ? 'text-[#FF4655] fill-[#FF4655]'
                              : 'text-zinc-600 fill-zinc-800'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono text-zinc-400 ml-1">
                      {formRating} Star{formRating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Picture (Avatar URL) with Presets & Preview */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Profile Picture URL (Avatar)
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={
                      formAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
                    }
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#FF4655] shrink-0 bg-black"
                  />
                  <input
                    type="url"
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                {/* Quick Avatar Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-zinc-500 mr-1">Quick Presets:</span>
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormAvatar(preset.url)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        formAvatar === preset.url
                          ? 'bg-[#FF4655]/20 text-[#FF4655] border-[#FF4655]'
                          : 'bg-[#080B0F] text-zinc-400 border-[#1F2833] hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Testimonial Quote */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Testimonial Quote / Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="Describe the feedback, turnaround time, quality of work, and impact..."
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#1F2833] flex items-center justify-between gap-3">
                {editingTestimonialId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteTestimonial(editingTestimonialId, formClientName)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400 hover:text-white bg-red-950/30 hover:bg-red-900 border border-red-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-[#080B0F] border border-[#1F2833] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg shadow-md transition-colors"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingTestimonialId ? 'Update Testimonial' : 'Publish Testimonial'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-app Confirmation Modal (Replaces window.confirm) */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm?.isOpen}
        title={
          deleteConfirm?.type === 'reset'
            ? 'Reset Testimonials to Defaults'
            : 'Remove Client Testimonial'
        }
        itemName={deleteConfirm?.testimonialName}
        message={
          deleteConfirm?.type === 'reset'
            ? 'Are you sure you want to reset all client testimonials back to the verified original collection? Any custom reviews will be reverted.'
            : `Are you sure you want to permanently remove the testimonial from "${deleteConfirm?.testimonialName || 'this client'}"? This action cannot be undone.`
        }
        confirmText={
          deleteConfirm?.type === 'reset'
            ? 'Yes, Reset Testimonials'
            : 'Yes, Remove Testimonial'
        }
        isDestructive={true}
        onConfirm={handleExecuteDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </section>
  );
}
