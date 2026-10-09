import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdmin, getAdminAuthHeaders } from './AdminContext';

export type SectionKey =
  | 'hero'
  | 'work'
  | 'services'
  | 'about'
  | 'process'
  | 'testimonials'
  | 'contact';

export const SECTION_METADATA: Record<
  SectionKey,
  { label: string; description: string; anchor: string }
> = {
  hero: {
    label: 'Hero & Key Visual',
    description: 'Header, 5-picture visual slider, artist headline & main CTA',
    anchor: '#',
  },
  work: {
    label: 'Selected Work',
    description: 'Interactive 3D tilt project cards, category filters & image zoom modals',
    anchor: '#work',
  },
  services: {
    label: 'Services & Deliverables',
    description: 'Esports branding, visual identity, creator graphics & streaming suites',
    anchor: '#services',
  },
  about: {
    label: 'Background & Philosophy',
    description: '6+ years bio, design credentials, stats & customizable portrait picture',
    anchor: '#about',
  },
  process: {
    label: 'Design Process',
    description: '4-stage disciplined commercial execution pipeline',
    anchor: '#process',
  },
  testimonials: {
    label: 'Client Testimonials',
    description: 'Verified reviews marquee with esports and commercial source badges',
    anchor: '#testimonials',
  },
  contact: {
    label: 'Contact & Conversion Form',
    description: 'Project inquiry form, dynamic multi-currency budget selector & direct links',
    anchor: '#contact',
  },
};

export const DEFAULT_FAVICON_SVG =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0e14'/><path d='M10 23V9h4.5a4.5 4.5 0 0 1 3.2 1.3A4.5 4.5 0 0 1 19 13.5c0 1.2-.4 2.2-1.2 3A4.5 4.5 0 0 1 21 20.5c0 1.3-.5 2.4-1.4 3.3-.9.9-2 1.2-3.3 1.2H10zm3-8.5h1.8c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.4 0-.6-.2-1.1-.6-1.5-.4-.4-.9-.5-1.5-.5H13v4zm0 6h2.2c.7 0 1.3-.2 1.7-.7.4-.4.7-1 .7-1.6 0-.6-.2-1.2-.7-1.6-.4-.4-1-.7-1.7-.7H13v4.6z' fill='%23FF4655'/></svg>";

export type ThemePreset = 'crimson' | 'winter' | 'emerald' | 'gold' | 'violet' | 'custom';

export interface ThemeConfig {
  preset: ThemePreset;
  primaryColor?: string;
  primaryHover?: string;
  glowColor?: string;
  bgBase?: string;
  surfaceColor?: string;
  borderColor?: string;
  winterSnowEnabled?: boolean;
  winterFrostVignette?: boolean;
  winterSnowIntensity?: 'subtle' | 'moderate' | 'blizzard';
}

export const THEME_PRESETS: Record<
  ThemePreset,
  {
    name: string;
    tagline: string;
    badge: string;
    primaryColor: string;
    primaryHover: string;
    glowColor: string;
    bgBase: string;
    surfaceColor: string;
    borderColor: string;
  }
