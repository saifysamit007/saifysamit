export interface ProjectItem {
  id: string;
  title: string;
  category: 'BRANDING' | 'ESPORTS' | 'SOCIAL' | 'THUMBNAILS' | 'CORPORATE' | 'MOTION';
  client: string;
  clientType: string;
  year: string;
  role: string;
  shortDescription: string;
  thumbnail: string;
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4';
  featuredInHero?: boolean;
  overview: string;
  challenge: string;
  approach: string;
  solution: string;
  tools: string[];
  deliverables: string[];
  gallery: string[];
  thumbnailType?: 'TECH' | 'GAMING' | 'OTHERS';
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  toolsUsed: string[];
}

export interface ExperienceItem {
  id: string;
  sector: string;
  organization: string;
  role: string;
  period: string;
  summary: string;
  scope: string[];
  isPlaceholderNote?: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  role: string;
  companyOrTeam: string;
  projectScope: string;
  avatar: string;
  platform: 'whatsapp' | 'instagram' | 'website' | 'discord' | 'twitter' | 'other' | string;
  platformUsername?: string;
  rating: number;
}

export interface BehanceProject {
  id: string;
  title: string;
  url: string;
  coverImage: string;
  fields: string[];
  appreciations: number;
  views: number;
  publishedDate: string;
  description: string;
  galleryImages: string[];
}

export const ARTIST_PROFILE = {
  name: 'Saify Samit',
  age: 22,
  title: 'Graphics Artist & Visual Designer',
  experienceYears: '6+',
  availabilityStatus: 'Available for Select Commercial Projects',
  isAvailable: true,
  email: 'saifysamit@gmail.com',
  location: 'Global / Remote',
  portraitImage: 'https://media.discordapp.net/attachments/1042476011142512642/1554873186699452576/IMG_2187.JPG.jpeg?backend=b2&ex=6abe77ff&is=6abd267f&hm=55d3d41f648e547e375b63eac8ff5b225b60544be26c65518ab6bfee40ec1454&=&format=webp&width=576&height=1024',
  headline: 'Visuals built to make brands impossible to ignore.',
  bioSummary:
    'Saify Samit is a graphics artist with 6+ years of experience creating high-impact visual identities, digital campaigns, social content, esports graphics, and commercial design experiences.',
  editorialPhilosophy:
    'Design is not decoration. It is communication with intent. With over six years behind creative software, every composition is engineered to solve a commercial objective: capture visual attention, establish institutional authority, and convert audiences into committed believers.',
  socials: {
    behance: 'https://www.behance.net/tsam_dzn',
    discord: 'saify_samit',
    instagram: 'https://www.instagram.com/saify_samit/',
    linkedin: 'https://www.linkedin.com/in/saifysamit',
    whatsapp: 'https://wa.me/?text=Hi%20Saify,%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20commercial%20design%20project.',
  },
};

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateAgainstUSD: number;
  tiers: string[];
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar (USD)',
    rateAgainstUSD: 1,
    tiers: ['< $500', '$500 – $1,500', '$1,500 – $3,000', '$3,000+'],
  },
  {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka (BDT)',
    rateAgainstUSD: 118,
    tiers: ['< ৳55,000', '৳55,000 – ৳175,000', '৳175,000 – ৳350,000', '৳350,000+'],
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (EUR)',
    rateAgainstUSD: 0.92,
    tiers: ['< €460', '€460 – €1,380', '€1,380 – €2,760', '€2,760+'],
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (GBP)',
    rateAgainstUSD: 0.79,
    tiers: ['< £395', '£395 – £1,180', '£1,180 – £2,370', '£2,370+'],
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (INR)',
    rateAgainstUSD: 83.5,
    tiers: ['< ₹41,000', '₹41,000 – ₹125,000', '₹125,000 – ₹250,000', '₹250,000+'],
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CAD)',
    rateAgainstUSD: 1.36,
    tiers: ['< CA$680', 'CA$680 – CA$2,000', 'CA$2,000 – CA$4,000', 'CA$4,000+'],
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (AUD)',
    rateAgainstUSD: 1.52,
    tiers: ['< A$760', 'A$760 – A$2,280', 'A$2,280 – A$4,560', 'A$4,560+'],
  },
  {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham (AED)',
    rateAgainstUSD: 3.67,
    tiers: ['< AED 1,800', 'AED 1,800 – AED 5,500', 'AED 5,500 – AED 11,000', 'AED 11,000+'],
  },
];

