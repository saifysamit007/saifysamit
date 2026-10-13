import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// In-memory fallback and db reader
function readDb() {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'db.json');
    if (fs.existsSync(dbPath)) {
      const content = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json in Vercel function:', err);
  }
  return {
    projects: null,
    heroBackgrounds: null,
    services: null,
    testimonials: null,
    siteSettings: null,
  };
}

export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = req.url || '';
  const pathname = url.split('?')[0];
  const db = readDb();

  // Route: /api/db-status
  if (pathname.endsWith('/db-status')) {
    return res.status(200).json({
      status: 'operational',
      environment: 'Vercel Serverless Function',
      storage: 'Persistent JSON Store & Client Cache',
    });
  }

  // Route: /api/auth/login
  if (pathname.endsWith('/auth/login') && req.method === 'POST') {
    const body = req.body || {};
    const passcode = body.passcode || '';
    if (passcode === 'saify2026') {
      const token = 'vercel_admin_token_' + crypto.randomBytes(16).toString('hex');
      return res.status(200).json({
        success: true,
        token,
        expiresIn: 604800,
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Incorrect owner passcode.',
    });
  }

  // Route: /api/hero-backgrounds
  if (pathname.endsWith('/hero-backgrounds')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        backgrounds: db.heroBackgrounds || [],
      });
    }
    return res.status(200).json({ success: true });
  }

  // Route: /api/projects
  if (pathname.endsWith('/projects')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        projects: db.projects || [],
      });
    }
    return res.status(200).json({ success: true });
  }

  // Route: /api/services
  if (pathname.endsWith('/services')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        services: db.services || null,
      });
    }
    return res.status(200).json({ success: true });
  }

  // Route: /api/testimonials
  if (pathname.endsWith('/testimonials')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        testimonials: db.testimonials || null,
      });
    }
    return res.status(200).json({ success: true });
  }

  // Route: /api/site-settings
  if (pathname.endsWith('/site-settings')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        settings: db.siteSettings || null,
      });
    }
    return res.status(200).json({ success: true });
  }

  // Route: /api/about
  if (pathname.endsWith('/about')) {
    if (req.method === 'GET') {
      return res.status(200).json({
        portraitImage: db.portraitImage || null,
        portraitFraming: db.portraitFraming || null,
        artistProfile: db.artistProfile || null,
      });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'TSAM Portfolio API',
  });
}
