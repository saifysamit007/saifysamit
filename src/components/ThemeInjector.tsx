import { useEffect } from 'react';
import { useSiteSettings, THEME_PRESETS } from '../context/SiteSettingsContext';

export default function ThemeInjector() {
  const { settings } = useSiteSettings();
  const theme = settings.theme || {
    preset: 'crimson',
    primaryColor: '#FF4655',
    primaryHover: '#ff5e6c',
    glowColor: 'rgba(255, 70, 85, 0.45)',
    bgBase: '#080B0F',
    surfaceColor: '#0E141B',
    borderColor: '#1F2833',
  };

  const presetInfo = THEME_PRESETS[theme.preset] || THEME_PRESETS.crimson;
  const primary = theme.primaryColor || presetInfo.primaryColor;
  const hover = theme.primaryHover || presetInfo.primaryHover;
  const glow = theme.glowColor || presetInfo.glowColor;
  const bgBase = theme.bgBase || presetInfo.bgBase;
  const surface = theme.surfaceColor || presetInfo.surfaceColor;
  const border = theme.borderColor || presetInfo.borderColor;

  const isWinter = theme.preset === 'winter';

  useEffect(() => {
    // Add theme attribute and class to root/body for styling hooks
    document.documentElement.setAttribute('data-theme', theme.preset);
    if (isWinter) {
      document.body.classList.add('theme-winter');
    } else {
      document.body.classList.remove('theme-winter');
    }

    return () => {
      document.body.classList.remove('theme-winter');
    };
  }, [theme.preset, isWinter]);

  // Construct dynamic CSS rules that seamlessly re-theme all components
  const dynamicCss = `
    :root {
      --theme-primary: ${primary};
      --theme-primary-hover: ${hover};
      --theme-glow: ${glow};
      --theme-bg-base: ${bgBase};
      --theme-surface: ${surface};
      --theme-border: ${border};
      --valorant-red: ${primary};
      --color-valorant-red: ${primary};
    }

    /* Primary Accent Color Overrides for Tailwind hardcoded values */
    [class*="text-[#FF4655]"],
    .text-\\[\\#FF4655\\] {
      color: ${primary} !important;
    }

    [class*="bg-[#FF4655]"],
    .bg-\\[\\#FF4655\\] {
      background-color: ${primary} !important;
    }

    [class*="border-[#FF4655]"],
    .border-\\[\\#FF4655\\] {
      border-color: ${primary} !important;
    }

    [class*="fill-[#FF4655]"],
    .fill-\\[\\#FF4655\\] {
      fill: ${primary} !important;
    }

    [class*="hover:bg-[#ff5a68]"]:hover,
    [class*="hover:bg-[#ff5e6c]"]:hover {
      background-color: ${hover} !important;
    }

    [class*="hover:text-[#FF4655]"]:hover {
      color: ${hover} !important;
    }

    [class*="hover:border-[#FF4655]"]:hover {
      border-color: ${primary} !important;
    }

    [class*="focus:border-[#FF4655]"]:focus {
      border-color: ${primary} !important;
    }

    /* Glow & Shadow Effects */
    [class*="shadow-[#FF4655]"] {
      --tw-shadow-color: ${glow} !important;
      box-shadow: 0 10px 25px -5px ${glow} !important;
    }

    /* Global Selection Highlighting */
    ::selection {
      background: ${glow} !important;
      color: #ffffff !important;
    }

    /* Scrollbar hover */
    ::-webkit-scrollbar-thumb:hover {
      background: ${primary} !important;
    }

    /* 3D Cube Colors in Navbar */
    .cube-face-front { background: ${primary} !important; border-color: ${hover} !important; }
    .cube-face-right { background: ${hover} !important; }
    .cube-face-top { background: ${primary}dd !important; }

    ${
      isWinter
        ? `
      /* =================================================================
         WINTER FROST & COLD ICE SPECIAL THEME STYLES
         ================================================================= */
      body.theme-winter {
        background-color: #050a14 !important;
        color: #e2f1fd !important;
      }

      /* Frosted Glacial Navbar */
      .theme-winter .glass-navbar {
        background: rgba(5, 10, 20, 0.88) !important;
        border-bottom: 1px solid rgba(56, 189, 248, 0.25) !important;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(125, 211, 252, 0.2) !important;
      }

      /* Frosted Card Sheen */
      .theme-winter [class*="bg-[#0E141B]"] {
        background-color: rgba(9, 19, 34, 0.85) !important;
        border-color: rgba(56, 189, 248, 0.22) !important;
        backdrop-filter: blur(12px) !important;
      }

      .theme-winter [class*="bg-[#080B0F]"] {
        background-color: #050a14 !important;
      }

      /* Cold Icy Borders & Card Hovers */
      .theme-winter [class*="hover:border-[#FF4655]"]:hover {
        border-color: #7dd3fc !important;
        box-shadow: 0 0 20px rgba(56, 189, 248, 0.25) !important;
      }

      /* 3D Brand Emblem in Winter Frost */
      .theme-winter .cube-face {
        border: 1px solid rgba(125, 211, 252, 0.8) !important;
        box-shadow: inset 0 0 8px rgba(56, 189, 248, 0.6) !important;
      }
      .theme-winter .cube-face-front { background: rgba(56, 189, 248, 0.9) !important; }
      .theme-winter .cube-face-back { background: rgba(6, 14, 26, 0.95) !important; }
      .theme-winter .cube-face-right { background: rgba(14, 165, 233, 0.85) !important; }
      .theme-winter .cube-face-left { background: rgba(3, 105, 161, 0.9) !important; }
      .theme-winter .cube-face-top { background: rgba(186, 230, 253, 0.95) !important; }
      .theme-winter .cube-face-bottom { background: rgba(5, 10, 20, 0.95) !important; }

      /* Glitch Text in Winter Frost */
      .theme-winter .glitch-text {
        background-image: linear-gradient(to right, #ffffff, #7dd3fc, #38bdf8) !important;
      }
    `
        : ''
    }
  `;

  return <style id="saify-theme-injected-styles">{dynamicCss}</style>;
}
