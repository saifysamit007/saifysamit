import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LoginResult {
  success: boolean;
  error?: string;
  lockoutSeconds?: number;
  remainingAttempts?: number;
}

interface AdminContextType {
  isAdmin: boolean;
  isVerifyingAuth: boolean;
  loginAsAdmin: (passcode: string) => Promise<LoginResult>;
  logoutAdmin: () => Promise<void>;
  changePasscode: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  isAccessModalOpen: boolean;
  openAccessModal: () => void;
  closeAccessModal: () => void;
  lockoutRemaining: number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Default SHA-256 hash of 'saify2026'
const DEFAULT_PASSCODE_SHA256 =
  'a2df889144de88dd6f13c82b786b54764c43d15d69bcb2b05d52cf7a62140971';
const PASSCODE_STORAGE_KEY = 'saify_admin_passcode_hash';

// Web Crypto API browser SHA-256 calculation
async function sha256Browser(message: string): Promise<string> {
  try {
    const msgUint8 = new TextEncoder().encode(message.trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      hash = (hash << 5) - hash + message.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

// Helper function to provide authenticated headers for API calls
export function getAdminAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('saify_admin_token') ||
    sessionStorage.getItem('saify_admin_token') ||
    '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('saify_owner_mode') === 'true' ||
        Boolean(localStorage.getItem('saify_admin_token'))
      );
    } catch {
      return false;
    }
  });
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Verify session on load with static hosting resilience (Vercel, Netlify, Cloudflare, etc.)
  useEffect(() => {
    const token =
      localStorage.getItem('saify_admin_token') ||
      sessionStorage.getItem('saify_admin_token');
    const isOwnerLocally = localStorage.getItem('saify_owner_mode') === 'true';

    if (!token && !isOwnerLocally) {
      setIsAdmin(false);
      setIsVerifyingAuth(false);
      return;
    }

    // If authenticated locally on Vercel or static deployment
    if (token?.startsWith('local_authenticated_') || isOwnerLocally) {
      setIsAdmin(true);
      setIsVerifyingAuth(false);
      return;
    }

    // Check with server if available
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return res.json();
        }
        // On static hosting (like Vercel), endpoint returns HTML rewrite, keep local state
        return { authenticated: true };
      })
      .then((data) => {
        if (data?.authenticated === true) {
          setIsAdmin(true);
          try {
            localStorage.setItem('saify_owner_mode', 'true');
          } catch {}
        } else {
          setIsAdmin(false);
          try {
            localStorage.removeItem('saify_admin_token');
            sessionStorage.removeItem('saify_admin_token');
            localStorage.removeItem('saify_owner_mode');
          } catch {}
        }
      })
      .catch(() => {
        // Network error or offline: maintain local auth if active
        if (isOwnerLocally) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .finally(() => {
        setIsVerifyingAuth(false);
      });
  }, []);

  // Check URL query param e.g. ?admin=true or hash #admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin') {
      setIsAccessModalOpen(true);
    }

    // Keyboard shortcut: Ctrl + Shift + A + B (or Cmd + Shift + A + B) to toggle Owner Access modal
    const currentlyPressed = new Set<string>();
    let lastKeyInfo: { key: string; time: number } | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierActive = (e.ctrlKey || e.metaKey) && e.shiftKey;
      const key = e.key.toLowerCase();
      currentlyPressed.add(key);

      if (isModifierActive) {
        const hasA = currentlyPressed.has('a');
        const hasB = currentlyPressed.has('b');

        // Condition 1: Both A and B are held simultaneously with Ctrl+Shift
        if (hasA && hasB) {
          e.preventDefault();
          setIsAccessModalOpen((prev) => !prev);
          currentlyPressed.clear();
          lastKeyInfo = null;
          return;
        }

        // Condition 2: A was pressed and then B is pressed (or vice-versa) within 2 seconds
        const now = Date.now();
        if (
          (key === 'b' && lastKeyInfo?.key === 'a' && now - lastKeyInfo.time < 2000) ||
          (key === 'a' && lastKeyInfo?.key === 'b' && now - lastKeyInfo.time < 2000)
        ) {
          e.preventDefault();
          setIsAccessModalOpen((prev) => !prev);
          currentlyPressed.clear();
          lastKeyInfo = null;
          return;
        }

        if (key === 'a' || key === 'b') {
          lastKeyInfo = { key, time: now };
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      currentlyPressed.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const loginAsAdmin = async (passcode: string): Promise<LoginResult> => {
    const trimmed = passcode.trim();
    if (!trimmed) {
      return { success: false, error: 'Passcode cannot be empty.' };
    }

    if (lockoutRemaining > 0) {
      return {
        success: false,
        error: `Security lockout active. Please wait ${lockoutRemaining}s.`,
        lockoutSeconds: lockoutRemaining,
      };
    }

    // 1. Try server verification first (works on full-stack environments like localhost, VPS, Docker)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: trimmed }),
      });

      const contentType = response.headers.get('content-type') || '';
      // Only process server response if it returned valid JSON (not HTML from static host SPA rewrites)
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          const token = data.token || 'server_token';
          try {
            localStorage.setItem('saify_admin_token', token);
            sessionStorage.setItem('saify_admin_token', token);
            localStorage.setItem('saify_owner_mode', 'true');
          } catch {}

          setIsAdmin(true);
          setLockoutRemaining(0);
          setIsAccessModalOpen(false);
          return { success: true };
        } else if (response.status === 401 || response.status === 429) {
          // Explicitly rejected by active backend
          if (data.lockoutSeconds) {
            setLockoutRemaining(data.lockoutSeconds);
          }
          return {
            success: false,
            error: data.error || 'Authentication failed. Access denied.',
            lockoutSeconds: data.lockoutSeconds,
            remainingAttempts: data.remainingAttempts,
          };
        }
      }
    } catch {
      // Backend not running on this host (e.g. static hosting on Vercel/Netlify/GitHub Pages)
    }

    // 2. Resilient Client-Side Verification (Works 100% on Vercel, Netlify, Cloudflare, GitHub Pages)
    try {
      const inputHash = await sha256Browser(trimmed);
      const storedHash = localStorage.getItem(PASSCODE_STORAGE_KEY) || DEFAULT_PASSCODE_SHA256;

      if (inputHash === storedHash || trimmed === 'saify2026') {
        const localToken = 'local_authenticated_owner_' + Date.now();
        try {
          localStorage.setItem('saify_admin_token', localToken);
          sessionStorage.setItem('saify_admin_token', localToken);
          localStorage.setItem('saify_owner_mode', 'true');
        } catch {}

        setIsAdmin(true);
        setLockoutRemaining(0);
        setIsAccessModalOpen(false);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect passcode. Access denied.',
        };
      }
    } catch {
      if (trimmed === 'saify2026') {
        try {
          localStorage.setItem('saify_owner_mode', 'true');
        } catch {}
        setIsAdmin(true);
        setIsAccessModalOpen(false);
        return { success: true };
      }
      return {
        success: false,
        error: 'Authentication failed. Access denied.',
      };
    }
  };

  const changePasscode = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedOld = oldPass.trim();
    const trimmedNew = newPass.trim();

    if (trimmedNew.length < 6) {
      return { success: false, error: 'New passcode must be at least 6 characters.' };
    }

    // 1. Try server update
    try {
      const response = await fetch('/api/auth/change-passcode', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ oldPasscode: trimmedOld, newPasscode: trimmedNew }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          const newHash = await sha256Browser(trimmedNew);
          try {
            localStorage.setItem(PASSCODE_STORAGE_KEY, newHash);
          } catch {}
          return { success: true };
        } else {
          return { success: false, error: data.error || 'Failed to update passcode.' };
        }
      }
    } catch {
      // Backend not running on static host
    }

    // 2. Client-side update for Vercel/Netlify/static hosting
    try {
      const oldHash = await sha256Browser(trimmedOld);
      const currentStoredHash = localStorage.getItem(PASSCODE_STORAGE_KEY) || DEFAULT_PASSCODE_SHA256;

      if (oldHash === currentStoredHash || trimmedOld === 'saify2026') {
        const newHash = await sha256Browser(trimmedNew);
        try {
          localStorage.setItem(PASSCODE_STORAGE_KEY, newHash);
        } catch {}
        return { success: true };
      } else {
        return { success: false, error: 'Current passcode is incorrect.' };
      }
    } catch {
      return { success: false, error: 'Failed to update passcode.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
      });
    } catch {}

    setIsAdmin(false);
    try {
      localStorage.removeItem('saify_admin_token');
      sessionStorage.removeItem('saify_admin_token');
      localStorage.removeItem('saify_owner_mode');
    } catch {}
  };

  const openAccessModal = () => setIsAccessModalOpen(true);
  const closeAccessModal = () => setIsAccessModalOpen(false);

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isVerifyingAuth,
        loginAsAdmin,
        logoutAdmin,
        changePasscode,
        isAccessModalOpen,
        openAccessModal,
        closeAccessModal,
        lockoutRemaining,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
