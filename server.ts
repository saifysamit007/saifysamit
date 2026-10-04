import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '15mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database file setup (100% free, zero token required)
const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

export interface SiteSettingsData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  faviconUrl?: string | null;
  preloaderEnabled?: boolean;
  sectionVisibility: {
    hero: boolean;
    work: boolean;
    services: boolean;
    about: boolean;
    process: boolean;
    testimonials: boolean;
    contact: boolean;
  };
}

const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  maintenanceMode: false,
  maintenanceMessage: "Scheduled visual upgrades and system maintenance underway. We'll be back shortly.",
  faviconUrl: null,
  preloaderEnabled: true,
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

interface DatabaseSchema {
  projects: any[] | null;
  heroBackgrounds: any[] | null;
  services: any[] | null;
  testimonials: any[] | null;
  portraitFraming: { x: number; y: number; scale: number } | null;
  portraitImage: string | null;
  faviconUrl?: string | null;
  adminPasscodeHash?: string;
  siteSettings?: SiteSettingsData | null;
}

const SERVER_AUTH_SECRET =
  process.env.AUTH_SECRET || 'saify_samit_commercial_portfolio_auth_secret_2026_unbreakable';
const DEFAULT_INITIAL_PASSCODE = process.env.ADMIN_PASSCODE || 'saify2026';

function hashPasscode(passcode: string): string {
  return crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(passcode.trim()).digest('hex');
}

function initDb(): DatabaseSchema {
  let data: any = {};
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      data = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  const initialData: DatabaseSchema = {
    projects: data.projects || null,
    heroBackgrounds: data.heroBackgrounds || null,
    services: data.services || null,
    testimonials: data.testimonials || null,
    portraitFraming: data.portraitFraming || null,
    portraitImage: data.portraitImage || null,
    faviconUrl: data.faviconUrl || data.siteSettings?.faviconUrl || null,
    adminPasscodeHash: data.adminPasscodeHash || hashPasscode(DEFAULT_INITIAL_PASSCODE),
    siteSettings: {
      ...DEFAULT_SITE_SETTINGS,
      ...(data.siteSettings || {}),
      faviconUrl: data.siteSettings?.faviconUrl || data.faviconUrl || null,
      preloaderEnabled:
        data.siteSettings?.preloaderEnabled !== undefined
          ? data.siteSettings.preloaderEnabled
          : true,
    },
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch {}
  return initialData;
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// Initialize database
let db = initDb();

// -------------------------------------------------------------
// SECURITY: Session Token Store & Brute Force Rate Limiting
// -------------------------------------------------------------
interface AdminSession {
  createdAt: number;
  expiresAt: number;
}
const activeAdminTokens = new Map<string, AdminSession>();

// Rate limit map: IP -> attempts & lockout timestamp
interface RateLimitRecord {
  attempts: number;
  lockoutUntil: number;
  lastAttempt: number;
}
const loginRateLimits = new Map<string, RateLimitRecord>();

// Clean up expired sessions periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of activeAdminTokens.entries()) {
    if (now > session.expiresAt) {
      activeAdminTokens.delete(token);
    }
  }
}, 5 * 60 * 1000);

function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown-client';
}

function checkLoginRateLimit(ip: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimits.get(ip);
  if (!record) return { allowed: true };

  if (record.lockoutUntil > now) {
    const remaining = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds: remaining };
  }

  // Reset if last attempt was > 10 minutes ago
  if (now - record.lastAttempt > 10 * 60 * 1000) {
    loginRateLimits.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedLogin(ip: string): { attempts: number; lockoutSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimits.get(ip) || { attempts: 0, lockoutUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;

  let lockoutSeconds: number | undefined;
  if (record.attempts >= 4) {
    record.lockoutUntil = now + 30000; // 30s lockout after 4 attempts
    lockoutSeconds = 30;
  }
  loginRateLimits.set(ip, record);
  return { attempts: record.attempts, lockoutSeconds };
}

function recordSuccessfulLogin(ip: string) {
  loginRateLimits.delete(ip);
}

// Security Middleware: Require Valid Admin Session Token
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const customHeader = req.headers['x-admin-token'] as string;
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Access denied: Admin authorization token required to perform modifications.',
    });
  }

  const session = activeAdminTokens.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeAdminTokens.delete(token);
    return res.status(401).json({
      error: 'Access denied: Admin session is invalid or has expired. Please authenticate.',
    });
  }

  next();
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