export const CORE_TOOLS = [
  {
    name: 'Adobe Photoshop',
    category: 'Raster, Key Visuals & Retouching',
    tag: 'Primary Tool',
    description: 'Advanced compositing, color grading, matchday posters, digital manipulation, and complex thumbnail hierarchies.',
  },
  {
    name: 'Adobe Illustrator',
    category: 'Vector Systems & Typography',
    tag: 'Identity & Logos',
    description: 'Precision vector brand identity, typography construction, iconography, and scalable brand assets.',
  },
  {
    name: 'Adobe After Effects',
    category: 'Motion Design & Kinetic Assets',
    tag: 'Motion Graphics',
    description: 'Animated title sequences, promo lower-thirds, broadcast overlays, and kinetic social assets.',
  },
  {
    name: 'Adobe Premiere Pro',
    category: 'Video Editing & Pacing',
    tag: 'Video Production',
    description: 'Commercial pacing, showreel assembly, synchronized sound design, and content deliverable cutdowns.',
  },
];

export const SKILL_DOMAINS = [
  'Branding Systems',
  'Esports Graphics',
  'Key Visual Art Direction',
  'Thumbnail Engineering',
  'Social Media Campaigns',
  'Commercial Advertising',
  'Kinetic Typography',
  'Vector Mascot & Crests',
  'Print & Apparel Design',
  'Tournament Graphics Suites',
  'Pitch Deck Visuals',
  'Digital Packaging & Mockups',
];

export const CLIENT_CATEGORIES = [
  {
    id: 'esports',
    name: 'Esports Organizations',
    description: 'Tier-1 & competitive esports teams, tournament hosts, roster reveals, jersey concepts, and stream packages.',
    placeholderLabel: '[ESPORTS TEAM / TOURNAMENT ORG]',
  },
  {
    id: 'corporate',
    name: 'Corporate Enterprises',
    description: 'High-growth commercial businesses, corporate brand assets, key campaigns, and digital marketing visuals.',
    placeholderLabel: '[CORPORATE BRAND / ENTERPRISE]',
  },
  {
    id: 'agencies',
    name: 'Creative Agencies',
    description: 'Design agencies and production studios requiring fast-turnaround, senior-level visual execution.',
    placeholderLabel: '[CREATIVE PRODUCTION AGENCY]',
  },
  {
    id: 'creators',
    name: 'Organizations & Creators',
    description: 'Digital-first brands, organizations, and high-impact digital content creators reaching millions.',
    placeholderLabel: '[GLOBAL ORG / DIGITAL CREATOR]',
  },
];