> = {
  crimson: {
    name: 'Crimson Protocol',
    tagline: 'Signature Valorant Red & Shadow Onyx',
    badge: 'Original Edition',
    primaryColor: '#FF4655',
    primaryHover: '#ff5e6c',
    glowColor: 'rgba(255, 70, 85, 0.45)',
    bgBase: '#080B0F',
    surfaceColor: '#0E141B',
    borderColor: '#1F2833',
  },
  winter: {
    name: 'Winter Frost',
    tagline: 'Chilled Glacier Cyan, Falling Snow & Crystals',
    badge: 'Seasonal Edition',
    primaryColor: '#38bdf8',
    primaryHover: '#0ea5e9',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    bgBase: '#050c18',
    surfaceColor: '#0c192c',
    borderColor: '#1e3a5f',
  },
  emerald: {
    name: 'Cyberpunk Jade',
    tagline: 'Vibrant Neo-Tokyo Emerald & Hyper-Black',
    badge: 'Esports Edition',
    primaryColor: '#10b981',
    primaryHover: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgBase: '#050d0a',
    surfaceColor: '#0c1a14',
    borderColor: '#143828',
  },
  gold: {
    name: 'Imperial Sovereign',
    tagline: 'Executive Champagne Gold & Obsidian Luxury',
    badge: 'Commercial Edition',
    primaryColor: '#f59e0b',
    primaryHover: '#d97706',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgBase: '#0c0a06',
    surfaceColor: '#18140c',
    borderColor: '#382d18',
  },
  violet: {
    name: 'Neon Violet Void',
    tagline: 'Arcane Electric Purple & Deep Space Twilight',
    badge: 'Creative Edition',
    primaryColor: '#a855f7',
    primaryHover: '#9333ea',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    bgBase: '#0b0612',
    surfaceColor: '#160d24',
    borderColor: '#301b4e',
  },
  custom: {
    name: 'Custom Accent',
    tagline: 'Bespoke Palette Engineered by Saify',
    badge: 'Custom',
    primaryColor: '#FF4655',
    primaryHover: '#ff5e6c',
    glowColor: 'rgba(255, 70, 85, 0.45)',
    bgBase: '#080B0F',
    surfaceColor: '#0E141B',
    borderColor: '#1F2833',
  },
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'crimson',
  primaryColor: '#FF4655',
  primaryHover: '#ff5e6c',
  glowColor: 'rgba(255, 70, 85, 0.45)',
  bgBase: '#080B0F',
  surfaceColor: '#0E141B',
  borderColor: '#1F2833',
  winterSnowEnabled: true,
  winterFrostVignette: true,
  winterSnowIntensity: 'moderate',
};

export interface SiteCopyConfig {
  heroBadge?: string;
  heroHeadline?: string;
  heroHighlightText?: string;
  heroDescription?: string;
  heroCtaWork?: string;
  heroCtaContact?: string;
  artistTitle?: string;
  contactHeadline?: string;
  contactSubtitle?: string;
}

export const DEFAULT_SITE_COPY: SiteCopyConfig = {
  heroBadge: 'Commercial & Esports Graphics Artist',
  heroHeadline: 'Visuals built to make brands',
  heroHighlightText: 'impossible to ignore.',
  heroDescription:
    'Commercial visual identity, esports branding, and premium motion graphics crafted for tier-one creators, gaming organizations, and ambitious modern brands.',
  heroCtaWork: 'Explore Selected Work',
  heroCtaContact: 'Commission a Project',
  artistTitle: 'Graphics Artist & Visual Designer',
  contactHeadline: "Let's build something exceptional together.",
  contactSubtitle: 'Have a project, campaign, or rebrand in mind? Send your project brief directly.',
};