// POST /api/auth/login — Authenticate owner with passcode
app.post('/api/auth/login', (req, res) => {
  const ip = getClientIp(req);
  const rateLimit = checkLoginRateLimit(ip);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: `Security lockout active due to multiple failed attempts. Please wait ${rateLimit.remainingSeconds}s.`,
      lockoutSeconds: rateLimit.remainingSeconds,
    });
  }

  const { passcode } = req.body;
  if (typeof passcode !== 'string' || !passcode.trim()) {
    const { attempts, lockoutSeconds } = recordFailedLogin(ip);
    return res.status(400).json({
      error: 'Passcode is required',
      remainingAttempts: Math.max(0, 4 - attempts),
      lockoutSeconds,
    });
  }

  const incomingHash = hashPasscode(passcode);
  const storedHash = db.adminPasscodeHash || hashPasscode(DEFAULT_INITIAL_PASSCODE);

  // Constant-time buffer comparison to prevent timing attacks
  const incomingBuffer = Buffer.from(incomingHash);
  const storedBuffer = Buffer.from(storedHash);

  const isMatch =
    incomingBuffer.length === storedBuffer.length &&
    crypto.timingSafeEqual(incomingBuffer, storedBuffer);

  if (!isMatch) {
    const { attempts, lockoutSeconds } = recordFailedLogin(ip);
    if (lockoutSeconds) {
      return res.status(429).json({
        error: 'Too many incorrect attempts. Security lockout active for 30 seconds.',
        lockoutSeconds: 30,
      });
    }
    return res.status(401).json({
      error: `Incorrect owner passcode. ${4 - attempts} attempt${4 - attempts === 1 ? '' : 's'} remaining before lockout.`,
      remainingAttempts: 4 - attempts,
    });
  }

  // Success: issue secure cryptographic session token (valid for 7 days)
  recordSuccessfulLogin(ip);
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000;

  activeAdminTokens.set(token, {
    createdAt: now,
    expiresAt,
  });

  return res.json({
    success: true,
    token,
    expiresIn: 7 * 24 * 60 * 60,
  });
});

// POST /api/auth/verify — Check if an existing session token is valid
app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const customHeader = req.headers['x-admin-token'] as string;
  const bodyToken = req.body?.token;
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  } else if (typeof bodyToken === 'string') {
    token = bodyToken.trim();
  }

  if (!token) {
    return res.json({ authenticated: false });
  }

  const session = activeAdminTokens.get(token);
  if (!session || Date.now() > session.expiresAt) {
    if (session) activeAdminTokens.delete(token);
    return res.json({ authenticated: false });
  }

  return res.json({ authenticated: true });
});

// POST /api/auth/logout — Invalidate session token
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const customHeader = req.headers['x-admin-token'] as string;
  const bodyToken = req.body?.token;
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (customHeader) {
    token = customHeader.trim();
  } else if (typeof bodyToken === 'string') {
    token = bodyToken.trim();
  }

  if (token) {
    activeAdminTokens.delete(token);
  }

  return res.json({ success: true, message: 'Admin session terminated' });
});

