/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SelectedWork from './components/SelectedWork';
import ProjectModal from './components/ProjectModal';
import Services from './components/Services';
import About from './components/About';
import DesignProcess from './components/DesignProcess';
import Testimonials from './components/Testimonials';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import SectionWrapper from './components/SectionWrapper';
import MaintenanceAlertBanner from './components/MaintenanceAlertBanner';
import MaintenancePage from './components/MaintenancePage';
import NotFoundPage from './components/NotFoundPage';
import { CurrencyProvider } from './context/CurrencyContext';
import { AdminProvider, useAdmin, getAdminAuthHeaders } from './context/AdminContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import AdminAccessModal from './components/AdminAccessModal';
import { PORTFOLIO_PROJECTS, ProjectItem } from './data/portfolioData';

function AppContent() {
  const { isAdmin } = useAdmin();
  const { settings, isLoading } = useSiteSettings();

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // Client Routing state (Supports /404, unknown routes, and hash #404)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#404') return '/404';
      return window.location.pathname;
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.hash === '#404') {
        setCurrentPath('/404');
      } else {
        setCurrentPath(window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string, targetAnchor?: string) => {
    if (path === '/') {
      window.history.pushState({}, '', '/' + (targetAnchor || ''));
      setCurrentPath('/');
      if (targetAnchor) {
        setTimeout(() => {
          const el = document.querySelector(targetAnchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProject = (project: ProjectItem) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const getCurrentProjects = (): ProjectItem[] => {
    try {
      const saved = localStorage.getItem('saify_portfolio_projects_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PORTFOLIO_PROJECTS;
  };

  const handleNavigateProject = (direction: 'next' | 'prev') => {
    if (!selectedProject) return;
    const currentList = getCurrentProjects();
    const currentIndex = currentList.findIndex((p) => p.id === selectedProject.id);
    if (currentIndex === -1) return;

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % currentList.length;
      setSelectedProject(currentList[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
      setSelectedProject(currentList[prevIndex]);
    }
  };

  const handleDeleteProject = (project: ProjectItem) => {
    const currentList = getCurrentProjects();
    const updated = currentList.filter((p) => p.id !== project.id);
    try {
      localStorage.setItem('saify_portfolio_projects_custom', JSON.stringify(updated));
    } catch {}
    fetch('/api/projects', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ projects: updated }),
    }).catch(() => {});
    setSelectedProject(null);
    window.dispatchEvent(new CustomEvent('saify_projects_updated', { detail: updated }));
  };

  const scrollToContact = () => {
    if (currentPath !== '/') {
      navigateTo('/', '#contact');
      return;
    }
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToWork = () => {
    if (currentPath !== '/') {
      navigateTo('/', '#work');
      return;
    }
    const el = document.getElementById('work');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. ROUTE CHECK: Is this an Error 404 route?
  const is404 =
    currentPath === '/404' ||
    (currentPath !== '/' &&
      currentPath !== '' &&
      !currentPath.startsWith('/#') &&
      currentPath !== '/index.html');

  if (is404) {
    return (
      <div className="min-h-screen bg-[#080B0F] text-zinc-100 flex flex-col font-sans selection:bg-[#FF4655]/30 selection:text-white">
        <CustomCursor />
        <AdminAccessModal />
        <NotFoundPage onNavigateHome={(anchor) => navigateTo('/', anchor)} />
      </div>
    );
  }

  // 2. MAINTENANCE MODE CHECK:
  // If Maintenance Mode is active AND the user is NOT an admin, show only the Maintenance screen!
  // If the user IS an admin, bypass maintenance so they can preview/work on the live site!
  if (settings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#080B0F] text-zinc-100 flex flex-col font-sans selection:bg-[#FF4655]/30 selection:text-white">
        <CustomCursor />
        <AdminAccessModal />
        <MaintenancePage />
      </div>
    );
  }

  // 3. LIVE PORTFOLIO: Render complete site with per-section admin controls
  return (
    <div className="min-h-screen bg-[#080B0F] text-zinc-100 flex flex-col font-sans selection:bg-[#FF4655]/30 selection:text-white">
      {/* Cinematic Intro Preloader (Admin Controlled ON/OFF) */}
      {settings.preloaderEnabled !== false && <Preloader />}

      {/* Subtle Desktop Precision Cursor with Valorant Red */}
      <CustomCursor />

      {/* Sticky Global Maintenance Alert Banner for Admin (Provides 1-Click Turn Off) */}
      <MaintenanceAlertBanner />

      {/* Owner Mode Security & Login Modal */}
      <AdminAccessModal />

      {/* Sticky Navigation */}
      <Navbar onContactClick={scrollToContact} />

      {/* Main Content Sections with Per-Section Admin Visibility Toggles */}
      <main className="flex-1">
        {/* Section 1: Hero Section */}
        <SectionWrapper sectionKey="hero">
          <Hero onExploreWork={scrollToWork} onContactClick={scrollToContact} />
        </SectionWrapper>

        {/* Section 2: Selected Work Showcase */}
        <SectionWrapper sectionKey="work">
          <SelectedWork onSelectProject={handleSelectProject} />
        </SectionWrapper>

        {/* Section 3: Services & Commercial Deliverables */}
        <SectionWrapper sectionKey="services">
          <Services />
        </SectionWrapper>

        {/* Section 4: About Saify Samit (Background & Philosophy) */}
        <SectionWrapper sectionKey="about">
          <About />
        </SectionWrapper>

        {/* Section 5: Structured 4-Stage Design Process */}
        <SectionWrapper sectionKey="process">
          <DesignProcess />
        </SectionWrapper>

        {/* Section 6: Verified Client Testimonials */}
        <SectionWrapper sectionKey="testimonials">
          <Testimonials />
        </SectionWrapper>

        {/* Section 7: Contact & Conversion Section */}
        <SectionWrapper sectionKey="contact">
          <ContactSection />
        </SectionWrapper>
      </main>

      {/* Minimal Premium Footer */}
      <Footer />

      {/* Case Study Fullscreen Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={handleCloseModal}
        onNavigate={handleNavigateProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AdminProvider>
        <SiteSettingsProvider>
          <AppContent />
        </SiteSettingsProvider>
      </AdminProvider>
    </CurrencyProvider>
  );
}