export interface SiteSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  faviconUrl?: string | null;
  preloaderEnabled: boolean;
  theme: ThemeConfig;
  customCopy: SiteCopyConfig;
  sectionVisibility: Record<SectionKey, boolean>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  maintenanceMode: false,
  maintenanceMessage:
    "Scheduled visual upgrades and system maintenance underway. Saify Samit is updating the portfolio with new commercial projects. We'll be back shortly.",
  faviconUrl: null,
  preloaderEnabled: true,
  theme: DEFAULT_THEME_CONFIG,
  customCopy: DEFAULT_SITE_COPY,
  sectionVisibility: {
    hero: true,
    work: true,
    services: true,
    about: true,
    process: true,
    testimonials: true,
    contact: true,
  },
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  isSectionVisible: (key: SectionKey) => boolean;
  toggleSectionVisibility: (key: SectionKey) => Promise<boolean>;
  toggleMaintenanceMode: (enabled?: boolean) => Promise<boolean>;
  setMaintenanceMode: (enabled: boolean) => Promise<boolean>;
  updateMaintenanceMessage: (msg: string) => Promise<boolean>;
  updateFavicon: (url: string | null) => Promise<boolean>;
  resetFavicon: () => Promise<boolean>;
  togglePreloader: (enabled?: boolean) => Promise<boolean>;
  resetAllSectionsToVisible: () => Promise<boolean>;
  isSectionManagerOpen: boolean;
  openSectionManager: () => void;
  closeSectionManager: () => void;
  isFaviconModalOpen: boolean;
  openFaviconModal: () => void;
  closeFaviconModal: () => void;
  isCustomizerOpen: boolean;
  openCustomizer: () => void;
  closeCustomizer: () => void;
  setThemePreset: (preset: ThemePreset, customPrimaryColor?: string) => Promise<boolean>;
  updateTheme: (updates: Partial<ThemeConfig>) => Promise<boolean>;
  updateCustomCopy: (copy: Partial<SiteCopyConfig>) => Promise<boolean>;
  resetThemeToDefault: () => Promise<boolean>;
  resetCopyToDefault: () => Promise<boolean>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const STORAGE_KEY = 'saify_site_settings_v1';

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useAdmin();
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          maintenanceMode: Boolean(parsed.maintenanceMode),
          maintenanceMessage: parsed.maintenanceMessage || DEFAULT_SETTINGS.maintenanceMessage,
          faviconUrl: parsed.faviconUrl !== undefined ? parsed.faviconUrl : null,
          preloaderEnabled:
            parsed.preloaderEnabled !== undefined ? Boolean(parsed.preloaderEnabled) : true,
          theme: { ...DEFAULT_THEME_CONFIG, ...(parsed.theme || {}) },
          customCopy: { ...DEFAULT_SITE_COPY, ...(parsed.customCopy || {}) },
          sectionVisibility: {
            ...DEFAULT_SETTINGS.sectionVisibility,
            ...(parsed.sectionVisibility || {}),
          },
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
  const [isFaviconModalOpen, setIsFaviconModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Sync from server on mount
  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then((data) => {
        if (data?.settings) {
          const merged: SiteSettings = {
            maintenanceMode: Boolean(data.settings.maintenanceMode),
            maintenanceMessage:
              data.settings.maintenanceMessage || DEFAULT_SETTINGS.maintenanceMessage,
            faviconUrl:
              data.settings.faviconUrl !== undefined ? data.settings.faviconUrl : null,
            preloaderEnabled:
              data.settings.preloaderEnabled !== undefined
                ? Boolean(data.settings.preloaderEnabled)
                : true,
            theme: { ...DEFAULT_THEME_CONFIG, ...(data.settings.theme || {}) },
            customCopy: { ...DEFAULT_SITE_COPY, ...(data.settings.customCopy || {}) },
            sectionVisibility: {
              ...DEFAULT_SETTINGS.sectionVisibility,
              ...(data.settings.sectionVisibility || {}),
            },
          };
          setSettings(merged);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Using local site settings cache:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Cross-tab / cross-window sync listener
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('saify_site_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('saify_site_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Dynamically update document <link rel="icon"> and apple-touch-icon in real-time
  useEffect(() => {
    const faviconUrl = settings.faviconUrl || DEFAULT_FAVICON_SVG;
    try {
      const existingIcons = document.querySelectorAll("link[rel*='icon']");
      existingIcons.forEach((el) => el.remove());

      const link = document.createElement('link');
      link.id = 'app-favicon';
      link.rel = 'icon';

      if (faviconUrl.startsWith('data:image/svg')) {
        link.type = 'image/svg+xml';
      } else if (faviconUrl.endsWith('.png') || faviconUrl.startsWith('data:image/png')) {
        link.type = 'image/png';
      } else if (
        faviconUrl.endsWith('.jpg') ||
        faviconUrl.endsWith('.jpeg') ||
        faviconUrl.startsWith('data:image/jpeg')
      ) {
        link.type = 'image/jpeg';
      } else if (faviconUrl.endsWith('.ico') || faviconUrl.startsWith('data:image/x-icon')) {
        link.type = 'image/x-icon';
      }

      link.href = faviconUrl;
      document.head.appendChild(link);

      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = faviconUrl;
      document.head.appendChild(appleLink);
    } catch (err) {
      console.error('Failed to update browser tab favicon:', err);
    }
  }, [settings.faviconUrl]);

  const persistSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {}
    window.dispatchEvent(
      new CustomEvent('saify_site_settings_updated', { detail: newSettings })
    );

    try {
      await fetch('/api/site-settings', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch {}
    return true;
  };

  const isSectionVisible = (key: SectionKey): boolean => {
    return settings.sectionVisibility[key] !== false;
  };

  const toggleSectionVisibility = async (key: SectionKey): Promise<boolean> => {
    const currentVal = settings.sectionVisibility[key] !== false;
    const updatedSettings: SiteSettings = {
      ...settings,
      sectionVisibility: {
        ...settings.sectionVisibility,
        [key]: !currentVal,
      },
    };
    return persistSettings(updatedSettings);
  };

  const toggleMaintenanceMode = async (enabled?: boolean): Promise<boolean> => {
    const targetState = enabled !== undefined ? enabled : !settings.maintenanceMode;
    const updatedSettings: SiteSettings = {
      ...settings,
      maintenanceMode: targetState,
    };
    return persistSettings(updatedSettings);
  };

  const setMaintenanceMode = async (enabled: boolean): Promise<boolean> => {
    return toggleMaintenanceMode(enabled);
  };

  const updateMaintenanceMessage = async (msg: string): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      maintenanceMessage: msg.trim() || DEFAULT_SETTINGS.maintenanceMessage,
    };
    return persistSettings(updatedSettings);
  };

  const updateFavicon = async (url: string | null): Promise<boolean> => {
    const cleanUrl = url ? url.trim() : null;
    const updatedSettings: SiteSettings = {
      ...settings,
      faviconUrl: cleanUrl,
    };
    return persistSettings(updatedSettings);
  };

  const resetFavicon = async (): Promise<boolean> => {
    return updateFavicon(null);
  };

  const togglePreloader = async (enabled?: boolean): Promise<boolean> => {
    const target = enabled !== undefined ? enabled : !(settings.preloaderEnabled !== false);
    const updatedSettings: SiteSettings = {
      ...settings,
      preloaderEnabled: target,
    };
    return persistSettings(updatedSettings);
  };

  const resetAllSectionsToVisible = async (): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      sectionVisibility: { ...DEFAULT_SETTINGS.sectionVisibility },
    };
    return persistSettings(updatedSettings);
  };

  const setThemePreset = async (preset: ThemePreset, customPrimaryColor?: string): Promise<boolean> => {
    const presetData = THEME_PRESETS[preset] || THEME_PRESETS.crimson;
    const newTheme: ThemeConfig = {
      ...settings.theme,
      preset,
      primaryColor: customPrimaryColor || presetData.primaryColor,
      primaryHover: presetData.primaryHover,
      glowColor: presetData.glowColor,
      bgBase: presetData.bgBase,
      surfaceColor: presetData.surfaceColor,
      borderColor: presetData.borderColor,
    };
    const updatedSettings: SiteSettings = {
      ...settings,
      theme: newTheme,
    };
    return persistSettings(updatedSettings);
  };

  const updateTheme = async (updates: Partial<ThemeConfig>): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      theme: { ...settings.theme, ...updates },
    };
    return persistSettings(updatedSettings);
  };

  const updateCustomCopy = async (copyUpdates: Partial<SiteCopyConfig>): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      customCopy: { ...settings.customCopy, ...copyUpdates },
    };
    return persistSettings(updatedSettings);
  };

  const resetThemeToDefault = async (): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      theme: { ...DEFAULT_THEME_CONFIG },
    };
    return persistSettings(updatedSettings);
  };

  const resetCopyToDefault = async (): Promise<boolean> => {
    const updatedSettings: SiteSettings = {
      ...settings,
      customCopy: { ...DEFAULT_SITE_COPY },
    };
    return persistSettings(updatedSettings);
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        isSectionVisible,
        toggleSectionVisibility,
        toggleMaintenanceMode,
        setMaintenanceMode,
        updateMaintenanceMessage,
        updateFavicon,
        resetFavicon,
        togglePreloader,
        resetAllSectionsToVisible,
        isSectionManagerOpen,
        openSectionManager: () => setIsSectionManagerOpen(true),
        closeSectionManager: () => setIsSectionManagerOpen(false),
        isFaviconModalOpen,
        openFaviconModal: () => setIsFaviconModalOpen(true),
        closeFaviconModal: () => setIsFaviconModalOpen(false),
        isCustomizerOpen,
        openCustomizer: () => setIsCustomizerOpen(true),
        closeCustomizer: () => setIsCustomizerOpen(false),
        setThemePreset,
        updateTheme,
        updateCustomCopy,
        resetThemeToDefault,
        resetCopyToDefault,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