// POST /api/auth/change-passcode — Change secret passcode (Protected)
app.post('/api/auth/change-passcode', requireAdminAuth, (req, res) => {
  try {
    const { oldPasscode, newPasscode } = req.body;
    if (!oldPasscode || !newPasscode) {
      return res.status(400).json({ error: 'Both current passcode and new passcode are required.' });
    }

    if (typeof newPasscode !== 'string' || newPasscode.trim().length < 6) {
      return res.status(400).json({ error: 'New passcode must be at least 6 characters long.' });
    }

    const currentHash = db.adminPasscodeHash || hashPasscode(DEFAULT_INITIAL_PASSCODE);
    const oldHash = hashPasscode(oldPasscode);

    const oldBuffer = Buffer.from(oldHash);
    const currBuffer = Buffer.from(currentHash);

    if (oldBuffer.length !== currBuffer.length || !crypto.timingSafeEqual(oldBuffer, currBuffer)) {
      return res.status(401).json({ error: 'Current passcode is incorrect.' });
    }

    // Update database with new hashed passcode
    db.adminPasscodeHash = hashPasscode(newPasscode.trim());
    saveDb(db);

    return res.json({ success: true, message: 'Passcode successfully updated and secured.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Public Data APIs
// -------------------------------------------------------------

// 0. Zero-Token Free Database Status API
app.get('/api/db-status', (req, res) => {
  res.json({
    status: 'operational',
    storage: 'Local JSON File System Database',
    requiresToken: false,
    cost: '100% Free Forever',
    projectsCount: db.projects ? db.projects.length : 'default',
    heroBackgroundsCount: db.heroBackgrounds ? db.heroBackgrounds.length : 'default',
    servicesCount: db.services ? db.services.length : 'default',
    testimonialsCount: db.testimonials ? db.testimonials.length : 'default',
  });
});

// 1. Projects REST API
app.get('/api/projects', (req, res) => {
  res.json({ projects: db.projects || [] });
});

app.post('/api/projects', requireAdminAuth, (req, res) => {
  try {
    const { projects } = req.body;
    if (Array.isArray(projects)) {
      db.projects = projects;
      saveDb(db);
      return res.json({ success: true, count: projects.length });
    }
    res.status(400).json({ error: 'Projects must be an array' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/reset', requireAdminAuth, (req, res) => {
  db.projects = null;
  saveDb(db);
  res.json({ success: true, message: 'Reset to default projects' });
});

// 2. Hero Backgrounds REST API
app.get('/api/hero-backgrounds', (req, res) => {
  res.json({ backgrounds: db.heroBackgrounds || [] });
});

app.post('/api/hero-backgrounds', requireAdminAuth, (req, res) => {
  try {
    const { backgrounds } = req.body;
    if (Array.isArray(backgrounds)) {
      db.heroBackgrounds = backgrounds;
      saveDb(db);
      return res.json({ success: true, count: backgrounds.length });
    }
    res.status(400).json({ error: 'Backgrounds must be an array' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Services REST API
app.get('/api/services', (req, res) => {
  res.json({ services: db.services || [] });
});

app.post('/api/services', requireAdminAuth, (req, res) => {
  try {
    const { services } = req.body;
    if (Array.isArray(services)) {
      db.services = services;
      saveDb(db);
      return res.json({ success: true, count: services.length });
    }
    res.status(400).json({ error: 'Services must be an array' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services/reset', requireAdminAuth, (req, res) => {
  db.services = null;
  saveDb(db);
  res.json({ success: true, message: 'Reset to default services' });
});

// 4. Testimonials REST API
app.get('/api/testimonials', (req, res) => {
  res.json({ testimonials: db.testimonials || [] });
});

app.post('/api/testimonials', requireAdminAuth, (req, res) => {
  try {
    const { testimonials } = req.body;
    if (Array.isArray(testimonials)) {
      db.testimonials = testimonials;
      saveDb(db);
      return res.json({ success: true, count: testimonials.length });
    }
    res.status(400).json({ error: 'Testimonials must be an array' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/testimonials/reset', requireAdminAuth, (req, res) => {
  db.testimonials = null;
  saveDb(db);
  res.json({ success: true, message: 'Reset to default testimonials' });
});

// 5. Portrait Framing REST API
app.get('/api/portrait-framing', (req, res) => {
  res.json({ framing: db.portraitFraming || null });
});

app.post('/api/portrait-framing', requireAdminAuth, (req, res) => {
  try {
    const { framing } = req.body;
    if (
      framing &&
      typeof framing.x === 'number' &&
      typeof framing.y === 'number' &&
      typeof framing.scale === 'number'
    ) {
      db.portraitFraming = framing;
      saveDb(db);
      return res.json({ success: true, framing });
    }
    res.status(400).json({ error: 'Invalid framing data' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Portrait Image REST API
app.get('/api/portrait-image', (req, res) => {
  res.json({ image: db.portraitImage || null });
});

app.post('/api/portrait-image', requireAdminAuth, (req, res) => {
  try {
    const { image } = req.body;
    if (typeof image === 'string' && image.trim().length > 0) {
      db.portraitImage = image.trim();
      saveDb(db);
      return res.json({ success: true, image: db.portraitImage });
    }
    res.status(400).json({ error: 'Invalid image URL' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/portrait-image/reset', requireAdminAuth, (req, res) => {
  db.portraitImage = null;
  saveDb(db);
  res.json({ success: true, message: 'Reset to default portrait image' });
});

// 7. Site Settings (Maintenance Mode & Section Visibility) REST API
app.get('/api/site-settings', (req, res) => {
  res.json({
    settings: db.siteSettings || DEFAULT_SITE_SETTINGS,
  });
});

app.post('/api/site-settings', requireAdminAuth, (req, res) => {
  try {
    const { settings } = req.body;
    if (settings && typeof settings === 'object') {
      const current = db.siteSettings || DEFAULT_SITE_SETTINGS;
      const updated: SiteSettingsData = {
        maintenanceMode:
          typeof settings.maintenanceMode === 'boolean'
            ? settings.maintenanceMode
            : current.maintenanceMode,
        maintenanceMessage:
          typeof settings.maintenanceMessage === 'string' && settings.maintenanceMessage.trim()
            ? settings.maintenanceMessage.trim()
            : current.maintenanceMessage,
        faviconUrl:
          typeof settings.faviconUrl === 'string'
            ? settings.faviconUrl.trim()
            : settings.faviconUrl === null
              ? null
              : current.faviconUrl,
        preloaderEnabled:
          typeof settings.preloaderEnabled === 'boolean'
            ? settings.preloaderEnabled
            : current.preloaderEnabled !== false,
        sectionVisibility: {
          hero: settings.sectionVisibility?.hero !== false,
          work: settings.sectionVisibility?.work !== false,
          services: settings.sectionVisibility?.services !== false,
          about: settings.sectionVisibility?.about !== false,
          process: settings.sectionVisibility?.process !== false,
          testimonials: settings.sectionVisibility?.testimonials !== false,
          contact: settings.sectionVisibility?.contact !== false,
        },
      };
      db.siteSettings = updated;
      if (updated.faviconUrl !== undefined) {
        db.faviconUrl = updated.faviconUrl;
      }
      saveDb(db);
      return res.json({ success: true, settings: updated });
    }
    res.status(400).json({ error: 'Invalid settings payload' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Custom Favicon REST API
app.get('/api/favicon', (req, res) => {
  res.json({
    faviconUrl: db.faviconUrl || db.siteSettings?.faviconUrl || null,
  });
});

app.post('/api/favicon', requireAdminAuth, (req, res) => {
  try {
    const { faviconUrl } = req.body;
    if (typeof faviconUrl === 'string' && faviconUrl.trim().length > 0) {
      const cleanUrl = faviconUrl.trim();
      db.faviconUrl = cleanUrl;
      if (db.siteSettings) {
        db.siteSettings.faviconUrl = cleanUrl;
      }
      saveDb(db);
      return res.json({ success: true, faviconUrl: cleanUrl });
    }
    res.status(400).json({ error: 'Invalid favicon image payload' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favicon/reset', requireAdminAuth, (req, res) => {
  db.faviconUrl = null;
  if (db.siteSettings) {
    db.siteSettings.faviconUrl = null;
  }
  saveDb(db);
  res.json({ success: true, message: 'Favicon reset to default' });
});

// 8. AI Description Generation endpoint for project cards (Protected)
app.post('/api/generate-description', requireAdminAuth, async (req, res) => {
  try {
    const { title, category, year, deliverables } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const prompt = `You are an expert commercial design copywriter writing a concise, punchy 2-sentence description for the portfolio of Saify Samit (a top-tier graphics artist with 6+ years of commercial and esports design experience).

Project Title: "${title}"
Category: "${category || 'Commercial Design'}"
Year: "${year || '2026'}"
Key Deliverables: "${deliverables || 'Visual identity and digital campaign assets'}"

Guidelines:
- Write exactly 2 compelling sentences describing the visual execution and commercial impact.
- Sound authoritative, professional, and visually sophisticated (like an elite design agency).
- Keep it under 40 words total.
- Return plain text only. Do not use quotation marks, markdown headers, or bullet points.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const description = response.text?.trim() || '';
    if (description) {
      return res.json({ description });
    }

    throw new Error('Empty AI response');
  } catch (error: any) {
    console.error('Gemini API description generation error:', error?.message || error);

    // Smart contextual fallback based on title and category
    const title = req.body?.title || 'Commercial Project';
    const category = req.body?.category || 'Visual Design';
    const fallbackDescription = `${title} is a precision-engineered ${category.toLowerCase()} suite crafted with surgical composition and bold typography. Developed for high-visibility multi-channel deployment, it establishes instant commercial authority.`;

    return res.json({ description: fallbackDescription, fallback: true });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 3000, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
