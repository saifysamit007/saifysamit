import { useState, useMemo, useEffect } from 'react';
import { Plus, SlidersHorizontal, Check, X, Sparkles, Loader2, Image as ImageIcon, Trash2, RotateCcw, Images, Gamepad2, Cpu, Video } from 'lucide-react';
import { PORTFOLIO_PROJECTS, ProjectItem } from '../data/portfolioData';
import ProjectCard from './ProjectCard';
import { useAdmin, getAdminAuthHeaders } from '../context/AdminContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface SelectedWorkProps {
  onSelectProject: (project: ProjectItem) => void;
  onEditProject?: (project: ProjectItem) => void;
}

type CategoryFilter = 'ALL' | 'BRANDING' | 'ESPORTS' | 'SOCIAL' | 'THUMBNAILS' | 'CORPORATE' | 'MOTION';
type ThumbnailSubFilter = 'ALL' | 'GAMING' | 'TECH' | 'OTHERS';

export default function SelectedWork({ onSelectProject }: SelectedWorkProps) {
  const { isAdmin } = useAdmin();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('ALL');
  const [thumbnailSubFilter, setThumbnailSubFilter] = useState<ThumbnailSubFilter>('ALL');

  // Load projects from localStorage or default, and sync with free server database
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem('saify_portfolio_projects_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PORTFOLIO_PROJECTS;
  });

  // Sync with zero-token server database
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data?.projects && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjectsList(data.projects);
          try {
            localStorage.setItem('saify_portfolio_projects_custom', JSON.stringify(data.projects));
          } catch {}
        }
      })
      .catch(() => {})
    const handleProjectsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProjectsList(e.detail);
      }
    };
    window.addEventListener('saify_projects_updated', handleProjectsUpdated);

    return () => {
      window.removeEventListener('saify_projects_updated', handleProjectsUpdated);
    };
  }, []);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // In-app Confirmation Modal State (replaces window.confirm)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'project' | 'reset';
    projectId?: string;
    projectTitle?: string;
  } | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ProjectItem['category']>('ESPORTS');
  const [formThumbnailType, setFormThumbnailType] = useState<NonNullable<ProjectItem['thumbnailType']>>('GAMING');
  const [formYear, setFormYear] = useState('2026');
  const [formClient, setFormClient] = useState('');
  const [formClientType, setFormClientType] = useState('Esports / Commercial Organization');
  const [formRole, setFormRole] = useState('Graphics Artist & Visual Designer');
  const [formMainImage, setFormMainImage] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDeliverables, setFormDeliverables] = useState('Key Art, Social Assets, PSD Source');

  const categories: { label: string; value: CategoryFilter }[] = [
    { label: 'All Projects', value: 'ALL' },
    { label: 'Thumbnails', value: 'THUMBNAILS' },
    { label: 'Esports', value: 'ESPORTS' },
    { label: 'Branding', value: 'BRANDING' },
    { label: 'Social Media', value: 'SOCIAL' },
    { label: 'Corporate', value: 'CORPORATE' },
    { label: 'Motion', value: 'MOTION' },
  ];

  const thumbnailSubcategories: { label: string; value: ThumbnailSubFilter; icon?: any }[] = [
    { label: 'All Thumbnails', value: 'ALL' },
    { label: 'Gaming Thumbnails', value: 'GAMING', icon: Gamepad2 },
    { label: 'Tech Thumbnails', value: 'TECH', icon: Cpu },
    { label: 'Others / Media', value: 'OTHERS', icon: Video },
  ];

  const thumbnailCounts = useMemo(() => {
    const all = projectsList.filter((p) => p.category === 'THUMBNAILS');
    return {
      ALL: all.length,
      GAMING: all.filter((p) => p.thumbnailType === 'GAMING').length,
      TECH: all.filter((p) => p.thumbnailType === 'TECH').length,
      OTHERS: all.filter((p) => p.thumbnailType === 'OTHERS').length,
    };
  }, [projectsList]);

  const filteredProjects = useMemo(() => {
    let list = projectsList;
    if (activeFilter !== 'ALL') {
      list = list.filter((p) => p.category === activeFilter);
    }
    if (activeFilter === 'THUMBNAILS' && thumbnailSubFilter !== 'ALL') {
      list = list.filter((p) => p.thumbnailType === thumbnailSubFilter);
    }
    return list;
  }, [activeFilter, thumbnailSubFilter, projectsList]);

  // Open modal for Adding a new project (Admin Only)
  const handleOpenAddModal = () => {
    setEditingProjectId(null);
    setFormError(null);
    setFormTitle('');
    setFormCategory('THUMBNAILS');
    setFormThumbnailType('GAMING');
    setFormYear('2026');
    setFormClient('[Client / Team Partner]');
    setFormClientType('Content Creator / Brand');
    setFormRole('Lead Thumbnail Designer');
    setFormMainImage('');
    setFormGalleryImages([]);
    setNewGalleryInput('');
    setFormDescription('');
    setFormDeliverables('High-CTR Thumbnail, Layered PSD, Color Grading Kit');
    setIsModalOpen(true);
  };

  // Open modal for Editing an existing project (Admin Only)
  const handleOpenEditModal = (project: ProjectItem) => {
    setEditingProjectId(project.id);
    setFormError(null);
    setFormTitle(project.title);
    setFormCategory(project.category);
    setFormThumbnailType(project.thumbnailType || 'GAMING');
    setFormYear(project.year || '2026');
    setFormClient(project.client || '');
    setFormClientType(project.clientType || 'Commercial Organization');
    setFormRole(project.role || 'Graphics Artist & Visual Designer');
    setFormMainImage(project.thumbnail || '');
    setFormGalleryImages(
      project.gallery && project.gallery.length > 0
        ? project.gallery.filter((img) => img !== project.thumbnail)
        : []
    );
    setNewGalleryInput('');
    setFormDescription(project.shortDescription || '');
    setFormDeliverables(project.deliverables ? project.deliverables.join(', ') : 'Key Art, Social Assets');
    setIsModalOpen(true);
  };

  // Call AI Endpoint to generate short description from Title & Category
  const handleGenerateAiDescription = async () => {
    if (!formTitle.trim()) {
      setFormError('Please enter a Project Title first so the AI can understand what to describe!');
      return;
    }
    setFormError(null);

    setIsAiGenerating(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({
          title: formTitle,
          category: formCategory === 'THUMBNAILS' ? `${formThumbnailType} Thumbnails` : formCategory,
          year: formYear,
          deliverables: formDeliverables,
        }),
      });

      const data = await response.json();
      if (data?.description) {
        setFormDescription(data.description);
      }
    } catch (err) {
      console.error('Error generating description:', err);
      setFormDescription(
        `${formTitle} is an impactful ${formCategory.toLowerCase()} project engineered with bold composition and high-retention typography, delivered for multi-channel commercial deployment.`
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Add an image link to gallery
  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryInput.trim()) return;
    setFormGalleryImages([...formGalleryImages, newGalleryInput.trim()]);
    setNewGalleryInput('');
  };

  // Remove an image from gallery
  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryImages(formGalleryImages.filter((_, i) => i !== index));
  };

  // Save Project (Add or Edit)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMainImage.trim()) {
      setFormError('Please provide at least a Project Title and Main Cover Image URL.');
      return;
    }
    setFormError(null);

    let finalDescription = formDescription.trim();

    // If description is empty, auto-generate with AI based on title
    if (!finalDescription) {
      setIsAiGenerating(true);
      try {
        const response = await fetch('/api/generate-description', {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({
            title: formTitle,
            category: formCategory === 'THUMBNAILS' ? `${formThumbnailType} Thumbnails` : formCategory,
            year: formYear,
            deliverables: formDeliverables,
          }),
        });
        const data = await response.json();
        if (data?.description) {
          finalDescription = data.description;
        }
      } catch (err) {
        finalDescription = `${formTitle} is an authoritative ${formCategory.toLowerCase()} commercial design project executed with surgical precision and production-grade exports.`;
      } finally {
        setIsAiGenerating(false);
      }
    }

    const consolidatedGallery = Array.from(
      new Set([formMainImage.trim(), ...formGalleryImages.map((img) => img.trim()).filter(Boolean)])
    );

    const deliverablesArray = formDeliverables
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updated: ProjectItem[];

    if (editingProjectId) {
      // Update existing project
      updated = projectsList.map((p) => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            title: formTitle.trim(),
            category: formCategory,
            thumbnailType: formCategory === 'THUMBNAILS' ? formThumbnailType : undefined,
            year: formYear.trim() || '2026',
            client: formClient.trim() || p.client,
            clientType: formClientType.trim() || p.clientType,
            role: formRole.trim() || p.role,
            thumbnail: formMainImage.trim(),
            gallery: consolidatedGallery,
            shortDescription: finalDescription,
            deliverables: deliverablesArray.length > 0 ? deliverablesArray : p.deliverables,
          };
        }
        return p;
      });
    } else {
      // Create new project
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        thumbnailType: formCategory === 'THUMBNAILS' ? formThumbnailType : undefined,
        year: formYear.trim() || '2026',
        client: formClient.trim() || '[Client Partner]',
        clientType: formClientType.trim() || 'Commercial Organization',
        role: formRole.trim() || 'Graphics Artist & Visual Designer',
        shortDescription: finalDescription,
        thumbnail: formMainImage.trim(),
        aspectRatio: '16:9',
        overview: `${formTitle} is a commercial design showcase by Saify Samit.`,
        challenge: 'Capturing instant visual attention and brand authority.',
        approach: 'High-contrast typography hierarchy, dynamic lighting, and precision composition.',
        solution: 'Production-ready visual assets delivered across digital and physical touchpoints.',
        tools: ['Adobe Photoshop', 'Adobe Illustrator'],
        deliverables: deliverablesArray.length > 0 ? deliverablesArray : ['Key Visual Art', 'Social Graphics'],
        gallery: consolidatedGallery,
      };

      updated = [newProj, ...projectsList];
    }

    setProjectsList(updated);

    // Save to local storage
    try {
      localStorage.setItem('saify_portfolio_projects_custom', JSON.stringify(updated));
    } catch {}

    // Save to zero-token free server database
    fetch('/api/projects', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ projects: updated }),
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsModalOpen(false);
    }, 700);
  };

  // Open confirmation for reset defaults (Admin only)
  const handleResetToDefaults = () => {
    setDeleteConfirm({
      isOpen: true,
      type: 'reset',
      projectTitle: 'All Custom Projects',
    });
  };

  // Open confirmation for delete from edit modal
  const handleDeleteCurrentProject = () => {
    if (!editingProjectId) return;
    setDeleteConfirm({
      isOpen: true,
      type: 'project',
      projectId: editingProjectId,
      projectTitle: formTitle || 'this project',
    });
  };

  // Open confirmation for direct delete from card (Admin only)
  const handleDeleteProjectItem = (project: ProjectItem) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'project',
      projectId: project.id,
      projectTitle: project.title,
    });
  };

  // Execute deletion confirmed by user in modal
  const handleExecuteDeleteConfirm = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'project' && deleteConfirm.projectId) {
      const targetId = deleteConfirm.projectId;
      const updated = projectsList.filter((p) => p.id !== targetId);
      setProjectsList(updated);
      try {
        localStorage.setItem('saify_portfolio_projects_custom', JSON.stringify(updated));
      } catch {}
      fetch('/api/projects', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ projects: updated }),
      }).catch(() => {});

      if (isModalOpen && editingProjectId === targetId) {
        setIsModalOpen(false);
      }
    } else if (deleteConfirm.type === 'reset') {
      setProjectsList(PORTFOLIO_PROJECTS);
      try {
        localStorage.removeItem('saify_portfolio_projects_custom');
      } catch {}
      fetch('/api/projects/reset', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      }).catch(() => {});
    }

    setDeleteConfirm(null);
  };

  return (
    <section id="work" className="py-16 sm:py-24 bg-[#080B0F] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#FF4655] font-bold">
                CURATED ARCHIVE
              </span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span className="text-xs font-mono text-zinc-400">
                {projectsList.length} Commercial Works
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-display tracking-tight">
              Selected Commercial Work
            </h2>
          </div>

          {/* Owner-Only Action buttons: Add Project & Reset (HIDDEN for public visitors) */}
          {isAdmin && (
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-colors shadow-md shadow-[#FF4655]/25"
                title="Add a new project (Owner only)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>

              <button
                onClick={handleResetToDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:py-2.5 text-xs font-mono text-zinc-400 hover:text-white bg-[#0E141B] border border-[#1F2833] hover:border-zinc-600 rounded-lg transition-colors"
                title="Reset projects to defaults (Owner only)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Primary Filter Pills (Discipline) - Touch-friendly horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 mr-1 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">DISCIPLINE:</span>
          </div>

          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveFilter(cat.value);
                if (cat.value !== 'THUMBNAILS') {
                  setThumbnailSubFilter('ALL');
                }
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0 border ${
                activeFilter === cat.value
                  ? 'bg-[#FF4655] text-white border-[#FF4655] shadow-md shadow-[#FF4655]/30'
                  : 'bg-[#0E141B] text-zinc-400 border-[#1F2833] hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dedicated Thumbnail Sub-categories (Tech, Gaming, Others) */}
        {activeFilter === 'THUMBNAILS' && (
          <div className="mb-8 p-3 sm:p-4 rounded-xl bg-[#0E141B] border border-[#FF4655]/30 flex flex-wrap items-center gap-2 sm:gap-2.5 animate-in fade-in slide-in-from-top-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#FF4655] font-bold mr-1 sm:mr-2 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-pulse" />
              THUMBNAIL CLASSIFICATION:
            </span>

            {thumbnailSubcategories.map((sub) => {
              const Icon = sub.icon;
              const count = thumbnailCounts[sub.value];
              const isActive = thumbnailSubFilter === sub.value;

              return (
                <button
                  key={sub.value}
                  onClick={() => setThumbnailSubFilter(sub.value)}
                  className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all border shrink-0 ${
                    isActive
                      ? 'bg-[#FF4655] text-white border-[#FF4655] font-bold shadow-md shadow-[#FF4655]/30'
                      : 'bg-[#080B0F] text-zinc-300 border-[#1F2833] hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{sub.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Projects Grid: 1 col on mobile, 2 col on tablet (md), 3 col on desktop (lg) */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-[#0E141B] border border-[#1F2833] rounded-2xl p-8">
            <p className="text-zinc-400 text-sm font-mono mb-4">
              No projects found in this classification.
            </p>
            <button
              onClick={() => {
                setActiveFilter('ALL');
                setThumbnailSubFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-mono text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={onSelectProject}
                onEdit={isAdmin ? handleOpenEditModal : undefined}
                onDelete={isAdmin ? handleDeleteProjectItem : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Add / Edit Modal (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0E141B] border border-[#1F2833] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1F2833] bg-[#080B0F]">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-[#FF4655] rounded-xs" />
                <h3 className="text-base font-bold text-white font-display">
                  {editingProjectId ? 'Edit Project' : 'Add New Commercial Project'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
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

              {/* Title & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                <div className="sm:col-span-7">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next-Gen Gaming / Tech Thumbnails"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProjectItem['category'])}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white focus:outline-none focus:border-[#FF4655] cursor-pointer"
                  >
                    <option value="THUMBNAILS">THUMBNAILS</option>
                    <option value="ESPORTS">ESPORTS</option>
                    <option value="BRANDING">BRANDING</option>
                    <option value="SOCIAL">SOCIAL</option>
                    <option value="CORPORATE">CORPORATE</option>
                    <option value="MOTION">MOTION</option>
                  </select>
                </div>
              </div>

              {/* If Thumbnail, Niche selection: Gaming / Tech / Others */}
              {formCategory === 'THUMBNAILS' && (
                <div className="p-3 rounded-lg bg-[#080B0F] border border-[#1F2833]">
                  <label className="block text-xs font-mono text-[#FF4655] font-bold mb-1.5">
                    Thumbnail Niche / Classification *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['GAMING', 'TECH', 'OTHERS'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormThumbnailType(type)}
                        className={`py-1.5 px-2 text-xs font-mono rounded text-center transition-colors border ${
                          formThumbnailType === type
                            ? 'bg-[#FF4655] text-white border-[#FF4655] font-semibold'
                            : 'bg-[#0E141B] text-zinc-300 border-[#1F2833] hover:border-zinc-600'
                        }`}
                      >
                        {type === 'GAMING' ? '🎮 Gaming' : type === 'TECH' ? '⚡ Tech' : '🎬 Others'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Year & Client Row (Manually settable Year!) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Project Year *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026, 2025"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-xs font-mono text-zinc-300 mb-1">
                    Client or Team Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Silicon Matrix / Redline Media"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
              </div>

              {/* Main Cover Image (Added separately) */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#080B0F] border border-[#1F2833] space-y-2.5">
                <label className="text-xs font-mono text-white font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4655]" />
                  <span>Main Cover Image URL * (Primary Card Visual)</span>
                </label>

                <input
                  type="url"
                  required
                  placeholder="https://... direct image link"
                  value={formMainImage}
                  onChange={(e) => setFormMainImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E141B] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                />

                {formMainImage && (
                  <div className="relative w-full h-32 sm:h-40 rounded-lg overflow-hidden border border-[#1F2833] bg-black">
                    <img
                      src={formMainImage}
                      alt="Cover Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/80 text-[#FF4655] px-2 py-0.5 rounded border border-[#FF4655]/40">
                      MAIN COVER PREVIEW
                    </span>
                  </div>
                )}
              </div>

              {/* Multiple Gallery Images Section */}
              <div className="p-3 sm:p-4 rounded-xl bg-[#080B0F] border border-[#1F2833] space-y-2.5">
                <label className="text-xs font-mono text-white font-semibold flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span>Additional Gallery Views ({formGalleryImages.length} images)</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste additional gallery image URL..."
                    value={newGalleryInput}
                    onChange={(e) => setNewGalleryInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#0E141B] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-3 py-2 text-xs font-mono text-white bg-[#1F2833] hover:bg-[#FF4655] rounded-lg transition-colors shrink-0"
                  >
                    + Add View
                  </button>
                </div>

                {formGalleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {formGalleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-lg overflow-hidden border border-[#1F2833] h-18 sm:h-20 bg-black"
                      >
                        <img
                          src={img}
                          alt={`Gallery view ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded bg-black/80 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove view"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Small Description with AI Auto-Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-zinc-300">
                    Small Description (Empty = Auto AI)
                  </label>

                  {/* AI Auto-Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={isAiGenerating}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FF4655]/15 hover:bg-[#FF4655]/30 border border-[#FF4655]/50 text-[#FF4655] hover:text-white text-[11px] font-mono transition-colors disabled:opacity-50"
                    title="Understand title and auto-write a description with AI"
                  >
                    {isAiGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>AI Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Write with AI</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="Leave empty and AI will automatically understand your title and write a punchy commercial description, or write your own..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">
                  Deliverables Scope (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. YouTube Thumbnails, Source PSD, Retouching Assets"
                  value={formDeliverables}
                  onChange={(e) => setFormDeliverables(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#080B0F] border border-[#1F2833] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-[#1F2833] flex items-center justify-between">
                <div>
                  {editingProjectId && (
                    <button
                      type="button"
                      onClick={handleDeleteCurrentProject}
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
                    disabled={isAiGenerating}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-[#FF4655] hover:bg-[#ff5a68] rounded transition-all shadow-md shadow-[#FF4655]/30 disabled:opacity-50"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <span>{editingProjectId ? 'Save Changes' : 'Publish Project'}</span>
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
            ? 'Reset Portfolio to Defaults'
            : 'Delete Commercial Project'
        }
        itemName={deleteConfirm?.projectTitle}
        message={
          deleteConfirm?.type === 'reset'
            ? 'Are you sure you want to reset all portfolio projects to the default collection? Any added or edited projects will be reverted.'
            : `Are you sure you want to permanently delete "${deleteConfirm?.projectTitle || 'this project'}" from your portfolio? This action cannot be undone.`
        }
        confirmText={
          deleteConfirm?.type === 'reset'
            ? 'Yes, Reset Collection'
            : 'Yes, Delete Project'
        }
        isDestructive={true}
        onConfirm={handleExecuteDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </section>
  );
}