export const PORTFOLIO_PROJECTS: ProjectItem[] = [
  {
    id: 'apex-esports-championship',
    title: 'Apex Division Championship Visual Identity',
    category: 'ESPORTS',
    client: '[Esports Team / Tournament Org Placeholder]',
    clientType: 'Competitive Esports Championship',
    year: '2025',
    role: 'Lead Graphics Artist & Art Direction',
    shortDescription: 'High-intensity matchday posters, player roster announcement suites, and stadium LED key visuals.',
    thumbnail: '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    aspectRatio: '16:9',
    featuredInHero: true,
    overview:
      'A comprehensive commercial tournament broadcast and graphics package built to generate viral fan engagement and broadcast authority across high-stakes matchdays.',
    challenge:
      'Create an athletic, gritty yet exceptionally polished visual system that maintains high legibility across mobile Twitter/X feeds, Twitch overlays, and massive arena LED screens.',
    approach:
      'Engineered an angular typography grid with sharp vector crest accents, high-contrast dynamic rim lighting, and a distinct amber-and-graphite palette that separated the event from oversaturated competition.',
    solution:
      'Delivered over 45 modular matchday templates, player battlecards, MVP graphics, and victory celebration lockups ready for live broadcast operators.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe After Effects'],
    deliverables: ['Tournament Key Visuals', 'Roster Reveal Suite', 'Matchday Templates', 'Broadcast Lower Thirds'],
    gallery: [
      '/src/assets/images/hero_esports_branding_1790776149956.jpg',
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    ],
  },
  {
    id: 'valkyrie-brand-identity',
    title: 'Aura Studio Minimalist Corporate Identity',
    category: 'BRANDING',
    client: '[Corporate Brand Placeholder]',
    clientType: 'Commercial Enterprise',
    year: '2025',
    role: 'Brand Identity Designer',
    shortDescription: 'Monochrome luxury identity system, stationery guidelines, and architectural collateral.',
    thumbnail: '/src/assets/images/work_branding_identity_1790776168205.jpg',
    aspectRatio: '4:3',
    featuredInHero: true,
    overview:
      'Architectural visual identity design including stationery suite, typography guidelines, presentation deck standards, and executive print mockups.',
    challenge:
      'Translate an abstract luxury service proposition into an uncompromising, tactile visual identity that conveys maturity, precision, and restrained confidence.',
    approach:
      'Developed custom sans-serif typographic ligatures paired with strict negative space layouts, matte graphite finishes, and blind-debossed textural accents.',
    solution:
      'A timeless 60-page brand guidelines document, digital asset library, business stationery templates, and bespoke presentation collateral.',
    tools: ['Adobe Illustrator', 'Adobe Photoshop'],
    deliverables: ['Brand Guidelines', 'Stationery Suite', 'Vector Logo System', 'Executive Presentation Deck'],
    gallery: [
      '/src/assets/images/work_branding_identity_1790776168205.jpg',
    ],
  },
  {
    id: 'vanguard-matchday-poster',
    title: 'Vanguard League Grand Finals Poster',
    category: 'ESPORTS',
    client: '[Esports Franchise Placeholder]',
    clientType: 'Pro Esports Organization',
    year: '2024',
    role: 'Key Visual Artist',
    shortDescription: 'Dynamic athlete spotlight, high-impact vector typography, and tournament campaign collateral.',
    thumbnail: '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    aspectRatio: '4:3',
    featuredInHero: true,
    overview:
      'Commemorative grand finals poster and digital matchday visual campaign celebrating the rivalry between leading professional teams.',
    challenge:
      'Balance commercial sponsor requirements with authentic esports culture, creating artwork that fans would want to download as wallpapers and print as posters.',
    approach:
      'Used deep atmospheric shadows, razor-sharp vector line work, and explosive energy accents that emphasize the athletic intensity of competitive gaming.',
    solution:
      'Generated multi-format campaign assets for stadium print, digital billboards, and synchronized social media rollouts during the finals weekend.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator'],
    deliverables: ['Grand Finals Key Art', 'Commemorative Print Poster', 'Social Media Matchup Assets'],
    gallery: [
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
      '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    ],
  },
  {
    id: 'gaming-ctr-thumbnail-suite',
    title: 'Pro Gaming & Tournament YouTube Thumbnails',
    category: 'THUMBNAILS',
    thumbnailType: 'GAMING',
    client: 'Redline Creator Lab (1.8M Subs)',
    clientType: 'Esports & Gaming Media Channel',
    year: '2025',
    role: 'Lead Visual Designer',
    shortDescription: 'High-intensity gaming thumbnails with surgical character lighting, weapon renders, and dynamic depth of field.',
    thumbnail: '/src/assets/images/work_thumbnail_design_1790776195553.jpg',
    aspectRatio: '16:9',
    featuredInHero: true,
    overview:
      'A series of bespoke esports and competitive gaming YouTube thumbnails engineered to boost viewer retention and CTR from 4% to 11%.',
    challenge:
      'Stand out in saturated competitive gaming algorithms without resorting to noisy, messy spam aesthetics.',
    approach:
      'Applied 3-point contrast isolation: intense rim lighting on player expressions, cinematic weapon glow, and crisp 2-word punch text.',
    solution:
      'Delivered 30+ high-converting gaming thumbnail templates with instant editable PSD layers.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator'],
    deliverables: ['Pro Gaming Thumbnails', 'Weapon Cutout Asset Pack', 'Typography Title Renders'],
    gallery: [
      '/src/assets/images/work_thumbnail_design_1790776195553.jpg',
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    ],
  },
  {
    id: 'tech-ai-compute-thumbnail-suite',
    title: 'Next-Gen AI Hardware & Tech Architecture Thumbnails',
    category: 'THUMBNAILS',
    thumbnailType: 'TECH',
    client: 'Silicon Matrix Media',
    clientType: 'Technology & AI Hardware Publication',
    year: '2026',
    role: 'Senior Visual Artist',
    shortDescription: 'Futuristic silicon die renders, high-contrast schematic graphics, and clean editorial tech typography.',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    aspectRatio: '16:9',
    overview:
      'Precision tech thumbnails created for deep-dive hardware breakdowns, GPU architecture reviews, and AI infrastructure announcements.',
    challenge:
      'Present complex engineering and silicon hardware concepts with instant visual intrigue for high-IQ tech audiences.',
    approach:
      'Paired metallic circuit aesthetics with subtle neon cyan lighting, micro-texture overlays, and clean technical schematics.',
    solution:
      'Produced a high-converting tech package resulting in over 2.4M organic impressions across deep-tech analysis videos.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator', 'Blender'],
    deliverables: ['Tech Explainer Thumbnails', 'Silicon Microchip Graphic Renders', 'Hardware Vector Icons'],
    gallery: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'lifestyle-creator-thumbnail-suite',
    title: 'Documentary, Lifestyle & Media Thumbnails',
    category: 'THUMBNAILS',
    thumbnailType: 'OTHERS',
    client: 'Vanguard Studios',
    clientType: 'Documentary & Creative Brand Channel',
    year: '2025',
    role: 'Editorial Thumbnail Designer',
    shortDescription: 'Cinematic storytelling thumbnails with natural facial emotion grading and clean minimalist typography.',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
    aspectRatio: '16:9',
    overview:
      'Editorial visual covers for long-form creator documentaries, interview specials, and commercial narrative video releases.',
    challenge:
      'Evoke curiosity and emotional resonance rather than high-contrast hype graphics, matching premium documentary standards.',
    approach:
      'Curated film-grade color grading, soft vignette shadows, and natural portrait isolation with restrained typographic branding.',
    solution:
      'Created cohesive series packages for 12 documentary episodes that established the channel as a premier content brand.',
    tools: ['Adobe Photoshop', 'Lightroom'],
    deliverables: ['Docu-Series Thumbnails', 'Cinematic LUT Grade Assets', 'Brand Lettering Templates'],
    gallery: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'gaming-valorant-champions-thumb',
    title: 'VCT Championship & Pro Esports Stream Thumbnails',
    category: 'THUMBNAILS',
    thumbnailType: 'GAMING',
    client: 'Apex Masters League',
    clientType: 'Tier-1 Esports Tournament',
    year: '2026',
    role: 'Lead Esports Thumbnail Specialist',
    shortDescription: 'Explosive player clash artwork with customized lighting, agent renders, and high-visibility typography.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    aspectRatio: '16:9',
    overview:
      'High-CTR competitive esports matchday and tournament highlight YouTube thumbnails designed for maximum mobile feed click-through rates.',
    challenge:
      'Compete in high-stakes esports feeds during tournament weekends where viewers decide what to watch in milliseconds.',
    approach:
      'Engineered an aggressive red-accented visual hierarchy featuring athlete portraits, agent silhouettes, and score clash badges.',
    solution:
      'Boosted stream highlight VOD views by 240% across official YouTube and Twitch broadcast archives.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator'],
    deliverables: ['Matchday Thumbnails', 'Victory Celebration Cards', 'Layered PSD Templates'],
    gallery: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
      '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    ],
  },
  {
    id: 'tech-quantum-ai-thumb',
    title: 'Quantum Neural Processing & GPU Benchmark Visuals',
    category: 'THUMBNAILS',
    thumbnailType: 'TECH',
    client: 'Silicon Byte Labs (850K Subs)',
    clientType: 'Tech & Semiconductor Media',
    year: '2026',
    role: 'Lead Visual Designer',
    shortDescription: 'Photorealistic microscopic processor dies, neon glow trace paths, and futuristic silicon packaging visuals.',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    aspectRatio: '16:9',
    overview:
      'Deep-dive technical hardware benchmark thumbnails designed to capture high-retention engineering audiences.',
    challenge:
      'Making complex architecture schematics look visually electrifying and accessible on mobile YouTube feeds.',
    approach:
      'High-contrast cyan and amber trace illumination with macro depth-of-field focus on custom chip renders.',
    solution:
      'Achieved average 9.8% CTR across 15 technical launch videos and hardware breakdowns.',
    tools: ['Adobe Photoshop', 'Blender', 'Adobe Illustrator'],
    deliverables: ['Custom 3D Chip Renders', 'Hardware Comparison Overlays', 'Editorial Title Packs'],
    gallery: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'others-podcast-interview-thumb',
    title: 'High-Profile Founder & Creator Studio Covers',
    category: 'THUMBNAILS',
    thumbnailType: 'OTHERS',
    client: 'Frontier Audio & Video Studio',
    clientType: 'Commercial Creator Network',
    year: '2025',
    role: 'Art Director',
    shortDescription: 'Cinematic studio lighting, authentic emotional expression, and premium editorial typography.',
    thumbnail: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&auto=format&fit=crop&q=80',
    aspectRatio: '16:9',
    overview:
      'Editorial long-form interview and podcast covers for leading creative entrepreneurs, founders, and digital leaders.',
    challenge:
      'Elevate from common generic podcast templates into an elite cinematic cover aesthetic comparable to premium magazine features.',
    approach:
      'Dual-tone studio portraiture, warm analog film texture, and surgical typographic balance in negative space.',
    solution:
      'Generated over 3.2M impressions and established a recognizable visual language for the podcast channel.',
    tools: ['Adobe Photoshop', 'Lightroom'],
    deliverables: ['Editorial Episode Covers', 'Social Video Cutout Assets', 'Branded Color Palette Presets'],
    gallery: [
      'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'stellar-campaign-visuals',
    title: 'Neo-Genesis Digital Campaign Graphics',
    category: 'CAMPAIGN' as any,
    client: '[Commercial Agency Placeholder]',
    clientType: 'Brand Campaign',
    year: '2024',
    role: 'Senior Digital Designer',
    shortDescription: 'Omnichannel digital advertising banners, launch hero graphics, and interactive campaign media.',
    thumbnail: '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    aspectRatio: '16:9',
    overview:
      'Multi-platform campaign visuals engineered for high-engagement product reveals across web displays, digital storefronts, and paid social channels.',
    challenge:
      'Create a visual identity that scales cleanly from ultra-wide 4K desktop headers down to 1080x1080 social feeds without losing compositional balance.',
    approach:
      'Constructed a modular design grid allowing focal elements to shift naturally while maintaining unified color psychology and typography hierarchy.',
    solution:
      'A complete suite of 20+ responsive graphic deliverables with optimized WebP/PNG assets for rapid web delivery.',
    tools: ['Adobe Photoshop', 'Adobe Illustrator'],
    deliverables: ['Omnichannel Banner Sets', 'Paid Social Ad Suites', 'Hero Launch Artwork'],
    gallery: [
      '/src/assets/images/hero_esports_branding_1790776149956.jpg',
      '/src/assets/images/work_branding_identity_1790776168205.jpg',
    ],
  },
  {
    id: 'broadcast-motion-overlays',
    title: 'Kinetic Broadcast & Motion Assets',
    category: 'MOTION',
    client: '[Production Studio Placeholder]',
    clientType: 'Broadcast & Media Studio',
    year: '2024',
    role: 'Motion Graphics Artist',
    shortDescription: 'Animated stream overlays, animated transitions, stingers, and promotional teaser loops.',
    thumbnail: '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    aspectRatio: '4:3',
    overview:
      'Dynamic motion graphics and kinetic typography designed for live stream broadcasts, tournament transitions, and social media video teasers.',
    challenge:
      'Ensure 60fps lightweight playback on live production software while providing high cinematic weight and crisp graphical fidelity.',
    approach:
      'Crafted custom particle accents, vector easing curves, and synchronized audio-visual rhythm inside After Effects.',
    solution:
      'Packaged transparent Alpha WebM and ProRes stingers, intro bumpers, and looping screen backdrops.',
    tools: ['Adobe After Effects', 'Adobe Premiere Pro', 'Adobe Photoshop'],
    deliverables: ['Animated Lower Thirds', 'Custom Stinger Transitions', 'Kinetic Social Loops'],
    gallery: [
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    ],
  },
];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'brand-identity',
    index: '01',
    title: 'Brand Identity',
    tagline: 'Distinctive visual systems that give brands recognizable authority.',
    description:
      'End-to-end brand identity architecture from logo marks and vector crests to typography systems, color theory, and complete commercial guidelines books.',
    deliverables: ['Logo & Vector Crest Design', 'Typography & Color Systems', 'Brand Guidelines PDF', 'Stationery & Mockup Collateral'],
    toolsUsed: ['Adobe Illustrator', 'Adobe Photoshop'],
  },
  {
    id: 'esports-graphics',
    index: '02',
    title: 'Esports Graphics',
    tagline: 'Competitive, energetic visual systems for pro teams & leagues.',
    description:
      'High-impact matchday graphics, tournament packages, roster announcements, MVP celebrations, and jersey presentation graphics tailored for competitive gaming culture.',
    deliverables: ['Matchday & Roster Announcements', 'Tournament Key Visuals', 'Jersey Concept Presentation', 'Stream Overlays & Assets'],
    toolsUsed: ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe After Effects'],
  },
  {
    id: 'social-media-design',
    index: '03',
    title: 'Social Media Design',
    tagline: 'High-impact social content designed for digital audiences.',
    description:
      'Scroll-stopping visual assets for Instagram, X (Twitter), LinkedIn, and community platforms that maintain unified brand consistency and drive authentic engagement.',
    deliverables: ['Carousel Graphic Sets', 'Promotional Announcement Posts', 'Banner & Header Design', 'Community Event Visuals'],
    toolsUsed: ['Adobe Photoshop', 'Adobe Illustrator'],
  },
  {
    id: 'thumbnail-design',
    index: '04',
    title: 'Thumbnail Design',
    tagline: 'Attention-driven thumbnail design focused on visual hierarchy & click appeal.',
    description:
      'Conversion-focused digital creator thumbnails engineered with surgical eye-tracking hierarchy, depth layering, high-contrast facial grading, and zero clutter.',
    deliverables: ['High-CTR YouTube Thumbnails', 'Custom Typographic Hooks', 'Asset Layering & Color Pop', 'A/B Testing Thumbnail Variants'],
    toolsUsed: ['Adobe Photoshop', 'Adobe Illustrator'],
  },
  {
    id: 'campaign-design',
    index: '05',
    title: 'Campaign & Promo Graphics',
    tagline: 'Cohesive visual systems for digital campaigns and promotional launches.',
    description:
      'Multi-format commercial advertising graphics designed for product releases, sponsorships, seasonal activations, and coordinated marketing drops.',
    deliverables: ['Key Visual Campaign Concept', 'Display Ads in All Aspect Ratios', 'Website Banner Graphics', 'Digital Billboards & POS'],
    toolsUsed: ['Adobe Photoshop', 'Adobe Illustrator'],
  },
  {
    id: 'motion-graphics',
    index: '06',
    title: 'Motion Graphics',
    tagline: 'Animated visual content for campaigns, social media & broadcasts.',
    description:
      'Kinetic typography, animated logos, broadcast stingers, and short-form video graphics that add dimension and movement to static brand systems.',
    deliverables: ['Animated Logo Reveal', 'Broadcast Lower Thirds', 'Kinetic Title Cards', 'Short-Form Social Animations'],
    toolsUsed: ['Adobe After Effects', 'Adobe Premiere Pro'],
  },
];

