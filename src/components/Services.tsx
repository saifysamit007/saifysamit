import { useState, useEffect } from 'react';
import { ArrowUpRight, Plus, Pencil, Trash2, RotateCcw, X, Check, Wrench } from 'lucide-react';
import { SERVICES_DATA, ServiceItem } from '../data/portfolioData';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface ServicesProps {
  onSelectService?: (service: ServiceItem) => void;
}

// Crisp, authentic software logo icons for Adobe CC & creative tools
export function SoftwareLogo({ name }: { name: string }) {
  const normalized = name.toLowerCase();

  if (normalized.includes('photoshop')) {
    return (
      <div
        title="Adobe Photoshop"
        className="w-6 h-6 rounded-md bg-[#001e36] border border-[#31a8ff] flex items-center justify-center font-bold text-[10px] text-[#31a8ff] shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        Ps
      </div>
    );
  }

  if (normalized.includes('illustrator')) {
    return (
      <div
        title="Adobe Illustrator"
        className="w-6 h-6 rounded-md bg-[#330000] border border-[#ff9a00] flex items-center justify-center font-bold text-[10px] text-[#ff9a00] shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        Ai
      </div>
    );
  }

  if (normalized.includes('after effects')) {
    return (
      <div
        title="Adobe After Effects"
        className="w-6 h-6 rounded-md bg-[#00005b] border border-[#9999ff] flex items-center justify-center font-bold text-[10px] text-[#9999ff] shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        Ae
      </div>
    );
  }

  if (normalized.includes('premiere')) {
    return (
      <div
        title="Adobe Premiere Pro"
        className="w-6 h-6 rounded-md bg-[#260033] border border-[#ea77ff] flex items-center justify-center font-bold text-[10px] text-[#ea77ff] shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        Pr
      </div>
    );
  }

  if (normalized.includes('figma')) {
    return (
      <div
        title="Figma"
        className="w-6 h-6 rounded-md bg-[#1e1e1e] border border-[#0acf83] flex items-center justify-center p-1 shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        <svg viewBox="0 0 38 57" className="w-3.5 h-3.5" fill="none">
          <path d="M19 28.5A9.5 9.5 0 1 1 28.5 19 9.5 9.5 0 0 1 19 28.5z" fill="#1ABCFE" />
          <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5A9.5 9.5 0 0 1 0 47.5z" fill="#0ACF83" />
          <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
          <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
          <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
        </svg>
      </div>
    );
  }

  if (normalized.includes('blender')) {
    return (
      <div
        title="Blender 3D"
        className="w-6 h-6 rounded-md bg-[#181818] border border-[#e87d0d] flex items-center justify-center p-1 shadow-sm select-none cursor-help hover:scale-110 transition-transform"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#e87d0d]" />
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-md bg-[#1F2833] text-zinc-300 flex items-center justify-center text-[9px] font-mono">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

const COMMON_SOFTWARE = [
  'Adobe Photoshop',
  'Adobe Illustrator',
  'Adobe After Effects',
  'Adobe Premiere Pro',
  'Figma',
  'Blender',
];

export default function Services({ onSelectService }: ServicesProps) {
  const { isAdmin } = useAdmin();

  // Load custom services or defaults
  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('saify_services_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SERVICES_DATA;
  });

  // Sync with zero-token server database
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data?.services && Array.isArray(data.services) && data.services.length > 0) {
          setServicesList(data.services);
          try {
            localStorage.setItem('saify_services_custom', JSON.stringify(data.services));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const [activeServiceId, setActiveServiceId] = useState<string>(SERVICES_DATA[0].id);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // In-app Confirmation Modal State (replaces window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'service' | 'reset';
    serviceId?: string;
    serviceTitle?: string;
  } | null>(null);

  // Form Fields
  const [formIndex, setFormIndex] = useState('01');
  const [formTitle, setFormTitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTools, setFormTools] = useState<string[]>(['Adobe Photoshop', 'Adobe Illustrator']);
  const [customToolInput, setCustomToolInput] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('');

  const openAddModal = () => {
    const nextNum = (servicesList.length + 1).toString().padStart(2, '0');
    setEditingServiceId(null);
    setFormError(null);
    setFormIndex(nextNum);
    setFormTitle('');
    setFormTagline('');
    setFormDescription('');
    setFormTools(['Adobe Photoshop', 'Adobe Illustrator']);
    setCustomToolInput('');
    setFormDeliverables('Key Art Assets, Production Templates, PSD/Ai Source');
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setFormError(null);
    setFormIndex(service.index || '01');
    setFormTitle(service.title);
    setFormTagline(service.tagline);
    setFormDescription(service.description);
    setFormTools([...service.toolsUsed]);
    setCustomToolInput('');
    setFormDeliverables(service.deliverables.join(', '));
    setIsModalOpen(true);
  };

  const toggleTool = (toolName: string) => {
    if (formTools.includes(toolName)) {
      setFormTools(formTools.filter((t) => t !== toolName));
    } else {
      setFormTools([...formTools, toolName]);
    }
  };

  const addCustomTool = () => {
    if (!customToolInput.trim()) return;
    if (!formTools.includes(customToolInput.trim())) {
      setFormTools([...formTools, customToolInput.trim()]);
    }
    setCustomToolInput('');
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      setFormError('Please fill in Service Title and Description.');
      return;
    }
    setFormError(null);

    const deliverablesArr = formDeliverables
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updated: ServiceItem[];
    if (editingServiceId) {
      updated = servicesList.map((s) => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            index: formIndex.trim() || s.index,
            title: formTitle.trim(),
            tagline: formTagline.trim(),
            description: formDescription.trim(),
            toolsUsed: formTools.length > 0 ? formTools : ['Adobe Photoshop'],
            deliverables: deliverablesArr.length > 0 ? deliverablesArr : s.deliverables,
          };
        }
        return s;
      });
    } else {
      const newService: ServiceItem = {
        id: `service-${Date.now()}`,
        index: formIndex.trim() || (servicesList.length + 1).toString().padStart(2, '0'),
        title: formTitle.trim(),
        tagline: formTagline.trim() || 'Commercial Visual Deliverable',
        description: formDescription.trim(),
        toolsUsed: formTools.length > 0 ? formTools : ['Adobe Photoshop'],
        deliverables: deliverablesArr.length > 0 ? deliverablesArr : ['Custom Deliverables'],
      };
      updated = [...servicesList, newService];
    }

    setServicesList(updated);
    try {
      localStorage.setItem('saify_services_custom', JSON.stringify(updated));
    } catch {}

    fetch('/api/services', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ services: updated }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
    }, 600);
  };

  const handleDeleteService = (serviceId: string, serviceTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'service',
      serviceId,
      serviceTitle,
    });
  };

  const handleResetDefaults = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'reset',
      serviceTitle: 'Core Design Services',
    });
  };

  const handleExecuteDeleteConfirm = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'service' && deleteConfirm.serviceId) {
      const targetId = deleteConfirm.serviceId;
      const updated = servicesList.filter((s) => s.id !== targetId);
      setServicesList(updated);
      try {
        localStorage.setItem('saify_services_custom', JSON.stringify(updated));
      } catch {}

      fetch('/api/services', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ services: updated }),
      }).catch(() => {});

      if (isModalOpen && editingServiceId === targetId) {
        setIsModalOpen(false);
      }
    } else if (deleteConfirm.type === 'reset') {
      setServicesList(SERVICES_DATA);
      try {
        localStorage.removeItem('saify_services_custom');
      } catch {}
      fetch('/api/services/reset', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    }

    setDeleteConfirm(null);
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#080B0F] border-t border-[#1F2833]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold mb-3 block">
              CAPABILITIES & SPECIALIZATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight mb-4">
              Core Design Services
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Every deliverable is crafted with commercial intent, surgical composition, and production-grade export standards.
            </p>
          </div>

          {/* Admin action buttons */}
          {isAdmin ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-colors shadow-md shadow-[#FF4655]/25"
                title="Add a new service offering (Owner only)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white bg-[#0E141B] border border-[#1F2833] hover:border-zinc-600 rounded-lg transition-colors"
                title="Reset services to defaults (Owner only)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 font-mono">
              Adobe Creative Cloud Mastered Pipeline
            </div>
          )}
        </div>

        {/* Services List / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service) => {
            const isHovered = activeServiceId === service.id;
            return (
              <div
                key={service.id}
                onMouseEnter={() => setActiveServiceId(service.id)}
                className={`p-7 rounded-2xl border transition-all duration-300 flex flex-col justify-between group relative ${
                  isHovered
                    ? 'bg-[#0E141B] border-[#FF4655]/60 shadow-xl shadow-[#FF4655]/10'
                    : 'bg-[#0B1017] border-[#1F2833] hover:border-[#FF4655]/40'
                }`}
              >
                <div>
                  {/* Top Bar: Index + Software Logos + Admin Edit/Delete */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold text-[#FF4655] bg-[#FF4655]/10 border border-[#FF4655]/30 px-2 py-0.5 rounded">
                      {service.index}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Software brand logos */}
                      <div className="flex items-center gap-1.5">
                        {service.toolsUsed.map((tool) => (
                          <SoftwareLogo key={tool} name={tool} />
                        ))}
                      </div>

                      {/* Admin Controls on Service Card */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 pl-1.5 border-l border-[#1F2833]">
                          <button
                            type="button"
                            onClick={() => openEditModal(service)}
                            className="p-1 rounded bg-[#080B0F] hover:bg-[#FF4655] text-zinc-400 hover:text-white border border-[#1F2833] hover:border-[#FF4655] transition-colors"
                            title="Edit this service"
                            aria-label={`Edit ${service.title}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteService(service.id, service.title)}
                            className="p-1 rounded bg-[#080B0F] hover:bg-red-600 text-zinc-400 hover:text-white border border-[#1F2833] hover:border-red-500 transition-colors"
                            title="Delete this service"
                            aria-label={`Delete ${service.title}`}
                          >
                            <Trash2 className="w-3 h-3 text-red-400 hover:text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white font-display mb-2 group-hover:text-[#FF4655] transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs font-medium text-zinc-300 mb-3">
                    {service.tagline}
                  </p>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-[#1F2833]">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2.5">
                    Key Deliverables:
                  </span>
                  <ul className="space-y-1.5 mb-5">
                    {service.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-zinc-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-[#FF4655] transition-colors"
                  >
                    <span>Request Service</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Service Add / Edit Modal (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#0E141B] border border-[#1F2833] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1F2833] bg-[#080B0F]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-xs" />
                <h3 className="text-base font-bold text-white font-display">
                  {editingServiceId ? 'Edit Design Service' : 'Add New Design Service'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveService} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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

              {/* Number/Index & Title Row */}
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01"
                    value={formIndex}
                    onChange={(e) => setFormIndex(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white font-mono text-center focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
                <div className="col-span-9">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Esports Graphics Suites"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  placeholder="e.g. Broadcast Overlays, Matchday Visuals & Tournament Branding"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the technical execution, software pipeline, and commercial value of this service..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Software Pipeline / Tools Used */}
              <div className="p-3.5 rounded-xl bg-[#080B0F] border border-[#1F2833] space-y-2.5">
                <label className="text-xs font-mono text-white font-semibold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Software Pipeline (Icons automatically appear on card)</span>
                </label>

                {/* Common Tools Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_SOFTWARE.map((tool) => {
                    const isSelected = formTools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() => toggleTool(tool)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-colors text-left ${
                          isSelected
                            ? 'bg-[#FF4655]/15 border-[#FF4655] text-white font-semibold'
                            : 'bg-[#0E141B] border-[#1F2833] text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <SoftwareLogo name={tool} />
                        <span className="truncate">{tool.replace('Adobe ', '')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tool Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add custom tool (e.g. Cinema 4D, DaVinci)..."
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-[#0E141B] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655]"
                  />
                  <button
                    type="button"
                    onClick={addCustomTool}
                    className="px-3 py-1.5 text-xs font-mono text-white bg-[#1F2833] hover:bg-[#FF4655] rounded-lg transition-colors"
                  >
                    + Add Tool
                  </button>
                </div>
              </div>

              {/* Key Deliverables */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Key Deliverables (comma-separated bullet points)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Matchday Graphic Suites, Player Roster Cards, Tournament Lower Thirds, Animated Stingers"
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#1F2833] flex items-center justify-between">
                <div>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteService(editingServiceId, formTitle)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded transition-all shadow-md shadow-[#FF4655]/30"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>{editingServiceId ? 'Save Changes' : 'Publish Service'}</span>
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
            ? 'Reset Core Services to Defaults'
            : 'Delete Design Service'
        }
        itemName={deleteConfirm?.serviceTitle}
        message={
          deleteConfirm?.type === 'reset'
            ? 'Are you sure you want to reset all services back to the default 6 capabilities? Any custom additions or edits will be restored.'
            : `Are you sure you want to permanently delete the service "${deleteConfirm?.serviceTitle || 'this service'}"? This action cannot be undone.`
        }
        confirmText={
          deleteConfirm?.type === 'reset'
            ? 'Yes, Reset Services'
            : 'Yes, Delete Service'
        }
        isDestructive={true}
        onConfirm={handleExecuteDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </section>
  );
}