export const EXPERIENCE_TIMELINE: ExperienceItem[] = [
  {
    id: 'agency',
    sector: 'AGENCY EXPERIENCE',
    organization: '[Creative Design Agency Placeholder]',
    role: 'Senior Visual Designer / Graphics Artist',
    period: '2023 — Present',
    summary:
      'Executed commercial campaign collateral, client visual identities, and rapid-turnaround digital assets for agency partner accounts.',
    scope: [
      'Commercial brand identity systems and guidelines',
      'High-conversion social content for agency accounts',
      'Art direction alignment with creative directors',
    ],
    isPlaceholderNote: 'Agency name and specific client accounts can be customized here.',
  },
  {
    id: 'esports-team',
    sector: 'ESPORTS ORGANIZATIONS',
    organization: '[Recognized Esports Team / League Placeholder]',
    role: 'Lead Esports Graphics Artist',
    period: '2021 — 2024',
    summary:
      'Spearheaded tournament matchday graphics, player announcement packages, social media identity, and live-event broadcast visual suites.',
    scope: [
      'Matchday artwork & real-time tournament graphics',
      'Official player roster reveals & transfer announcements',
      'Merchandise & jersey graphics presentation',
    ],
    isPlaceholderNote: 'Replace with specific pro esports team or gaming organization.',
  },
  {
    id: 'corporate-org',
    sector: 'CORPORATE & ORGANIZATIONS',
    organization: '[Corporate Enterprise / Organization Placeholder]',
    role: 'Commercial Visual Designer',
    period: '2020 — 2023',
    summary:
      'Created marketing assets, corporate annual graphics, key visual presentations, and digital brand collateral for established commercial entities.',
    scope: [
      'Corporate pitch deck graphics and annual report visuals',
      'Digital campaign collateral and web marketing banners',
      'Cross-functional collaboration with marketing directors',
    ],
    isPlaceholderNote: 'Replace with corporate client or enterprise entity.',
  },
  {
    id: 'independent',
    sector: 'FREELANCE / INDEPENDENT',
    organization: 'Commercial & Global Clients',
    role: 'Independent Graphics Artist & Visual Consultant',
    period: '2019 — Present (6+ Years)',
    summary:
      'Direct visual consultancy providing high-impact graphics, brand systems, and creative solutions to global brands, creators, and teams.',
    scope: [
      'Over 6 years of commercial client design engagements',
      'Global remote collaboration across multiple timezones',
      'End-to-end creative direction from concept to production-ready export',
    ],
    isPlaceholderNote: 'Active ongoing independent practice.',
  },
];

export const DESIGN_PROCESS = [
  {
    step: '01',
    title: 'DISCOVER',
    subtitle: 'Deep Brand & Audience Understanding',
    description:
      'We unpack the core commercial objective, target demographic, competitor landscape, and specific channels where the artwork will live.',
    deliverable: 'Creative Brief & Direction Alignment',
  },
  {
    step: '02',
    title: 'DEFINE',
    subtitle: 'Visual Direction & Concept Strategy',
    description:
      'Establishing moodboards, typographic pairings, lighting references, and aesthetic benchmarks before touching production canvas.',
    deliverable: 'Visual Moodboard & Concept Architecture',
  },
  {
    step: '03',
    title: 'DESIGN',
    subtitle: 'High-Fidelity Composition & Craft',
    description:
      'Crafting primary key visuals in Adobe Photoshop and Illustrator with surgical attention to composition, contrast, lighting, and detail.',
    deliverable: 'Primary Visual Drafts & Variations',
  },
  {
    step: '04',
    title: 'REFINE',
    subtitle: 'Iterate, Polish & Perfect',
    description:
      'Collaborative feedback loops to dial in nuances: color grading, typographic micro-spacing, texture balance, and commercial legibility.',
    deliverable: 'Polished Master Artwork',
  },
  {
    step: '05',
    title: 'DELIVER',
    subtitle: 'Production-Ready Master Assets',
    description:
      'Exporting optimized multi-format deliverables (WebP, PNG, vector SVG, PDF, PSD/AI source files) formatted exactly for your deployment needs.',
    deliverable: 'Complete Production-Ready Asset Package',
  },
];

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: 'test-1',
    quote:
      'Saify delivered our entire esports tournament key art package in 48 hours. The lighting, player cutouts, and typography hierarchy gave our broadcast an instant Tier-1 international feel.',
    clientName: 'Julian Vance',
    role: 'Tournament Director',
    companyOrTeam: 'Apex Syndicate Esports',
    projectScope: 'VCT Tournament Key Visuals & Roster Reveal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    platform: 'whatsapp',
    platformUsername: '+1 (415) ***-9281',
    rating: 5,
  },
  {
    id: 'test-2',
    quote:
      'Working with Saify on our Instagram campaign was seamless. The carousel slides and post templates doubled our reach in the first week. His visual eye for contrast and composition is rare.',
    clientName: 'Elena Rostova',
    role: 'Head of Social & Growth',
    companyOrTeam: 'Aura Digital Agency',
    projectScope: 'Social Campaign & Brand Identity Suite',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    platform: 'instagram',
    platformUsername: '@elena_aura',
    rating: 5,
  },
  {
    id: 'test-3',
    quote:
      'Direct website commission inquiry. Needed YouTube thumbnails that actually convert click-through rates. Saify revised the framing and expression hierarchy, and our CTR rose from 4.2% to 10.8%.',
    clientName: 'Marcus Chen',
    role: 'Lead Content Creator',
    companyOrTeam: 'Redline Creator Lab (1.8M Subs)',
    projectScope: 'High-Retention Thumbnail Packaging',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    platform: 'website',
    platformUsername: 'Direct Web Inquiry',
    rating: 5,
  },
  {
    id: 'test-4',
    quote:
      'Found Saify via Discord creative server. He crafted our matchday announcements and roster jerseys graphic kit. Super quick responses, provided full editable PSDs without asking twice.',
    clientName: 'Kaito Takahashi',
    role: 'Team Captain & Co-Owner',
    companyOrTeam: 'Protocol Clan Esports',
    projectScope: 'Matchday Graphic Kit & Team Identity',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    platform: 'discord',
    platformUsername: 'kaito_proto#001',
    rating: 5,
  },
  {
    id: 'test-5',
    quote:
      'WhatsApp audio call was all we needed. Understood the brand mood board immediately and delivered 10 commercial marketing graphics for our quarterly drop. True professional mastery.',
    clientName: 'Tariq Al-Mansoor',
    role: 'Creative Producer',
    companyOrTeam: 'Shadow Ops Media',
    projectScope: 'Quarterly Commercial Key Art Package',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80',
    platform: 'whatsapp',
    platformUsername: '+971 50 *** 4109',
    rating: 5,
  },
];

export const INITIAL_BEHANCE_PROJECTS: BehanceProject[] = [
  {
    id: 'behance-1',
    title: 'VALORANT Masters International Key Art & Roster Suite',
    url: 'https://www.behance.net/gallery/valorant-masters-concept',
    coverImage: '/src/assets/images/hero_esports_branding_1790776149956.jpg',
    fields: ['Esports', 'Key Visuals', 'Graphic Design'],
    appreciations: 482,
    views: 3940,
    publishedDate: 'January 2026',
    description: 'Comprehensive competitive esports key visual suite, tournament branding, typography systems, and stadium LED backdrop designs.',
    galleryImages: [
      '/src/assets/images/hero_esports_branding_1790776149956.jpg',
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    ],
  },
  {
    id: 'behance-2',
    title: 'Aura Studio Minimalist Corporate Brand Architecture',
    url: 'https://www.behance.net/gallery/aura-studio-identity',
    coverImage: '/src/assets/images/work_branding_identity_1790776168205.jpg',
    fields: ['Branding', 'Art Direction', 'Typography'],
    appreciations: 615,
    views: 5210,
    publishedDate: 'November 2025',
    description: 'Architectural brand guidelines, luxury corporate stationery suite, custom typography ligatures, and presentation decks.',
    galleryImages: [
      '/src/assets/images/work_branding_identity_1790776168205.jpg',
    ],
  },
  {
    id: 'behance-3',
    title: 'Vanguard Pro Grand Finals Matchday Poster',
    url: 'https://www.behance.net/gallery/vanguard-grand-finals',
    coverImage: '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    fields: ['Esports', 'Poster Design', 'Digital Art'],
    appreciations: 390,
    views: 3450,
    publishedDate: 'August 2025',
    description: 'Athletic esports player spotlight with razor-sharp vector line work, dark atmosphere, and explosive energy accents.',
    galleryImages: [
      '/src/assets/images/work_esports_tournament_1790776181826.jpg',
    ],
  },
  {
    id: 'behance-4',
    title: 'High-Retention Editorial Creator Thumbnail Series',
    url: 'https://www.behance.net/gallery/high-retention-thumbnails',
    coverImage: '/src/assets/images/work_thumbnail_design_1790776195553.jpg',
    fields: ['Thumbnail Design', 'Commercial', 'Social Media'],
    appreciations: 528,
    views: 4720,
    publishedDate: 'June 2025',
    description: 'Conversion-engineered YouTube thumbnails with surgical eye-tracking hierarchy, depth layering, and high-contrast facial grading.',
    galleryImages: [
      '/src/assets/images/work_thumbnail_design_1790776195553.jpg',
    ],
  },
];

